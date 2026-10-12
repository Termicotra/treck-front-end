"use client"

import { useState, type ReactNode, type SyntheticEvent } from "react"
import { useRouter } from "next/navigation"
import { Shield, Eye, EyeOff, Lock, ArrowRight, UserPlus, Mail, Check, X, Mail as MailIcon } from "lucide-react"
import { ParaguayFlag, ParaguayFlagBanner } from "@/components/paraguay-flag"
import { cn } from "@/lib/utils"
import { AuthApiError, clearAuthSession, loginWithApi, registerWithApi, saveAuthSession } from "@/lib/auth"

function isValidEmail(email: string) {
  const value = email.trim()
  const atIndex = value.indexOf("@")
  const dotIndex = value.lastIndexOf(".")

  return atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < value.length - 1
}

function getPlaceholder(key: keyof { username: string; email: string; password: string; confirm: string }) {
  if (key === "username") return "juan.perez"
  if (key === "email") return "correo@ejemplo.com"
  return "••••••••"
}

function isDuplicateFieldError(error: AuthApiError, field: "username" | "email") {
  const details = error.details
  const message = error.message.toLowerCase()

  if (field === "username") {
    return (
      (typeof details === "object" && details !== null && "username" in details) ||
      message.includes("username") ||
      message.includes("usuario")
    )
  }

  return (
    (typeof details === "object" && details !== null && "email" in details) ||
    message.includes("email")
  )
}

function validatePasswordRequirements(password: string, username: string) {
  return {
    minLength: password.length >= 8,
    notAllNumbers: !/^\d+$/.test(password),
    notSimilarToUsername: password.toLowerCase() !== username.toLowerCase() && !password.toLowerCase().includes(username.toLowerCase()),
  }
}

function PasswordRequirements({ password, username }: { password: string; username: string }) {
  const reqs = validatePasswordRequirements(password, username)
  const allMet = Object.values(reqs).every((v) => v)

  return (
    <div className="mt-3 bg-muted/50 rounded-lg p-3 border border-border space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Requisitos de contraseña:</p>
      <div className="space-y-1.5">
        {[
          { label: "Mínimo 8 caracteres", met: reqs.minLength },
          { label: "No puede ser solo números", met: reqs.notAllNumbers },
          { label: "No puede ser similar al usuario", met: reqs.notSimilarToUsername },
        ].map((req) => (
          <div key={req.label} className="flex items-center gap-2">
            {req.met ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <X className="w-4 h-4 text-red-500" />
            )}
            <span className={cn("text-xs", req.met ? "text-green-700" : "text-red-600")}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground pt-2 border-t border-border">
        Nota: El servidor también rechaza contraseñas muy comunes.
      </p>
    </div>
  )
}

export function LoginScreen() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverMessage, setServerMessage] = useState<string | null>(null)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.username.trim()) next.username = "Ingresa un nombre de usuario."

    if (mode === "register") {
      if (form.username.trim().length < 3) next.username = "Mínimo 3 caracteres."
      if (form.email.trim() && !isValidEmail(form.email)) next.email = "Correo no válido."
      if (form.password !== form.confirm) next.confirm = "Las contraseñas no coinciden."
      if (form.password.length < 8) next.password = "Mínimo 8 caracteres."

      const reqs = validatePasswordRequirements(form.password, form.username)
      if (!reqs.notAllNumbers) next.password = "No puede ser solo números."
      if (!reqs.notSimilarToUsername) next.password = "No puede ser similar al usuario."
    }

    if (!form.password) next.password = "Ingresa una contraseña."

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const applyRegistrationError = (error: unknown) => {
    if (error instanceof AuthApiError) {
      if (isDuplicateFieldError(error, "username")) {
        setErrors((current) => ({
          ...current,
          username: "Este nombre de usuario ya está en uso.",
        }))
        setServerMessage("El nombre de usuario ya existe.")
        return true
      }

      if (isDuplicateFieldError(error, "email")) {
        setErrors((current) => ({
          ...current,
          email: "Este correo ya está en uso.",
        }))
        setServerMessage("El correo ya existe.")
        return true
      }
    }

    return false
  }

  const submitLogin = async () => {
    const session = await loginWithApi({
      username: form.username.trim().toLowerCase(),
      password: form.password,
    })

    saveAuthSession(session)
    router.replace("/")
  }

  const submitRegister = async () => {
    const session = await registerWithApi({
      username: form.username.trim(),
      email: form.email.trim() || undefined,
      password: form.password,
      passwordConfirm: form.confirm,
    })

    if (session) {
      saveAuthSession(session)
      router.replace("/")
      return
    }

    clearAuthSession()
    setMode("login")
    setForm((current) => ({ ...current, password: "", confirm: "" }))
    setServerMessage("Cuenta creada. Ahora puedes iniciar sesión.")
  }

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setServerMessage(null)

    try {
      if (mode === "login") {
        await submitLogin()
      } else {
        await submitRegister()
      }
    } catch (error) {
      if (mode === "register" && applyRegistrationError(error)) {
        return
      }

      const message = error instanceof AuthApiError ? error.message : "No se pudo completar la operación."
      setServerMessage(message)
    } finally {
      setLoading(false)
    }
  }

  const field = (
    key: keyof typeof form,
    label: string,
    type: string,
    icon: ReactNode,
    extra?: ReactNode,
  ) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground" htmlFor={key}>
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        <input
          id={key}
          type={type}
          value={form[key]}
          onChange={(e) => {
            setForm((f) => ({ ...f, [key]: e.target.value }))
            setErrors((er) => ({ ...er, [key]: "" }))
            setServerMessage(null)
          }}
          placeholder={getPlaceholder(key)}
          className={cn(
            "w-full pl-10 pr-10 py-3 rounded-xl border bg-background text-foreground text-sm outline-none transition-all",
            "focus:ring-2 focus:ring-[#0038A8]/40 focus:border-[#0038A8]",
            errors[key] ? "border-[#CE1126] focus:ring-[#CE1126]/30 focus:border-[#CE1126]" : "border-border",
          )}
        />
        {extra && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer">
            {extra}
          </span>
        )}
      </div>
      {errors[key] && <p className="text-xs text-[#CE1126]">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen flex bg-muted/30">
      <div className="hidden lg:flex lg:w-1/2 bg-[#0038A8] relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#CE1126] rounded-full opacity-20" />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 bg-[#CE1126] rounded-full opacity-15" />
        <div className="absolute top-0 left-0 w-full h-2 flex">
          <div className="flex-1 bg-[#CE1126]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0038A8]" />
        </div>

        <div className="relative z-10 text-center space-y-8 max-w-sm">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shadow-2xl">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-5xl font-extrabold text-white tracking-tight">TRECK</h1>
            <p className="text-white/80 text-base leading-relaxed">
              Plataforma de capacitación en detección de phishing para usuarios paraguayos.
            </p>
          </div>

          <div className="space-y-3 text-left">
            {[
              "Módulo de Capacitación interactiva",
              "Simulaciones de ataques reales",
              "Evaluaciones con retroalimentación",
              "Seguimiento de tu progreso",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 border border-white/15">
                <div className="w-2 h-2 rounded-full bg-[#CE1126] flex-shrink-0" />
                <span className="text-white/90 text-sm">{feat}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2.5 pt-2">
            <ParaguayFlag className="w-8 h-5 rounded shadow" />
            <span className="text-white/70 text-sm">Hecho en Paraguay</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-2 flex">
          <div className="flex-1 bg-[#CE1126]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0038A8]" />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-screen">
        <div className="lg:hidden flex w-full h-1.5">
          <div className="flex-1 bg-[#CE1126]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0038A8]" />
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#CE1126] via-white to-[#0038A8] p-0.5 shadow-lg">
                <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#0038A8]" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-foreground">TRECK</h1>
                <p className="text-xs text-muted-foreground">Detección de Phishing</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
              <ParaguayFlagBanner />

              <div className="p-8 space-y-6">
                {serverMessage && (
                  <div className="rounded-xl border border-[#0038A8]/20 bg-[#0038A8]/5 px-4 py-3 text-sm text-[#0038A8]">
                    {serverMessage}
                  </div>
                )}

                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-foreground">
                    {mode === "login" ? "Bienvenido de vuelta" : "Crear cuenta"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {mode === "login"
                      ? "Ingresa tus credenciales para continuar tu capacitación."
                      : "Regístrate para comenzar a aprender sobre seguridad."}
                  </p>
                </div>

                <div className="flex bg-muted rounded-xl p-1">
                  {(["login", "register"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setMode(m)
                        setErrors({})
                        setServerMessage(null)
                      }}
                      className={cn(
                        "flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                        mode === m
                          ? "bg-[#0038A8] text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {m === "login" ? "Iniciar Sesión" : "Registrarse"}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {field("username", "Nombre de usuario", "text", <UserPlus className="w-4 h-4" />)}
                  {mode === "register" && field("email", "Correo electrónico (opcional)", "email", <Mail className="w-4 h-4" />)}
                  <div>
                    {field(
                      "password",
                      "Contraseña",
                      showPassword ? "text" : "password",
                      <Lock className="w-4 h-4" />,
                      <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="Mostrar contraseña">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>,
                    )}
                    {mode === "register" && form.password && (
                      <PasswordRequirements password={form.password} username={form.username} />
                    )}
                  </div>
                  {mode === "register" &&
                    field(
                      "confirm",
                      "Confirmar contraseña",
                      showConfirm ? "text" : "password",
                      <Lock className="w-4 h-4" />,
                      <button type="button" onClick={() => setShowConfirm((v) => !v)} aria-label="Mostrar confirmación">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>,
                    )}

                  {mode === "login" && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowForgotPasswordModal(true)}
                        className="text-xs text-[#0038A8] hover:underline"
                      >
                        Olvidé mi contraseña
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white text-sm transition-all duration-200",
                      "bg-[#0038A8] hover:bg-[#002d8a] active:scale-[0.98] shadow-lg shadow-[#0038A8]/25",
                      loading && "opacity-70 cursor-not-allowed",
                    )}
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              <ParaguayFlagBanner />
            </div>

            <div className="mt-6 flex items-center justify-center gap-2">
              <ParaguayFlag className="w-6 h-4 rounded-sm shadow-sm" />
              <p className="text-xs text-muted-foreground">TRECK — Plataforma educativa paraguaya</p>
            </div>
          </div>
        </div>

        <div className="lg:hidden flex w-full h-1.5">
          <div className="flex-1 bg-[#CE1126]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0038A8]" />
        </div>
      </div>

      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-[#0038A8] to-[#002d8a] px-6 py-4">
              <h3 className="text-lg font-bold text-white">Recuperar Contraseña</h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-lg bg-[#0038A8]/5 border border-[#0038A8]/20 p-4 space-y-3">
                <p className="text-sm text-foreground">
                  Para recuperar tu contraseña, comunícate con el administrador de TRECK. El equipo de soporte está disponible para ayudarte a restablecer tu acceso.
                </p>

                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex items-start gap-3">
                    <MailIcon className="w-5 h-5 text-[#0038A8] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Correo de Soporte</p>
                      <p className="text-sm text-foreground font-medium">Federicotraversi419@hotmail.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-xs text-amber-900 dark:text-amber-100">
                  💡 Proporciona tu nombre de usuario y correo registrado para que el administrador pueda verificar tu identidad.
                </p>
              </div>

              <button
                onClick={() => setShowForgotPasswordModal(false)}
                className={cn(
                  "w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200",
                  "bg-[#0038A8] hover:bg-[#002d8a] text-white active:scale-[0.98]",
                )}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
