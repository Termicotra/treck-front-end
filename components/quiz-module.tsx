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
  retroalimentacion: string | null
  activo: boolean
  fecha_creacion: string | null
  fecha_actualizacion: string | null
  opciones: ExerciseOptionApiItem[] | null
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
  feedback: string | null
  createdAt: string | null
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

type AnswerRecord = {
  exerciseId: number
  topic: string | null
  question: string
  isCorrect: boolean
}

const EXERCISES_ENDPOINT = getApiUrl("/api/evaluaciones/ejercicios/?activo=true")
const ANSWER_ENDPOINT = getApiUrl("/api/evaluaciones/responder/")

function normalizeExercise(item: ExerciseApiItem): DisplayExercise {
  const options = Array.isArray(item.opciones) ? item.opciones : []

  return {
    id: item.id,
    topic: item.tema,
    question: item.pregunta,
    concept: item.concepto,
    example: item.ejemplo,
    feedback: item.retroalimentacion,
    createdAt: item.fecha_creacion,
    options: options
      .map((option, index) => ({
        id: option.id,
        text: option.texto,
        order: option.orden ?? index + 1,
      }))
      .sort((left, right) => left.order - right.order || left.id - right.id),
  }
}

function sortOldestFirst(items: DisplayExercise[]) {
  return [...items].sort((left, right) => {
    const leftTime = left.createdAt ? Date.parse(left.createdAt) : 0
    const rightTime = right.createdAt ? Date.parse(right.createdAt) : 0
    if (leftTime !== rightTime) return leftTime - rightTime
    return left.id - right.id
  })
}

function normalizeAnswer(payload: AnswerApiResponse, exercise: DisplayExercise): AnswerResult {
  const fallbackFeedback = payload.es_correcta
    ? "Respuesta correcta. Buen trabajo identificando el escenario."
    : exercise.feedback ?? "Respuesta incorrecta. Revisa el concepto y vuelve a intentarlo."

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
  const [exercises, setExercises] = useState<DisplayExercise[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null)
  const [result, setResult] = useState<AnswerResult | null>(null)
  const [score, setScore] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadExercises = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(EXERCISES_ENDPOINT, {
          headers: buildAuthHeaders(),
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("No se pudieron cargar los ejercicios de evaluacion.")
        }

        const payload = (await response.json()) as ExerciseApiItem[] | { results?: ExerciseApiItem[] }
        const items = Array.isArray(payload) ? payload : payload.results ?? []

        if (!active) return

        const normalized = sortOldestFirst(items.map(normalizeExercise)).filter(
          (exercise) => exercise.options.length >= 2,
        )

        setExercises(normalized)
        setCurrentIndex(0)
      } catch (loadError) {
        if (!active) return
        setError(
          loadError instanceof Error ? loadError.message : "No se pudieron cargar los ejercicios de evaluacion.",
        )
        setExercises([])
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadExercises()

    return () => {
      active = false
    }
  }, [])

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
      if (answerResult.isCorrect) {
        setScore((prev) => prev + 1)
      }
      setAnswers((prev) => [
        ...prev,
        {
          exerciseId: current.id,
          topic: payload.tema ?? current.topic,
          question: current.question,
          isCorrect: answerResult.isCorrect,
        },
      ])
    } catch (answerError) {
      setSubmitError(
        answerError instanceof Error ? answerError.message : "No se pudo evaluar la respuesta. Intenta de nuevo.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedOptionId(null)
      setResult(null)
      setSubmitError(null)
    } else {
      setQuizComplete(true)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setSelectedOptionId(null)
    setResult(null)
    setScore(0)
    setQuizComplete(false)
    setAnswers([])
    setSubmitError(null)
  }

  const getScoreMessage = () => {
    const percentage = answers.length > 0 ? (score / answers.length) * 100 : 0
    if (percentage === 100) return { title: "Excelente!", message: "Dominas la deteccion de phishing", color: "text-success" }
    if (percentage >= 80) return { title: "Muy bien!", message: "Tienes buenos conocimientos", color: "text-[#0038A8]" }
    if (percentage >= 60) return { title: "Bien", message: "Puedes mejorar con mas practica", color: "text-[#0038A8]" }
    return { title: "Sigue practicando", message: "Revisa el modulo de capacitacion", color: "text-[#CE1126]" }
  }

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center p-6 text-sm text-muted-foreground">
        Cargando ejercicios de evaluacion...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <Card className="w-full max-w-xl border-[#CE1126]/30 bg-[#CE1126]/5">
          <CardContent className="p-6 space-y-3 text-center">
            <h2 className="text-lg font-bold text-foreground">No se pudieron cargar los ejercicios</h2>
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

  if (exercises.length === 0) {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <Card className="w-full max-w-xl">
          <CardContent className="p-6 space-y-3 text-center">
            <h2 className="text-lg font-bold text-foreground">No hay ejercicios disponibles</h2>
            <p className="text-sm text-muted-foreground">
              Aun no existen ejercicios de evaluacion activos para mostrar.
            </p>
            <Button variant="outline" className="bg-transparent" onClick={onBack}>
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (quizComplete) {
    const { title, message, color } = getScoreMessage()
    const answered = answers.length
    const percentage = answered > 0 ? Math.round((score / answered) * 100) : 0

    return (
      <div className="min-h-full">
        <div className="bg-[#0038A8] text-white">
          <div className="max-w-3xl mx-auto p-4 md:p-8">
            <button onClick={onBack} className="flex items-center gap-2 text-sm mb-4 opacity-80 hover:opacity-100 transition-opacity md:hidden">
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </button>
            <h1 className="text-xl md:text-2xl font-bold">Resultados de la Evaluacion</h1>
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
              <Trophy className={cn("w-14 h-14", percentage >= 80 ? "text-[#CE1126]" : "text-[#0038A8]")} />
            </div>

            <div className="text-center space-y-2">
              <h2 className={cn("text-3xl font-bold", color)}>{title}</h2>
              <p className="text-muted-foreground text-lg">{message}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-lg">
              <Card className="text-center">
                <CardContent className="p-5">
                  <p className="text-3xl font-bold text-[#0038A8]">{score}/{answered}</p>
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

            {/* Answer Review */}
            <Card className="w-full max-w-lg">
              <CardContent className="p-5">
                <h4 className="font-semibold text-foreground mb-3">Resumen de respuestas</h4>
                <div className="space-y-2">
                  {answers.map((answer, idx) => (
                    <div key={answer.exerciseId} className="flex items-center gap-3 text-sm">
                      {answer.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                      )}
                      <span className="text-muted-foreground flex-1">
                        Pregunta {idx + 1}
                        {answer.topic ? ` (${answer.topic})` : ""}: {answer.question}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 w-full max-w-lg">
              <Button className="flex-1 bg-[#0038A8] hover:bg-[#0038A8]/90 text-white" onClick={handleRestart}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Intentar de nuevo
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={onBack}>
                Volver al inicio
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!current) return null

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-[#0038A8] text-white">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <button onClick={onBack} className="flex items-center gap-2 text-sm mb-4 opacity-80 hover:opacity-100 transition-opacity md:hidden">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <HelpCircle className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Modulo de Evaluacion</h1>
                <p className="text-sm opacity-80">Pon a prueba tu conocimiento</p>
              </div>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-2xl font-bold">{score}</p>
              <p className="text-xs opacity-80">Puntaje</p>
            </div>
          </div>

          <div className="mt-5 space-y-2 max-w-md">
            <div className="flex justify-between text-sm">
              <span className="opacity-80">Pregunta {currentIndex + 1} de {exercises.length}</span>
              <span className="font-semibold md:hidden">Puntaje: {score}</span>
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
                        <span className="font-bold text-success text-lg">Correcto!</span>
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
