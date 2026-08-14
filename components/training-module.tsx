"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, BookOpen, CheckCircle, ChevronRight, Lock, Play, Clock, GraduationCap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ParaguayFlagBanner } from "@/components/paraguay-flag"
import { cn } from "@/lib/utils"
import { obtenerLecciones, obtenerLeccionDetalle, marcarLeccionCompletada } from "@/lib/capacitaciones"
import type { Leccion, LeccionDetalle } from "@/lib/capacitaciones"

interface TrainingModuleProps {
  onBack: () => void
}

export function TrainingModule({ onBack }: TrainingModuleProps) {
  const [lessons, setLessons] = useState<Leccion[]>([])
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)
  const [selectedLessonDetails, setSelectedLessonDetails] = useState<LeccionDetalle | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completingLesson, setCompletingLesson] = useState(false)

  useEffect(() => {
    const loadLessons = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await obtenerLecciones()
        setLessons(data)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudieron cargar las lecciones de capacitacion."
        )
      } finally {
        setLoading(false)
      }
    }

    loadLessons()
  }, [])

  const handleSelectLesson = async (lessonId: number) => {
    const lesson = lessons.find((l) => l.id === lessonId)
    if (lesson?.bloqueada) return

    try {
      setSelectedLessonId(lessonId)
      setShowFeedback(false)
      const details = await obtenerLeccionDetalle(lessonId)
      setSelectedLessonDetails(details)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la leccion.")
    }
  }

  const handleCompleteLesson = async () => {
    if (!selectedLessonId) return

    try {
      setCompletingLesson(true)
      await marcarLeccionCompletada(selectedLessonId)
      setLessons((prev) =>
        prev.map((l) =>
          l.id === selectedLessonId ? { ...l, completed: true } : l
        )
      )
      setShowFeedback(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo marcar la leccion como completada.")
    } finally {
      setCompletingLesson(false)
    }
  }

  const completedCount = lessons.filter((l) => l.completed).length
  const progress = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center p-6 text-sm text-muted-foreground">
        Cargando lecciones de capacitacion...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <Card className="w-full max-w-xl border-[#CE1126]/30 bg-[#CE1126]/5">
          <CardContent className="p-6 space-y-3 text-center">
            <h2 className="text-lg font-bold text-foreground">No se pudieron cargar las lecciones</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
            <div className="flex justify-center gap-3 pt-1">
              <Button className="bg-[#0038A8] hover:bg-[#0038A8]/90 text-white" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
              <Button variant="outline" className="bg-transparent" onClick={onBack}>
                Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedLesson = selectedLessonDetails

  if (selectedLesson?.contenido) {
    return (
      <div className="min-h-full">
        {/* Header */}
        <div className="bg-[#0038A8] text-white">
          <div className="max-w-4xl mx-auto p-4 md:p-8">
            <button
              onClick={() => {
                setSelectedLessonId(null)
                setSelectedLessonDetails(null)
                setShowFeedback(false)
              }}
              className="flex items-center gap-2 text-sm mb-4 opacity-80 hover:opacity-100 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a lecciones
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">{selectedLesson.contenido.title}</h1>
                <div className="flex items-center gap-2 mt-1 text-sm opacity-80">
                  <Clock className="w-4 h-4" />
                  <span>{selectedLesson.duracion} de lectura</span>
                </div>
              </div>
            </div>
          </div>
          {/* Flag stripe */}
          <div className="flex w-full h-1">
            <div className="flex-1 bg-[#CE1126]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0038A8]" />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {selectedLesson.contenido.sections.map((section, idx) => (
                <Card key={`${selectedLesson.id}-${idx}`}>
                  <CardContent className="p-5 md:p-6 space-y-3">
                    <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${idx % 2 === 0 ? "bg-[#0038A8]" : "bg-[#CE1126]"}`} />
                      {section.heading}
                    </h3>
                    {section.text && (
                      <p className="text-muted-foreground leading-relaxed">{section.text}</p>
                    )}
                    {section.list && (
                      <ul className="space-y-3">
                        {section.list.map((item, i) => (
                          <li key={`${selectedLesson.id}-${idx}-${i}`} className="flex items-start gap-3 text-muted-foreground">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${i % 2 === 0 ? "bg-[#0038A8]" : "bg-[#CE1126]"}`} />
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="bg-[#0038A8]/5 border-[#0038A8]/20">
                <CardContent className="p-5">
                  <h4 className="font-semibold text-foreground mb-2 text-sm">Datos importantes</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    El phishing representa mas del 80% de los incidentes de ciberseguridad reportados en Paraguay segun el CERT-PY.
                  </p>
                </CardContent>
              </Card>

              {/* Feedback Section */}
              {!showFeedback ? (
                <Button
                  className="w-full bg-[#0038A8] hover:bg-[#0038A8]/90 text-white"
                  disabled={completingLesson}
                  onClick={handleCompleteLesson}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {completingLesson ? "Guardando..." : "Marcar como completado"}
                </Button>
              ) : (
                <Card className="bg-success/10 border-success/30">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Leccion completada!</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Excelente trabajo. Has aprendido conceptos importantes sobre {selectedLesson.titulo.toLowerCase()}.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => {
                        setSelectedLessonId(null)
                        setSelectedLessonDetails(null)
                        setShowFeedback(false)
                      }}
                    >
                      Ver mas lecciones
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-[#0038A8] text-white">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <button onClick={onBack} className="flex items-center gap-2 text-sm mb-4 opacity-80 hover:opacity-100 transition-opacity md:hidden">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Modulo de Capacitacion</h1>
              <p className="text-sm opacity-80">Aprende a identificar phishing paso a paso</p>
            </div>
          </div>

          <div className="mt-5 space-y-2 max-w-md">
            <div className="flex justify-between text-sm">
              <span className="opacity-80">Progreso del modulo</span>
              <span className="font-semibold">
                {completedCount}/{lessons.length}
              </span>
            </div>
            <Progress value={progress} className="h-2.5 bg-white/20" />
          </div>
        </div>
        {/* Flag stripe */}
        <div className="flex w-full h-1">
          <div className="flex-1 bg-[#CE1126]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0038A8]" />
        </div>
      </div>

      {/* Lessons List */}
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-4">
        <h3 className="font-bold text-foreground text-lg">Lecciones disponibles</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lessons.map((lesson) => (
            <Card
              key={lesson.id}
              className={cn(
                "transition-all duration-200",
                lesson.bloqueada
                  ? "opacity-60 cursor-not-allowed"
                  : "cursor-pointer hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]",
              )}
              onClick={() => !lesson.bloqueada && handleSelectLesson(lesson.id)}
            >
              <CardContent className="p-4 md:p-5 flex items-center gap-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                    lesson.completed
                      ? "bg-success text-success-foreground"
                      : lesson.bloqueada
                        ? "bg-muted text-muted-foreground"
                        : lesson.orden % 2 === 0
                          ? "bg-[#0038A8] text-white"
                          : "bg-[#CE1126] text-white",
                  )}
                >
                  {lesson.completed ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : lesson.bloqueada ? (
                    <Lock className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Leccion {lesson.orden}</span>
                    {lesson.completed && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/20 text-success font-medium">
                        Completado
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-foreground">{lesson.titulo}</h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{lesson.duracion}</span>
                  </div>
                </div>

                {!lesson.bloqueada && <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="pt-4">
          <ParaguayFlagBanner />
        </div>
      </div>
    </div>
  )
}
