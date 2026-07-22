"use client"

import { Home, BookOpen, Target, HelpCircle, BarChart3, Shield, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ParaguayFlag } from "@/components/paraguay-flag"
import type { ActiveModule } from "@/app/page"
import { useState } from "react"

interface WebHeaderProps {
  activeModule: ActiveModule
  onNavigate: (module: ActiveModule) => void
}

const navItems = [
  { id: "dashboard" as const, icon: Home, label: "Inicio", color: "bg-[#0038A8]" },
  { id: "training" as const, icon: BookOpen, label: "Aprender", color: "bg-[#CE1126]" },
  { id: "simulation" as const, icon: Target, label: "Practica", color: "bg-[#0038A8]" },
  { id: "quiz" as const, icon: HelpCircle, label: "Evaluar", color: "bg-[#CE1126]" },
  { id: "progress" as const, icon: BarChart3, label: "Progreso", color: "bg-[#0038A8]" },
]

export function WebHeader({ activeModule, onNavigate }: WebHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="md:hidden sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      {/* Flag stripe */}
      <div className="flex w-full h-1">
        <div className="flex-1 bg-[#CE1126]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#0038A8]" />
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#CE1126] via-white to-[#0038A8] p-0.5 shadow-sm">
            <div className="w-full h-full rounded-md bg-card flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#0038A8]" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground leading-tight">TRECK</h1>
            <p className="text-[10px] text-muted-foreground">Deteccion de Phishing</p>
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
