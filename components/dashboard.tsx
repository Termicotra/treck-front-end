"use client"

import { useEffect, useState } from "react"
import { Shield, BookOpen, Target, HelpCircle, TrendingUp, Award, AlertTriangle, ChevronRight, Globe, Users, Lock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ParaguayFlag, ParaguayFlagBanner } from "@/components/paraguay-flag"
import { obtenerEstadisticasProgreso, EstadisticasProgreso } from "@/lib/progreso"
import type { ActiveModule } from "@/app/page"
import type { AuthSession } from "@/lib/auth"

interface DashboardProps {
  onNavigate: (module: ActiveModule) => void
  session: AuthSession | null
}

export function Dashboard({ onNavigate, session }: Readonly<DashboardProps>) {
  const [stats, setStats] = useState<EstadisticasProgreso | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setLoading(true)
        const data = await obtenerEstadisticasProgreso()
        setStats(data)
      } catch (error) {
        console.error("Error cargando estadísticas:", error)
        // Si falla, usar valores por defecto
        setStats(null)
      } finally {
        setLoading(false)
      }
    }

    cargarEstadisticas()
  }, [])

  const userProgress = stats?.resumen.progresoGeneral ?? 0
  const completedModules = Math.min(
    (stats?.capacitaciones.completadas ?? 0 > 0 ? 1 : 0) +
    (stats?.simulaciones.correctas ?? 0 > 0 ? 1 : 0) +
    (stats?.evaluaciones.correctas ?? 0 > 0 ? 1 : 0),
    3
  )
  const totalModules = 3 // Solo 3 módulos: Capacitación, Simulación, Evaluación

  const quickActions = [
    {
      id: "training" as const,
      icon: BookOpen,
      title: "Capacitacion",
      description: "Aprende a identificar diferentes tipos de phishing con lecciones interactivas",
      color: "bg-[#0038A8]",
      stats: `${stats?.capacitaciones.total ?? 6} lecciones`,
    },
    {
      id: "simulation" as const,
      icon: Target,
      title: "Simulacion",
      description: "Practica con ejemplos reales de phishing contextualizados a Paraguay",
      color: "bg-[#CE1126]",
      stats: `${stats?.simulaciones.total ?? 0} escenarios`,
    },
    {
      id: "quiz" as const,
      icon: HelpCircle,
      title: "Evaluacion",
      description: "Pon a prueba tu conocimiento con preguntas de opcion multiple",
      color: "bg-[#0038A8]",
      stats: `${stats?.evaluaciones.total ?? 0} preguntas`,
    },
    {
      id: "progress" as const,
      icon: TrendingUp,
      title: "Mi Progreso",
      description: "Visualiza tu avance y estadisticas de aprendizaje",
      color: "bg-[#CE1126]",
      stats: "Tiempo real",
    },
  ]

  // Determinar mensaje basado en progreso
  const getHeroTitle = () => {
    if (userProgress === 0) return "Comienza tu entrenamiento en seguridad"
    if (userProgress < 33) return "¡Buen comienzo! Sigue adelante"
    if (userProgress < 66) return "Ya vamos por la mitad, sigue entrenando"
    if (userProgress < 100) return "Casi terminas, ¡últimos pasos!"
    return "¡Felicidades! Completaste el entrenamiento"
  }

  const getHeroSubtitle = () => {
    if (userProgress === 0)
      return "TRECK te guia paso a paso para que puedas identificar y prevenir ataques de phishing, con contenido contextualizado a la realidad de Paraguay."
    if (userProgress < 50)
      return "Continúa con las siguientes lecciones y simulaciones para fortalecer tu conocimiento sobre detección de phishing."
    return "Has adquirido valiosos conocimientos. Recuerda mantener tus defensas activas contra los ataques de phishing."
  }

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Top header row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-[#CE1126] via-white to-[#0038A8] p-0.5 shadow-lg">
            <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
              <Shield className="w-7 h-7 md:w-8 md:h-8 text-[#0038A8]" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Bienvenido a TRECK
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Plataforma de Entrenamiento en Deteccion de Phishing
            </p>
          </div>
        </div>
        <ParaguayFlag className="w-16 h-10 md:w-20 md:h-12 rounded-md shadow-md self-start md:self-auto" />
      </div>

      <ParaguayFlagBanner />

      {/* Hero Card + Alert Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hero Card */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-[#0038A8] via-[#0038A8]/90 to-[#CE1126]/80 text-white border-0 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <CardContent className="p-6 md:p-8 relative">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <p className="text-base opacity-90">Aprende a protegerte</p>
                  <ParaguayFlag className="w-8 h-5 rounded-sm" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight text-balance">
                  {getHeroTitle()}
                </h2>
                <p className="text-sm md:text-base opacity-80 leading-relaxed max-w-xl">
                  {getHeroSubtitle()}
                </p>
              </div>
              <Award className="w-16 h-16 opacity-30 flex-shrink-0 hidden md:block" />
            </div>

            <div className="mt-6 space-y-2 max-w-md">
              <div className="flex justify-between text-sm">
                <span className="opacity-80">Progreso general</span>
                <span className="font-semibold">{loading ? "..." : `${userProgress}%`}</span>
              </div>
              <Progress value={loading ? 0 : userProgress} className="h-2.5 bg-white/20" />
              <p className="text-xs opacity-70">
                {completedModules} de {totalModules} modulos completados
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Side Stats */}
        <div className="flex flex-col gap-4">
          <Card className="bg-[#CE1126]/10 border-[#CE1126]/30 border-l-4 border-l-[#CE1126] flex-1">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#CE1126]/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-[#CE1126]" />
              </div>
              <div>
                <p className="font-semibold text-foreground">+551M intentos</p>
                <p className="text-sm text-muted-foreground mt-1">
                  de ciberataques en Paraguay en 2025 segun Fortinet
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0038A8]/10 border-[#0038A8]/30 border-l-4 border-l-[#0038A8] flex-1">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0038A8]/20 flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-[#0038A8]" />
              </div>
              <div>
                <p className="font-semibold text-foreground">3er pais mas atacado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  en Latinoamerica por phishing e ingenieria social
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-accent/50 border-accent flex-1">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0038A8]/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-[#0038A8]" />
              </div>
              <div>
                <p className="font-semibold text-foreground">91% de brechas</p>
                <p className="text-sm text-muted-foreground mt-1">
                  inician con un correo de phishing segun CERT-PY
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* TRECK Acronym */}
      <Card className="border-0 shadow-md bg-card">
        <CardContent className="p-6 md:p-8">
          <h3 className="font-bold text-lg text-foreground mb-5">Que es TRECK?</h3>
          <div className="grid grid-cols-5 gap-3 md:gap-6">
            {[
              { letter: "T", word: "Tecnologia", desc: "Herramientas digitales de aprendizaje", color: "bg-[#CE1126]" },
              { letter: "R", word: "Riesgo", desc: "Evaluacion y gestion de amenazas", color: "bg-[#0038A8]" },
              { letter: "E", word: "Educacion", desc: "Contenido pedagogico estructurado", color: "bg-[#CE1126]" },
              { letter: "C", word: "Conciencia", desc: "Sensibilizacion sobre ciberseguridad", color: "bg-[#0038A8]" },
              { letter: "K", word: "Know-how", desc: "Conocimiento practico aplicable", color: "bg-[#CE1126]" },
            ].map((item) => (
              <div key={item.letter} className="text-center group">
                <div
                  className={`w-12 h-12 md:w-16 md:h-16 mx-auto rounded-xl ${item.color} text-white font-bold text-xl md:text-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}
                >
                  {item.letter}
                </div>
                <p className="text-xs md:text-sm font-semibold mt-2 text-foreground">{item.word}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 hidden md:block">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modules Grid */}
      <div className="space-y-5">
        <h3 className="font-bold text-lg text-foreground">Modulos de Aprendizaje</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Card
                key={action.id}
                className="cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border-border/50 group"
                onClick={() => onNavigate(action.id)}
              >
                <CardContent className="p-5 md:p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                      {action.stats}
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-foreground">{action.title}</h4>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed flex-1">
                    {action.description}
                  </p>
                  <div className="flex items-center gap-1 text-primary mt-4 text-sm font-medium group-hover:gap-2 transition-all">
                    <span>Comenzar</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Security Tip */}
      <Card className="bg-gradient-to-r from-[#0038A8]/5 to-[#CE1126]/5 border-0 shadow-sm">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0038A8] flex items-center justify-center flex-shrink-0 shadow-md">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-foreground">Consejo de seguridad</h4>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-2xl">
                Nunca compartas tus contrasenas o datos personales por correo electronico, SMS o llamada telefonica. Las instituciones legitimas nunca solicitan esta informacion por estos medios. Si recibes un mensaje sospechoso, contacta directamente a la entidad por sus canales oficiales.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="pt-4 pb-6 flex flex-col items-center gap-3">
        <ParaguayFlagBanner />
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <span>Hecho con orgullo en</span>
          <span className="font-semibold text-foreground">Paraguay</span>
          <ParaguayFlag className="w-6 h-4 rounded-sm" />
        </p>
        <p className="text-xs text-muted-foreground">
          Federico Gabriel Traversi Ramirez - Universidad del Norte
        </p>
      </div>
    </div>
  )
}
