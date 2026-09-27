"use client"

import { Home, BookOpen, Target, HelpCircle, BarChart3, Shield, Menu, X, UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ParaguayFlag } from "@/components/paraguay-flag"
import type { ActiveModule } from "@/app/page"
import { useState } from "react"

interface WebHeaderProps {
  readonly activeModule: ActiveModule
  readonly onNavigate: (module: ActiveModule) => void
  readonly userName?: string
}

const navItems = [
  { id: "dashboard" as const, icon: Home, label: "Inicio", color: "bg-[#0038A8]" },
  { id: "training" as const, icon: BookOpen, label: "Capacitación", color: "bg-[#CE1126]" },
  { id: "quiz" as const, icon: HelpCircle, label: "Evaluación", color: "bg-[#CE1126]" },
  { id: "simulation" as const, icon: Target, label: "Simulación", color: "bg-[#0038A8]" },
  { id: "progress" as const, icon: BarChart3, label: "Progreso", color: "bg-[#0038A8]" },
  { id: "profile" as const, icon: UserCircle, label: "Mi Perfil", color: "bg-[#CE1126]" },
]

export function WebHeader({ activeModule, onNavigate, userName = "Usuario" }: WebHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="md:hidden sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      {/* Flag stripe */}
      <div className="flex w-full h-1">
        <div className="flex-1 bg-[#CE1126]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#0038A8]" />
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#CE1126] via-white to-[#0038A8] p-0.5 shadow-sm">
            <div className="w-full h-full rounded-md bg-card flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#0038A8]" />
            </div>
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-foreground leading-tight">TRECK</h1>
            <div className="text-[8px] text-muted-foreground leading-tight">
              <div><span className="font-semibold">T</span>ecnología <span className="font-semibold">R</span>iesgo <span className="font-semibold">E</span>ducación <span className="font-semibold">C</span>onciencia <span className="font-semibold">K</span>now</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ParaguayFlag className="w-7 h-5 rounded-sm shadow-sm" />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label={menuOpen ? "Cerrar menu" : "Abrir menu"}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="px-4 pb-4 space-y-1.5 border-t border-border pt-3">
          <div className="mb-2 rounded-xl border border-border bg-muted/50 px-3 py-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0038A8] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
              {initials || <UserCircle className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Cuenta</p>
              <p className="text-sm font-medium truncate">{userName}</p>
            </div>
          </div>
          {navItems.map((item) => {
            const isActive = activeModule === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id)
                  setMenuOpen(false)
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? `${item.color} text-white shadow-md`
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            )
          })}

        </nav>
      )}
    </header>
  )
}
