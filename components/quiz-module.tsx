"use client"

import { useEffect, useState } from "react"
import {
  ArrowLeft,
  HelpCircle,
  CheckCircle,
  XCircle,
  Trophy,
  RefreshCw,
  Star,
  Lightbulb,
  BookOpen,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ParaguayFlag, ParaguayFlagBanner } from "@/components/paraguay-flag"
import { cn } from "@/lib/utils"
import { buildAuthHeaders, getApiUrl } from "@/lib/auth"

interface QuizModuleProps {
  onBack: () => void
}

interface ExerciseOptionApiItem {
  id: number
  texto: string
  orden: number | null
}

interface ExerciseApiItem {
  id: number
  tema: string | null
  pregunta: string
  concepto: string | null
  ejemplo: string | null
  opciones?: ExerciseOptionApiItem[] | null
}

interface AnswerApiResponse {
  ejercicio_id: number
  tema: string | null
  es_correcta: boolean
  retroalimentacion: string | null
  respuesta_correcta: { opcion_id: number; texto: string } | null
  concepto: string | null
  ejemplo: string | null
}

interface EstadisticasResponse {
  total_respuestas: number
  respuestas_correctas: number
  porcentaje_aciertos: number
  total_ejercicios: number
  ejercicios_respondidos: number
  ejercicios_pendientes: number
  completado: boolean
  estadisticas_por_tema: Array<{
    tema: string
    total: number
    correctas: number
    porcentaje: number
  }>
}

interface PendientesResponse {
  pendientes: ExerciseApiItem[]
  total_pendientes: number
  total_ejercicios: number
}

type DisplayOption = {
  id: number
  text: string
  order: number
}

type DisplayExercise = {
  id: number
  topic: string | null
  question: string
  concept: string | null
  example: string | null
  options: DisplayOption[]
}

type AnswerResult = {
  isCorrect: boolean
  feedback: string
  correctOptionId: number | null
  correctOptionText: string | null
  concept: string | null
  example: string | null
}

const PENDIENTES_ENDPOINT = getApiUrl("/api/evaluaciones/pendientes/")
const ANSWER_ENDPOINT = getApiUrl("/api/evaluaciones/responder/")
const ESTADISTICAS_ENDPOINT = getApiUrl("/api/evaluaciones/estadisticas/")
const RESETEAR_ENDPOINT = getApiUrl("/api/evaluaciones/resetear/")

function normalizeExercise(item: ExerciseApiItem): DisplayExercise {
  const options = Array.isArray(item.opciones) ? item.opciones : []

  return {
    id: item.id,
    topic: item.tema,
    question: item.pregunta,
    concept: item.concepto,
    example: item.ejemplo,
    options: options
      .map((option, index) => ({
        id: option.id,
        text: option.texto,
        order: option.orden ?? index + 1,
      }))
      .sort((left, right) => left.order - right.order || left.id - right.id),
  }
}

function normalizeAnswer(payload: AnswerApiResponse, exercise: DisplayExercise): AnswerResult {
  const fallbackFeedback = payload.es_correcta
    ? "Respuesta correcta. Buen trabajo identificando el escenario."
    : "Respuesta incorrecta. Revisa el concepto y vuelve a intentarlo."

  return {
    isCorrect: payload.es_correcta,
    feedback: payload.retroalimentacion ?? fallbackFeedback,
    correctOptionId: payload.respuesta_correcta?.opcion_id ?? null,
    correctOptionText: payload.respuesta_correcta?.texto ?? null,
    concept: payload.concepto ?? exercise.concept,
    example: payload.ejemplo ?? exercise.example,
  }
}

export function QuizModule({ onBack }: Readonly<QuizModuleProps>) {
  const [state, setState] = useState<"loading" | "mostrando-ejercicios" | "mostrando-progreso" | "error">("loading")
  const [exercises, setExercises] = useState<DisplayExercise[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null)
  const [result, setResult] = useState<AnswerResult | null>(null)
  const [estadisticas, setEstadisticas] = useState<EstadisticasResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Cargar evaluaciones pendientes al iniciar
  useEffect(() => {
    let active = true

    const loadPendientes = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(PENDIENTES_ENDPOINT, {
          headers: buildAuthHeaders(),
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("No se pudieron cargar las evaluaciones pendientes.")
        }

        const data = (await response.json()) as PendientesResponse

        if (!active) return

        if (data.total_pendientes === 0) {
          // Sin pendientes: cargar estadísticas
          const statsResponse = await fetch(ESTADISTICAS_ENDPOINT, {
            headers: buildAuthHeaders(),
            cache: "no-store",
          })

          if (!statsResponse.ok) {
            throw new Error("No se pudieron cargar las estadísticas.")
          }

          const stats = (await statsResponse.json()) as EstadisticasResponse
          if (!active) return

          setEstadisticas(stats)
          setState("mostrando-progreso")
        } else {
          // Con pendientes: mostrar ejercicios
          const normalized = data.pendientes
            .map(normalizeExercise)
            .filter((exercise) => exercise.options.length >= 2)

          setExercises(normalized)
          setCurrentIndex(0)
          setState("mostrando-ejercicios")
        }
      } catch (loadError) {
        if (!active) return
        setError(
          loadError instanceof Error ? loadError.message : "No se pudieron cargar las evaluaciones pendientes.",
        )
        setState("error")
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadPendientes()

    return () => {
      active = false
    }
  }, [])

  // Verificar nuevas evaluaciones cada 5 segundos cuando está en progreso
  useEffect(() => {
    if (state !== "mostrando-progreso") return

    const checkNewEvaluations = async () => {
      try {
        const response = await fetch(PENDIENTES_ENDPOINT, {
          headers: buildAuthHeaders(),
          cache: "no-store",
        })

        if (!response.ok) return

        const data = (await response.json()) as PendientesResponse

        if (data.total_pendientes > 0) {
          // Hay nuevas evaluaciones: volver a mostrar ejercicios
          const normalized = data.pendientes
            .map(normalizeExercise)
            .filter((exercise) => exercise.options.length >= 2)

          setExercises(normalized)
          setCurrentIndex(0)
          setSelectedOptionId(null)
          setResult(null)
          setState("mostrando-ejercicios")
        }
      } catch (e) {
        // Ignorar errores silenciosamente
      }
    }

    const interval = setInterval(checkNewEvaluations, 5000)
    return () => clearInterval(interval)
  }, [state])

  const current = exercises[currentIndex] ?? null
  const showResult = result !== null
  const progress = exercises.length > 0 ? ((currentIndex + 1) / exercises.length) * 100 : 0

  const handleSelect = (optionId: number) => {
    if (showResult || submitting) return
    setSelectedOptionId(optionId)
  }

  const handleConfirm = async () => {
    if (!current || selectedOptionId === null || submitting) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch(ANSWER_ENDPOINT, {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ ejercicio_id: current.id, opcion_id: selectedOptionId }),
      })

      if (!response.ok) {
        throw new Error("No se pudo evaluar la respuesta. Intenta de nuevo.")
      }

      const payload = (await response.json()) as AnswerApiResponse
      const answerResult = normalizeAnswer(payload, current)

      setResult(answerResult)
    } catch (answerError) {
      setSubmitError(
        answerError instanceof Error ? answerError.message : "No se pudo evaluar la respuesta. Intenta de nuevo.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = async () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedOptionId(null)
      setResult(null)
      setSubmitError(null)
    } else {
      // Última pregunta: cargar estadísticas
      try {
        const response = await fetch(ESTADISTICAS_ENDPOINT, {
          headers: buildAuthHeaders(),
          cache: "no-store",
        })

        if (response.ok) {
          const stats = (await response.json()) as EstadisticasResponse
          setEstadisticas(stats)
        }
      } catch (e) {
        console.error("Error cargando estadísticas:", e)
      }

      setState("mostrando-progreso")
    }
  }

  const handleRestart = async () => {
    setLoading(true)
    setError(null)

    try {
      // 1. Resetear respuestas en el servidor
      const resetResponse = await fetch(RESETEAR_ENDPOINT, {
        method: "POST",
        headers: buildAuthHeaders(),
      })

      if (!resetResponse.ok) {
        throw new Error("No se pudo reiniciar las evaluaciones.")
      }

      // 2. Recargar evaluaciones pendientes
      const pendientesResponse = await fetch(PENDIENTES_ENDPOINT, {
        headers: buildAuthHeaders(),
        cache: "no-store",
      })

      if (!pendientesResponse.ok) {
        throw new Error("No se pudieron cargar las evaluaciones pendientes.")
      }

      const data = (await pendientesResponse.json()) as PendientesResponse

      // 3. Determinar qué mostrar
      if (data.total_pendientes === 0) {
        // Sin pendientes: mostrar pantalla de progreso
        const statsResponse = await fetch(ESTADISTICAS_ENDPOINT, {
          headers: buildAuthHeaders(),
          cache: "no-store",
        })

        if (statsResponse.ok) {
          const stats = (await statsResponse.json()) as EstadisticasResponse
          setEstadisticas(stats)
          setState("mostrando-progreso")
        } else {
          setError("No se pudieron cargar las estadísticas")
          setState("error")
        }
      } else {
        // Con pendientes: mostrar ejercicios
        const normalized = data.pendientes
          .map(normalizeExercise)
          .filter((exercise) => exercise.options.length >= 2)

        if (normalized.length === 0) {
          setError("No hay ejercicios disponibles para mostrar")
          setState("error")
        } else {
          setExercises(normalized)
          setCurrentIndex(0)
          setSelectedOptionId(null)
          setResult(null)
          setState("mostrando-ejercicios")
        }
      }
    } catch (e) {
      console.error("Error reiniciando evaluaciones:", e)
      setError(e instanceof Error ? e.message : "Error al reiniciar las evaluaciones")
      setState("error")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center p-6 text-sm text-muted-foreground">
        Cargando evaluaciones...
      </div>
    )
  }

  if (state === "error") {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <Card className="w-full max-w-xl border-[#CE1126]/30 bg-[#CE1126]/5">
          <CardContent className="p-6 space-y-3 text-center">
            <h2 className="text-lg font-bold text-foreground">No se pudieron cargar las evaluaciones</h2>
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

  // Mostrar progreso
  if (state === "mostrando-progreso" && estadisticas) {
    const percentage = Math.round(estadisticas.porcentaje_aciertos)

    const getScoreMessage = () => {
      if (percentage === 100)
        return { title: "¡Excelente!", message: "Dominas la detección de phishing", color: "text-success" }
      if (percentage >= 80)
        return { title: "¡Muy bien!", message: "Tienes buenos conocimientos", color: "text-[#0038A8]" }
      if (percentage >= 60)
        return { title: "Bien", message: "Puedes mejorar con más práctica", color: "text-[#0038A8]" }
      return {
        title: "Sigue practicando",
        message: "Revisa el módulo de capacitación",
        color: "text-[#CE1126]",
      }
    }

    const scoreMsg = getScoreMessage()

    return (
      <div className="min-h-full">
        <div className="bg-[#0038A8] text-white">
          <div className="max-w-3xl mx-auto p-4 md:p-8">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm mb-4 opacity-80 hover:opacity-100 transition-opacity md:hidden"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </button>
            <h1 className="text-xl md:text-2xl font-bold">Resultados de tu Evaluación</h1>
          </div>
          <div className="flex w-full h-1">
            <div className="flex-1 bg-[#CE1126]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0038A8]" />
          </div>
        </div>

        <div className="max-w-3xl mx-auto p-4 md:p-8">
          <div className="flex flex-col items-center py-8 space-y-8">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#0038A8]/10 to-[#CE1126]/10 flex items-center justify-center">
              <Trophy
                className={cn("w-14 h-14", percentage >= 80 ? "text-[#CE1126]" : "text-[#0038A8]")}
              />
            </div>

            <div className="text-center space-y-2">
              <h2 className={cn("text-3xl font-bold", scoreMsg.color)}>{scoreMsg.title}</h2>
              <p className="text-muted-foreground text-lg">{scoreMsg.message}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-lg">
              <Card className="text-center">
                <CardContent className="p-5">
                  <p className="text-3xl font-bold text-[#0038A8]">
                    {estadisticas.respuestas_correctas}/{estadisticas.total_respuestas}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Respuestas correctas</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-5">
                  <p className="text-3xl font-bold text-[#CE1126]">{percentage}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Porcentaje de aciertos</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-5">
                  <div className="flex items-center justify-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-5 h-5",
                          i < Math.ceil(percentage / 20) ? "text-[#CE1126] fill-[#CE1126]" : "text-muted",
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Nivel alcanzado</p>
                </CardContent>
              </Card>
            </div>

            {/* Desglose por tema */}
            {estadisticas.estadisticas_por_tema.length > 0 && (
              <Card className="w-full max-w-lg">
                <CardContent className="p-5">
                  <h4 className="font-semibold text-foreground mb-4">Progreso por tema</h4>
                  <div className="space-y-3">
                    {estadisticas.estadisticas_por_tema.map((tema) => (
                      <div key={tema.tema}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-foreground">{tema.tema}</span>
                          <span className="text-sm text-muted-foreground">
                            {tema.correctas}/{tema.total}
                          </span>
                        </div>
                        <Progress value={tema.porcentaje} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">{tema.porcentaje}%</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3 w-full max-w-lg">
              <Button
                className="flex-1 bg-[#0038A8] hover:bg-[#0038A8]/90 text-white"
                onClick={handleRestart}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Empezar de nuevo
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={onBack}>
                Volver al inicio
              </Button>
            </div>

            {estadisticas.ejercicios_pendientes > 0 && (
              <div className="w-full max-w-lg p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <p className="text-sm text-[#0038A8]">
                  ✨ Se agregaron {estadisticas.ejercicios_pendientes} nuevas evaluaciones
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Mostrar ejercicios
  if (state === "mostrando-ejercicios" && current) {
    return (
      <div className="min-h-full">
        {/* Header */}
        <div className="bg-[#0038A8] text-white">
          <div className="max-w-4xl mx-auto p-4 md:p-8">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm mb-4 opacity-80 hover:opacity-100 transition-opacity md:hidden"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </button>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                  <HelpCircle className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold">Módulo de Evaluación</h1>
                  <p className="text-sm opacity-80">Pon a prueba tu conocimiento</p>
                </div>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-2xl font-bold">{currentIndex}/4</p>
                <p className="text-xs opacity-80">Completadas</p>
              </div>
            </div>

            <div className="mt-5 space-y-2 max-w-md">
              <div className="flex justify-between text-sm">
                <span className="opacity-80">
                  Progreso: {currentIndex} de 4 completadas
                </span>
                <span className="font-semibold md:hidden">{currentIndex} de 4</span>
              </div>
              <Progress value={progress} className="h-2.5 bg-white/20" />
            </div>
          </div>
          <div className="flex w-full h-1">
            <div className="flex-1 bg-[#CE1126]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0038A8]" />
          </div>
        </div>

        {/* Question Content */}
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <Card className="border-2 border-[#0038A8]/20">
                <CardContent className="p-5 md:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Pregunta {currentIndex + 1}
                    </span>
                    {current.topic && (
                      <span className="text-xs font-medium text-[#0038A8] bg-[#0038A8]/10 px-2 py-0.5 rounded-full">
                        {current.topic}
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-foreground text-lg md:text-xl leading-relaxed">{current.question}</p>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {current.options.map((option, index) => {
                  const isSelected = selectedOptionId === option.id
                  const isCorrect = showResult && result?.correctOptionId === option.id

                  let cardStyle = "border-2 transition-all duration-200"
                  if (showResult) {
                    cardStyle += " cursor-default"
                    if (isCorrect) {
                      cardStyle += " bg-success/10 border-success"
                    } else if (isSelected) {
                      cardStyle += " bg-destructive/10 border-destructive"
                    }
                  } else if (isSelected) {
                    cardStyle += " cursor-pointer border-[#0038A8] bg-[#0038A8]/5"
                  } else {
                    cardStyle += " cursor-pointer hover:border-[#0038A8]/30 hover:shadow-md"
                  }

                  return (
                    <Card key={option.id} className={cardStyle} onClick={() => handleSelect(option.id)}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0",
                            isCorrect
                              ? "bg-success text-success-foreground"
                              : showResult && isSelected
                                ? "bg-destructive text-destructive-foreground"
                                : isSelected
                                  ? "bg-[#0038A8] text-white"
                                  : "bg-muted text-muted-foreground",
                          )}
                        >
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : showResult && isSelected ? (
                            <XCircle className="w-5 h-5" />
                          ) : (
                            String.fromCharCode(65 + index)
                          )}
                        </div>
                        <span className="text-sm md:text-base text-foreground">{option.text}</span>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Side panel */}
            <div className="lg:col-span-2 space-y-4">
              {result && (
                <Card
                  className={cn(
                    "border-2",
                    result.isCorrect ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30",
                  )}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      {result.isCorrect ? (
                        <>
                          <CheckCircle className="w-6 h-6 text-success" />
                          <span className="font-bold text-success text-lg">¡Correcto!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-6 h-6 text-destructive" />
                          <span className="font-bold text-destructive text-lg">Incorrecto</span>
                        </>
                      )}
                    </div>
                    {!result.isCorrect && result.correctOptionText && (
                      <p className="text-sm text-foreground">
                        Respuesta correcta: <span className="font-semibold">{result.correctOptionText}</span>
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground leading-relaxed">{result.feedback}</p>
                  </CardContent>
                </Card>
              )}

              {result?.concept && (
                <Card>
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#0038A8]" />
                      <p className="text-sm font-semibold text-foreground">Concepto</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{result.concept}</p>
                  </CardContent>
                </Card>
              )}

              {result?.example && (
                <Card className="bg-warning/10 border-0">
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-[#CE1126]" />
                      <p className="text-sm font-semibold text-foreground">Ejemplo</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{result.example}</p>
                  </CardContent>
                </Card>
              )}

              {submitError && (
                <Card className="border-[#CE1126]/30 bg-[#CE1126]/5">
                  <CardContent className="p-4">
                    <p className="text-sm text-[#CE1126]">{submitError}</p>
                  </CardContent>
                </Card>
              )}

              <div className="pt-2">
                {!showResult ? (
                  <Button
                    className="w-full bg-[#0038A8] hover:bg-[#0038A8]/90 text-white h-12"
                    disabled={selectedOptionId === null || submitting}
                    onClick={handleConfirm}
                  >
                    {submitting ? "Evaluando..." : "Confirmar respuesta"}
                  </Button>
                ) : (
                  <Button className="w-full bg-[#CE1126] hover:bg-[#CE1126]/90 text-white h-12" onClick={handleNext}>
                    {currentIndex < exercises.length - 1 ? "Siguiente pregunta" : "Ver resultados"}
                  </Button>
                )}
              </div>

              <Card className="bg-accent/30 border-0">
                <CardContent className="p-4 flex items-center gap-3">
                  <ParaguayFlag className="w-8 h-5 rounded-sm flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Contenido contextualizado a la realidad de ciberseguridad en Paraguay
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="pt-6">
            <ParaguayFlagBanner />
          </div>
        </div>
      </div>
    )
  }

  return null
}
