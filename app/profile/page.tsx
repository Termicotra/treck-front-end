"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { ProfileModule } from "@/components/profile-module"
import { bootstrapAuthSession, clearAuthSession, type AuthSession } from "@/lib/auth"

export default function ProfilePage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    bootstrapAuthSession()
      .then((nextSession) => {
        if (!active) return

        if (!nextSession?.tokens.access) {
          router.replace("/login")
          return
        }

        setSession(nextSession)
        setLoading(false)
      })
      .catch(() => {
        if (active) router.replace("/login")
      })

    return () => {
      active = false
    }
  }, [router])

  const handleLogout = () => {
    clearAuthSession()
    router.replace("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 text-sm text-muted-foreground">
        Cargando perfil...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-[#CE1126]/30 bg-[#CE1126]/10 px-4 py-2 text-sm font-medium text-[#CE1126] hover:bg-[#CE1126] hover:text-white transition-all"
          >
            Salir
          </button>
        </div>

        <ProfileModule session={session} />
      </div>
    </div>
  )
}
