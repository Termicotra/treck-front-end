"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { WebSidebar } from "@/components/web-sidebar"
import { WebHeader } from "@/components/web-header"
import { Dashboard } from "@/components/dashboard"
import { TrainingModule } from "@/components/training-module"
import { SimulationModule } from "@/components/simulation-module"
import { QuizModule } from "@/components/quiz-module"
import { ProgressModule } from "@/components/progress-module"
import { ProfileModule } from "@/components/profile-module"
import { bootstrapAuthSession, getAuthDisplayName, type AuthSession } from "@/lib/auth"

export type ActiveModule = "dashboard" | "training" | "simulation" | "quiz" | "progress" | "profile"

export default function Home() {
  const router = useRouter()
  const [authReady, setAuthReady] = useState(false)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [activeModule, setActiveModule] = useState<ActiveModule>("dashboard")

  useEffect(() => {
    let active = true

    void bootstrapAuthSession()
      .then((session) => {
        if (!active) return

        if (!session?.tokens.access) {
          router.replace("/login")
          return
        }

        setSession(session)
        setAuthReady(true)
      })
      .catch(() => {
        if (active) router.replace("/login")
      })

    return () => {
      active = false
    }
  }, [router])

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 text-sm text-muted-foreground">
        Cargando aplicación...
      </div>
    )
  }

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard onNavigate={setActiveModule} session={session} />
      case "training":
        return <TrainingModule onBack={() => setActiveModule("dashboard")} />
      case "simulation":
        return <SimulationModule onBack={() => setActiveModule("dashboard")} />
      case "quiz":
        return <QuizModule onBack={() => setActiveModule("dashboard")} />
      case "progress":
        return <ProgressModule onBack={() => setActiveModule("dashboard")} />
      case "profile":
        return <ProfileModule session={session} />
      default:
        return <Dashboard onNavigate={setActiveModule} session={session} />
    }
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <WebSidebar
        activeModule={activeModule}
        onNavigate={setActiveModule}
        userName={getAuthDisplayName(session)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <WebHeader
          activeModule={activeModule}
          onNavigate={setActiveModule}
          userName={getAuthDisplayName(session)}
        />

        {/* Page Content */}
        <main className="flex-1">
          {renderModule()}
        </main>

        {/* Footer flag stripe - mobile only */}
        <div className="md:hidden flex w-full h-1">
          <div className="flex-1 bg-[#CE1126]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0038A8]" />
        </div>
      </div>
    </div>
  )
}
