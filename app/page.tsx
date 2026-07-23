"use client"

import { useState } from "react"
import { WebSidebar } from "@/components/web-sidebar"
import { WebHeader } from "@/components/web-header"
import { Dashboard } from "@/components/dashboard"
import { TrainingModule } from "@/components/training-module"
import { SimulationModule } from "@/components/simulation-module"
import { QuizModule } from "@/components/quiz-module"
import { ProgressModule } from "@/components/progress-module"
import { LoginScreen } from "@/components/login-screen"
import { ProfileModule } from "@/components/profile-module"

export type ActiveModule = "dashboard" | "training" | "simulation" | "quiz" | "progress" | "profile"

interface UserData {
  name: string
  email: string
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [activeModule, setActiveModule] = useState<ActiveModule>("dashboard")
  const [user, setUser] = useState<UserData>({ name: "Juan Pérez", email: "juan@ejemplo.com" })

  if (!loggedIn) {
    return (
      <LoginScreen
        onLogin={(userData?: UserData) => {
          if (userData) setUser(userData)
          setLoggedIn(true)
        }}
      />
    )
  }

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard onNavigate={setActiveModule} />
      case "training":
        return <TrainingModule onBack={() => setActiveModule("dashboard")} />
      case "simulation":
        return <SimulationModule onBack={() => setActiveModule("dashboard")} />
      case "quiz":
        return <QuizModule onBack={() => setActiveModule("dashboard")} />
      case "progress":
        return <ProgressModule onBack={() => setActiveModule("dashboard")} />
      case "profile":
        return <ProfileModule user={user} onUpdateUser={setUser} />
      default:
        return <Dashboard onNavigate={setActiveModule} />
    }
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <WebSidebar activeModule={activeModule} onNavigate={setActiveModule} userName={user.name} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <WebHeader activeModule={activeModule} onNavigate={setActiveModule} userName={user.name} />

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
