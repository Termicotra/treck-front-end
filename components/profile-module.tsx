"use client"

import { useRouter } from "next/navigation"
import { useState, type SyntheticEvent } from "react"
import { User, Lock, Eye, EyeOff, Shield, CheckCircle, AlertCircle, Camera, LogOut } from "lucide-react"
import { ParaguayFlagBanner } from "@/components/paraguay-flag"
import { cn } from "@/lib/utils"
import {
  type AuthSession,
  type AuthUserProfile,
  changePasswordWithApi,
  clearAuthSession,
  getAuthDisplayName,
  getAuthUserProfile,
} from "@/lib/auth"

interface ProfileModuleProps {
  session: AuthSession | null
}

function getInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  return initials || "U"
}

function toUserData(profile: AuthUserProfile, fallbackName: string) {
  return {
    name: profile.name ?? fallbackName,
    username: profile.username ?? "",
    email: profile.email ?? "",
  }
}

function getPasswordStrength(password: string) {
  if (password.length >= 12 && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)) {
    return 4
  }

  if (password.length >= 8 && (/[A-Z]/.test(password) || /\d/.test(password))) {
    return 3
  }

  if (password.length >= 6) {
    return 2
  }

  return 1
}

function getPasswordStrengthLabel(password: string) {
  if (password.length < 6) return "Muy corta"
  if (password.length < 8) return "Débil — agrega más caracteres"
  if (/[A-Z]/.test(password) && /\d/.test(password)) {
    return /[^A-Za-z0-9]/.test(password) ? "Muy fuerte" : "Fuerte"
  }

  return "Moderada — agrega mayúsculas o números"
}

function getStrengthBarClass(level: number, strength: number) {
  if (level > strength) return "bg-muted"
  if (strength === 1) return "bg-[#CE1126]"
  if (strength === 2) return "bg-orange-400"
  if (strength === 3) return "bg-yellow-400"
  return "bg-green-500"
}

export function ProfileModule({ session }: Readonly<ProfileModuleProps>) {
  const router = useRouter()
  const profile = getAuthUserProfile(session)
  const displayName = getAuthDisplayName(session)
  const profileData = toUserData(profile, displayName)
  const [passForm, setPassForm] = useState({ current: "", next: "", confirm: "" })
  const [passErrors, setPassErrors] = useState<Record<string, string>>({})
  const [passSuccess, setPassSuccess] = useState(false)
  const [passLoading, setPassLoading] = useState(false)
  const [showPass, setShowPass] = useState({ current: false, next: false, confirm: false })

  const validatePass = () => {
    const errs: Record<string, string> = {}
    if (!passForm.current) errs.current = "Ingresa tu contraseña actual."
    if (!passForm.next) errs.next = "Ingresa la nueva contraseña."
    else if (passForm.next.length < 6) errs.next = "Mínimo 6 caracteres."
    if (passForm.next !== passForm.confirm) errs.confirm = "Las contraseñas no coinciden."
    if (passForm.current === passForm.next && passForm.next) errs.next = "La nueva contraseña debe ser diferente."
    setPassErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handlePassSave = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validatePass()) return

    setPassLoading(true)
    try {
      await changePasswordWithApi(
        {
          currentPassword: passForm.current,
          newPassword: passForm.next,
          newPasswordConfirm: passForm.confirm,
        },
        session?.tokens.access ?? null,
      )

      setPassSuccess(true)
      setPassForm({ current: "", next: "", confirm: "" })
      window.setTimeout(() => setPassSuccess(false), 3000)
    } catch (error) {
      setPassErrors({ current: error instanceof Error ? error.message : "No se pudo cambiar la contraseña." })
    } finally {
      setPassLoading(false)
    }
  }

  const initials = getInitials(profileData.name || displayName)

  const handleLogout = () => {
    clearAuthSession()
    router.replace("/login")
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-6 rounded-full bg-[#0038A8]" />
          <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-3">
          Administra tu información personal y configuración de seguridad.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <ParaguayFlagBanner />
        <div className="p-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0038A8] to-[#CE1126] flex items-center justify-center shadow-lg">
              <span className="text-2xl font-extrabold text-white">{initials || "U"}</span>
            </div>
            <button
              type="button"
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors shadow-sm"
              aria-label="Cambiar avatar"
            >
              <Camera className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-bold text-foreground">{profileData.name || displayName || "Usuario"}</h2>
            <p className="text-sm text-muted-foreground">{profileData.email || profile.email || "No disponible"}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 bg-[#0038A8]/10 text-[#0038A8] text-xs font-medium px-3 py-1 rounded-full">
              <Shield className="w-3 h-3" />
              Estudiante TRECK
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 pt-5 pb-4 border-b border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0038A8]/10 flex items-center justify-center">
            <User className="w-4.5 h-4.5 text-[#0038A8]" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Información Personal</h3>
            <p className="text-xs text-muted-foreground">Solo lectura con los datos asociados a tu sesión actual.</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background px-4 py-3">
              <p className="text-xs text-muted-foreground">Nombre completo</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{profileData.name || displayName || "No disponible"}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-3">
              <p className="text-xs text-muted-foreground">Username</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{profile.username || "No disponible"}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-3 md:col-span-2">
              <p className="text-xs text-muted-foreground">Correo electrónico</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{profileData.email || "No disponible"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 pt-5 pb-4 border-b border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#CE1126]/10 flex items-center justify-center">
            <Lock className="w-4.5 h-4.5 text-[#CE1126]" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Cambiar Contraseña</h3>
            <p className="text-xs text-muted-foreground">Elige una contraseña segura de al menos 6 caracteres.</p>
          </div>
        </div>

        <form onSubmit={handlePassSave} noValidate className="p-6 space-y-5">
          {(
            [
              { key: "current" as const, label: "Contraseña actual", placeholder: "••••••••" },
              { key: "next" as const, label: "Nueva contraseña", placeholder: "••••••••" },
              { key: "confirm" as const, label: "Confirmar nueva contraseña", placeholder: "••••••••" },
            ] as const
          ).map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor={`pass-${key}`}>
                {label}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id={`pass-${key}`}
                  type={showPass[key] ? "text" : "password"}
                  value={passForm[key]}
                  onChange={(e) => {
                    setPassForm((current) => ({ ...current, [key]: e.target.value }))
                    setPassErrors((current) => ({ ...current, [key]: "" }))
                  }}
                  placeholder={placeholder}
                  className={cn(
                    "w-full pl-10 pr-10 py-3 rounded-xl border bg-background text-foreground text-sm outline-none transition-all",
                    "focus:ring-2 focus:ring-[#CE1126]/40 focus:border-[#CE1126]",
                    passErrors[key] ? "border-[#CE1126] focus:ring-[#CE1126]/30" : "border-border",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((current) => ({ ...current, [key]: !current[key] }))}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPass[key] ? "Ocultar" : "Mostrar"}
                >
                  {showPass[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passErrors[key] && (
                <p className="text-xs text-[#CE1126] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {passErrors[key]}
                </p>
              )}
            </div>
          ))}

          {passForm.next && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Fortaleza de la contraseña</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => {
                  const strength = getPasswordStrength(passForm.next)
                  return (
                    <div key={level} className={cn("h-1.5 flex-1 rounded-full transition-all", getStrengthBarClass(level, strength))} />
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground">{getPasswordStrengthLabel(passForm.next)}</p>
            </div>
          )}

          {passSuccess && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl px-4 py-3 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Contraseña actualizada correctamente.
            </div>
          )}

          <button
            type="submit"
            disabled={passLoading}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all duration-200",
              "bg-[#CE1126] hover:bg-[#a80e1e] active:scale-[0.98] shadow-md shadow-[#CE1126]/20",
              passLoading && "opacity-70 cursor-not-allowed",
            )}
          >
            {passLoading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            Cambiar contraseña
          </button>
        </form>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-xl border border-[#CE1126]/30 bg-[#CE1126]/10 px-4 py-2.5 text-sm font-semibold text-[#CE1126] hover:bg-[#CE1126] hover:text-white transition-all"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}