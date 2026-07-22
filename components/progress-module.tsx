"use client"

import { ArrowLeft, BarChart3, Award, Target, BookOpen, TrendingUp, Calendar, Clock, Shield, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ParaguayFlag, ParaguayFlagBanner } from "@/components/paraguay-flag"

interface ProgressModuleProps {
  onBack: () => void
}

export function ProgressModule({ onBack }: ProgressModuleProps) {
  const stats = {
    totalLessons: 6,
    completedLessons: 2,
    totalSimulations: 10,
    completedSimulations: 4,
    totalQuizzes: 3,
    completedQuizzes: 1,
    averageScore: 75,
    streak: 3,
    lastActivity: "Hoy",
    totalTimeSpent: "45 min",
  }

  const moduleProgress = [
    {
      icon: BookOpen,
      title: "Capacitacion",
      progress: Math.round((stats.completedLessons / stats.totalLessons) * 100),
      detail: `${stats.completedLessons} de ${stats.totalLessons} lecciones`,
      color: "bg-[#0038A8]",
    },
    {
      icon: Target,
      title: "Simulaciones",
      progress: Math.round((stats.completedSimulations / stats.totalSimulations) * 100),
      detail: `${stats.completedSimulations} de ${stats.totalSimulations} completadas`,
      color: "bg-[#CE1126]",
    },
    {
      icon: Award,
      title: "Evaluaciones",
      progress: Math.round((stats.completedQuizzes / stats.totalQuizzes) * 100),
      detail: `${stats.completedQuizzes} de ${stats.totalQuizzes} completadas`,
      color: "bg-[#0038A8]",
    },
  ]

  const overallProgress = Math.round(
    ((stats.completedLessons / stats.totalLessons) * 0.4 +
      (stats.completedSimulations / stats.totalSimulations) * 0.3 +
      (stats.completedQuizzes / stats.totalQuizzes) * 0.3) *
      100,
  )

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-[#0038A8] text-white">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          <button onClick={onBack} className="flex items-center gap-2 text-sm mb-4 opacity-80 hover:opacity-100 transition-opacity md:hidden">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <BarChart3 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Mi Progreso</h1>
                <p className="text-sm opacity-80">Seguimiento de tu aprendizaje</p>
              </div>
            </div>
            <ParaguayFlag className="w-10 h-7 rounded-sm shadow hidden md:block" />
          </div>
        </div>
        <div className="flex w-full h-1">
          <div className="flex-1 bg-[#CE1126]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0038A8]" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overall Progress Card */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-[#0038A8] to-[#0038A8]/80 text-white border-0 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-6 md:p-8 relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm opacity-80">Progreso general</p>
                  <p className="text-4xl md:text-5xl font-bold mt-1">{overallProgress}%</p>
                  <p className="text-xs opacity-70 mt-2">Continua asi para convertirte en experto</p>
                </div>
                <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
                  <TrendingUp className="w-10 h-10" />
                </div>
              </div>
              <Progress value={overallProgress} className="h-3 bg-white/20" />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <Card>
              <CardContent className="p-4 md:p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#CE1126]/10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-[#CE1126]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.averageScore}%</p>
                  <p className="text-xs text-muted-foreground">Puntaje promedio</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 md:p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0038A8]/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-[#0038A8]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.streak} dias</p>
                  <p className="text-xs text-muted-foreground">Racha activa</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#0038A8]/10 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-[#0038A8]" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.totalTimeSpent}</p>
              <p className="text-xs text-muted-foreground mt-1">Tiempo total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#CE1126]/10 flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-[#CE1126]" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.lastActivity}</p>
              <p className="text-xs text-muted-foreground mt-1">Ultima actividad</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#0038A8]/10 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-[#0038A8]" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.completedLessons}</p>
              <p className="text-xs text-muted-foreground mt-1">Lecciones completadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#CE1126]/10 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-[#CE1126]" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.completedSimulations}</p>
              <p className="text-xs text-muted-foreground mt-1">Simulaciones hechas</p>
            </CardContent>
          </Card>
        </div>

        {/* Module Progress */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-foreground">Progreso por modulo</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {moduleProgress.map((module) => {
              const Icon = module.icon
              return (
                <Card key={module.title} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 md:p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl ${module.color} flex items-center justify-center shadow-md`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{module.title}</h4>
                        <p className="text-xs text-muted-foreground">{module.detail}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Completado</span>
                        <span className="font-bold text-foreground">{module.progress}%</span>
                      </div>
                      <Progress value={module.progress} className="h-2.5" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Audit Info */}
        <Card className="bg-gradient-to-r from-[#0038A8]/5 to-[#CE1126]/5 border-0">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0038A8] flex items-center justify-center flex-shrink-0 shadow-md">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Modulo de Auditoria</h4>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-2xl">
                  Este modulo registra tu progreso de forma sistematica para evaluar la adquisicion de conocimientos sobre
                  deteccion de phishing. Los datos se utilizan para mejorar continuamente el contenido educativo y medir la
                  efectividad del programa TRECK en el contexto paraguayo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="pt-4">
          <ParaguayFlagBanner />
        </div>
      </div>
    </div>
  )
}
