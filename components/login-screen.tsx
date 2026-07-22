"use client"

import { useState } from "react"
import { Shield, Eye, EyeOff, Mail, Lock, ArrowRight, UserPlus } from "lucide-react"
import { ParaguayFlag, ParaguayFlagBanner } from "@/components/paraguay-flag"
import { cn } from "@/lib/utils"

interface LoginScreenProps {
  onLogin: () => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const next: Record<string, string> = {}
    if (mode === "register" && !form.name.trim()) next.name = "Ingresa tu nombre completo."
    if (!form.email.trim()) next.email = "Ingresa un correo electrónico."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Correo no válido."
    if (!form.password) next.password = "Ingresa una contraseña."
    else if (form.password.length < 6) next.password = "Mínimo 6 caracteres."
    if (mode === "register" && form.password !== form.confirm) next.confirm = "Las contraseñas no coinciden."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onLogin()
    }, 1200)
  }

  const field = (
    key: keyof typeof form,
    label: string,
    type: string,
    icon: React.ReactNode,
    extra?: React.ReactNode,
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
          }}
          placeholder={
            key === "name"
              ? "Juan Perez"
              : key === "email"
                ? "correo@ejemplo.com"
                : key === "password"
                  ? "••••••••"
                  : "••••••••"
          }
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
      {/* Left panel — decorative (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0038A8] relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Diagonal red stripe */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#CE1126] rounded-full opacity-20" />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 bg-[#CE1126] rounded-full opacity-15" />
        <div className="absolute top-0 left-0 w-full h-2 flex">
          <div className="flex-1 bg-[#CE1126]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0038A8]" />
        </div>

        <div className="relative z-10 text-center space-y-8 max-w-sm">
          {/* Shield logo */}
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

          {/* Feature pills */}
          <div className="space-y-3 text-left">
            {[
              "Modulo de Capacitacion interactiva",
              "Simulaciones de ataques reales",
              "Evaluaciones con retroalimentacion",
              "Seguimiento de tu progreso",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 border border-white/15">
                <div className="w-2 h-2 rounded-full bg-[#CE1126] flex-shrink-0" />
                <span className="text-white/90 text-sm">{feat}</span>
              </div>
            ))}
          </div>

          {/* Flag */}
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

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top flag stripe (mobile) */}
        <div className="lg:hidden flex w-full h-1.5">
          <div className="flex-1 bg-[#CE1126]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0038A8]" />
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#CE1126] via-white to-[#0038A8] p-0.5 shadow-lg">
                <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#0038A8]" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-foreground">TRECK</h1>
                <p className="text-xs text-muted-foreground">Deteccion de Phishing</p>
              </div>
            </div>

            {/* Card */}
            <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
              {/* Card top stripe */}
              <ParaguayFlagBanner />

              <div className="p-8 space-y-6">
                {/* Heading */}
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-foreground">
                    {mode === "login" ? "Bienvenido de vuelta" : "Crear cuenta"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {mode === "login"
                      ? "Ingresa tus credenciales para continuar tu capacitacion."
                      : "Registrate para comenzar a aprender sobre seguridad."}
                  </p>
                </div>

                {/* Mode toggle */}
                <div className="flex bg-muted rounded-xl p-1">
                  {(["login", "register"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => { setMode(m); setErrors({}) }}
                      className={cn(
                        "flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                        mode === m
                          ? "bg-[#0038A8] text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {m === "login" ? "Iniciar Sesion" : "Registrarse"}
                    </button>
                  ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {mode === "register" &&
                    field("name", "Nombre completo", "text", <UserPlus className="w-4 h-4" />)}
                  {field("email", "Correo electronico", "email", <Mail className="w-4 h-4" />)}
                  {field(
                    "password",
                    "Contrasena",
                    showPassword ? "text" : "password",
                    <Lock className="w-4 h-4" />,
                    <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="Mostrar contrasena">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>,
                  )}
                  {mode === "register" &&
                    field(
                      "confirm",
                      "Confirmar contrasena",
                      showConfirm ? "text" : "password",
                      <Lock className="w-4 h-4" />,
                      <button type="button" onClick={() => setShowConfirm((v) => !v)} aria-label="Mostrar confirmacion">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>,
                    )}

                  {mode === "login" && (
                    <div className="flex justify-end">
                      <button type="button" className="text-xs text-[#0038A8] hover:underline">
                        Olvide mi contrasena
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
                        {mode === "login" ? "Iniciar Sesion" : "Crear Cuenta"}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">o</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Demo access */}
                <button
                  onClick={onLogin}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200",
                    "border-2 border-[#CE1126] text-[#CE1126] hover:bg-[#CE1126] hover:text-white active:scale-[0.98]",
                  )}
                >
                  <Shield className="w-4 h-4" />
                  Acceder como Invitado
                </button>
              </div>

              {/* Card bottom stripe */}
              <ParaguayFlagBanner />
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <ParaguayFlag className="w-6 h-4 rounded-sm shadow-sm" />
              <p className="text-xs text-muted-foreground">TRECK — Plataforma educativa paraguaya</p>
            </div>
          </div>
        </div>

        {/* Bottom flag stripe (mobile) */}
        <div className="lg:hidden flex w-full h-1.5">
          <div className="flex-1 bg-[#CE1126]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0038A8]" />
        </div>
      </div>
    </div>
  )
}
