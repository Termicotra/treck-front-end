"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoginScreen } from "@/components/login-screen"
import { bootstrapAuthSession } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    let active = true

    bootstrapAuthSession()
      .then((session) => {
        if (!active) return

        if (session?.tokens.access) {
          router.replace("/")
          return
        }

        setCheckingSession(false)
      })
      .catch(() => {
        if (active) setCheckingSession(false)
      })

    return () => {
      active = false
    }
  }, [router])

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 text-sm text-muted-foreground">
        Verificando sesión...
      </div>
    )
  }

  return <LoginScreen />
}