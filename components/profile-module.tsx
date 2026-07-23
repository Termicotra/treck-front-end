"use client"

import { useState } from "react"
import { User, Mail, Lock, Eye, EyeOff, Shield, Save, CheckCircle, AlertCircle, Camera } from "lucide-react"
import { ParaguayFlagBanner } from "@/components/paraguay-flag"
import { cn } from "@/lib/utils"

interface UserData {
  name: string
  email: string
}

interface ProfileModuleProps {
  user: UserData
  onUpdateUser: (data: UserData) => void
}

export function ProfileModule({ user, onUpdateUser }: ProfileModuleProps) {
  const [profileForm, setProfileForm] = useState({ name: user.name ?? "", email: user.email ?? "" })
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({})
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)

  const [passForm, setPassForm] = useState({ current: "", next: "", confirm: "" })
  const [passErrors, setPassErrors] = useState<Record<string, string>>({})
  const [passSuccess, setPassSuccess] = useState(false)
  const [passLoading, setPassLoading] = useState(false)
  const [showPass, setShowPass] = useState({ current: false, next: false, confirm: false })

  // --- Validation ---
  const validateProfile = () => {
    const errs: Record<string, string> = {}
    if (!profileForm.name.trim()) errs.name = "El nombre no puede estar vacío."
    if (!profileForm.email.trim()) errs.email = "Ingresa un correo electrónico."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) errs.email = "Correo no válido."
    setProfileErrors(errs)
    return Object.keys(errs).length === 0
  }

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

  // --- Handlers ---
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateProfile()) return
    setProfileLoading(true)
    setTimeout(() => {
      onUpdateUser({ name: profileForm.name, email: profileForm.email })
      setProfileLoading(false)
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    }, 1000)
  }

  const handlePassSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePass()) return
    setPassLoading(true)
    setTimeout(() => {
      setPassLoading(false)
      setPassSuccess(true)
      setPassForm({ current: "", next: "", confirm: "" })
      setTimeout(() => setPassSuccess(false), 3000)
    }, 1000)
  }

  const initials = (profileForm.name || "")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-6 rounded-full bg-[#0038A8]" />
          <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-3">
          Administra tu información personal y configuración de seguridad.
        </p>
      </div>

      {/* Avatar card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <ParaguayFlagBanner />
        <div className="p-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0038A8] to-[#CE1126] flex items-center justify-center shadow-lg">
              <span className="text-2xl font-extrabold text-white">{initials || "U"}</span>
            </div>
            <button
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors shadow-sm"
              aria-label="Cambiar avatar"
            >
              <Camera className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-bold text-foreground">{user.name || "Usuario"}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 bg-[#0038A8]/10 text-[#0038A8] text-xs font-medium px-3 py-1 rounded-full">
              <Shield className="w-3 h-3" />
              Estudiante TRECK
            </div>
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 pt-5 pb-4 border-b border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0038A8]/10 flex items-center justify-center">
            <User className="w-4.5 h-4.5 text-[#0038A8]" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Información Personal</h3>
            <p className="text-xs text-muted-foreground">Actualiza tu nombre y correo electrónico.</p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} noValidate className="p-6 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="prof-name">Nombre completo</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                <User className="w-4 h-4" />
              </span>
              <input
                id="prof-name"
                type="text"
                value={profileForm.name}
                onChange={(e) => { setProfileForm((f) => ({ ...f, name: e.target.value })); setProfileErrors((er) => ({ ...er, name: "" })) }}
                placeholder="Juan Perez"
                className={cn(
                  "w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-foreground text-sm outline-none transition-all",
                  "focus:ring-2 focus:ring-[#0038A8]/40 focus:border-[#0038A8]",
                  profileErrors.name ? "border-[#CE1126] focus:ring-[#CE1126]/30 focus:border-[#CE1126]" : "border-border",
                )}
              />
            </div>
            {profileErrors.name && <p className="text-xs text-[#CE1126] flex items-center gap-1"><AlertCircle className="w-3 h-3" />{profileErrors.name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="prof-email">Correo electrónico</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="prof-email"
                type="email"
                value={profileForm.email}
                onChange={(e) => { setProfileForm((f) => ({ ...f, email: e.target.value })); setProfileErrors((er) => ({ ...er, email: "" })) }}
                placeholder="correo@ejemplo.com"
                className={cn(
                  "w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-foreground text-sm outline-none transition-all",
                  "focus:ring-2 focus:ring-[#0038A8]/40 focus:border-[#0038A8]",
                  profileErrors.email ? "border-[#CE1126] focus:ring-[#CE1126]/30 focus:border-[#CE1126]" : "border-border",
                )}
              />
            </div>
            {profileErrors.email && <p className="text-xs text-[#CE1126] flex items-center gap-1"><AlertCircle className="w-3 h-3" />{profileErrors.email}</p>}
          </div>

          {/* Success / submit */}
          {profileSuccess && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl px-4 py-3 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Datos actualizados correctamente.
            </div>
          )}

          <button
            type="submit"
            disabled={profileLoading}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all duration-200",
              "bg-[#0038A8] hover:bg-[#002d8a] active:scale-[0.98] shadow-md shadow-[#0038A8]/20",
              profileLoading && "opacity-70 cursor-not-allowed",
            )}
          >
            {profileLoading
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Save className="w-4 h-4" />
            }
            Guardar cambios
          </button>
        </form>
      </div>

      {/* Change password */}
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
              <label className="text-sm font-medium text-foreground" htmlFor={`pass-${key}`}>{label}</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id={`pass-${key}`}
                  type={showPass[key] ? "text" : "password"}
                  value={passForm[key]}
                  onChange={(e) => { setPassForm((f) => ({ ...f, [key]: e.target.value })); setPassErrors((er) => ({ ...er, [key]: "" })) }}
                  placeholder={placeholder}
                  className={cn(
                    "w-full pl-10 pr-10 py-3 rounded-xl border bg-background text-foreground text-sm outline-none transition-all",
                    "focus:ring-2 focus:ring-[#CE1126]/40 focus:border-[#CE1126]",
                    passErrors[key] ? "border-[#CE1126] focus:ring-[#CE1126]/30" : "border-border",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => ({ ...s, [key]: !s[key] }))}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPass[key] ? "Ocultar" : "Mostrar"}
                >
                  {showPass[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passErrors[key] && (
                <p className="text-xs text-[#CE1126] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{passErrors[key]}
                </p>
              )}
            </div>
          ))}

          {/* Password strength hint */}
          {passForm.next && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Fortaleza de la contraseña</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => {
                  const strength =
                    passForm.next.length >= 12 && /[A-Z]/.test(passForm.next) && /[0-9]/.test(passForm.next) && /[^A-Za-z0-9]/.test(passForm.next)
                      ? 4
                      : passForm.next.length >= 8 && (/[A-Z]/.test(passForm.next) || /[0-9]/.test(passForm.next))
                      ? 3
                      : passForm.next.length >= 6
                      ? 2
                      : 1
                  return (
                    <div
                      key={level}
                      className={cn(
                        "h-1.5 flex-1 rounded-full transition-all",
                        level <= strength
                          ? strength === 1 ? "bg-[#CE1126]" : strength === 2 ? "bg-orange-400" : strength === 3 ? "bg-yellow-400" : "bg-green-500"
                          : "bg-muted",
                      )}
                    />
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {passForm.next.length < 6
                  ? "Muy corta"
                  : passForm.next.length < 8
                  ? "Débil — agrega más caracteres"
                  : /[A-Z]/.test(passForm.next) && /[0-9]/.test(passForm.next)
                  ? /[^A-Za-z0-9]/.test(passForm.next)
                    ? "Muy fuerte"
                    : "Fuerte"
                  : "Moderada — agrega mayúsculas o números"}
              </p>
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
            {passLoading
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Lock className="w-4 h-4" />
            }
            Cambiar contraseña
          </button>
        </form>
      </div>
    </div>
  )
}
