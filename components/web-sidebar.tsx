"use client"

import { Home, BookOpen, Target, HelpCircle, BarChart3, Shield, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { ParaguayFlag, ParaguayFlagBanner } from "@/components/paraguay-flag"
import type { ActiveModule } from "@/app/page"
import { useState } from "react"

interface WebSidebarProps {
  activeModule: ActiveModule
  onNavigate: (module: ActiveModule) => void
}

const navItems = [
  { id: "dashboard" as const, icon: Home, label: "Inicio", color: "bg-[#0038A8]" },
  { id: "training" as const, icon: BookOpen, label: "Capacitacion", color: "bg-[#CE1126]" },
  { id: "simulation" as const, icon: Target, label: "Simulacion", color: "bg-[#0038A8]" },
  { id: "quiz" as const, icon: HelpCircle, label: "Evaluacion", color: "bg-[#CE1126]" },
  { id: "progress" as const, icon: BarChart3, label: "Progreso", color: "bg-[#0038A8]" },
]

export function WebSidebar({ activeModule, onNavigate }: WebSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen bg-card border-r border-border transition-all duration-300 sticky top-0",
        collapsed ? "w-20" : "w-64",
      )}
    >
      {/* Logo Area */}
      <div className="p-4 flex items-center gap-3 border-b border-border">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#CE1126] via-white to-[#0038A8] p-0.5 flex-shrink-0 shadow-md">
          <div className="w-full h-full rounded-lg bg-card flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#0038A8]" />
          </div>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold text-foreground tracking-tight">TRECK</h1>
            <p className="text-xs text-muted-foreground truncate">Deteccion de Phishing</p>
          </div>
        )}
      </div>

      {/* Flag Banner */}
      <div className="px-4 pt-3">
        <ParaguayFlagBanner />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 mt-2">
        {navItems.map((item) => {
          const isActive = activeModule === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? `${item.color} text-white shadow-lg`
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "drop-shadow-sm")} />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-3">
        {!collapsed && (
          <div className="flex items-center gap-2 justify-center">
            <ParaguayFlag className="w-6 h-4 rounded-sm" />
            <span className="text-xs text-muted-foreground">Hecho en Paraguay</span>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <ParaguayFlag className="w-6 h-4 rounded-sm" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground py-2 rounded-lg hover:bg-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Colapsar</span>}
        </button>
      </div>
    </aside>
  )
}
