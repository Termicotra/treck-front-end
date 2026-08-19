"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Target, Mail, MessageSquare, AlertTriangle, CheckCircle, XCircle, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ParaguayFlagBanner } from "@/components/paraguay-flag"
import { cn } from "@/lib/utils"
import { buildAuthHeaders, getApiUrl } from "@/lib/auth"
import { registrarRespuestaSimulacion } from "@/lib/simulaciones"

interface SimulationModuleProps {
  onBack: () => void
}

interface SimulationApiItem {
  id: number
  usuario: string | null
  articulo: number | null
  articulo_titulo: string | null
  articulo_url: string | null
  es_phishing: boolean
  simulacion_texto: string
  tipo_mensaje: string | null
  sender_email: string | null
  subject?: string
  attachments: string[] | null
  enlace_senuelo: string | null
  entidad_objetivo: string | null
  dominio_objetivo: string | null
  resumen_justificacion: string | null
  resultado: string | null
  feedback: string | null
  tipo_generacion: string | null
  fecha_creacion: string | null
  fecha_respuesta: string | null
  es_mostrada: boolean
}

type DisplaySimulation = {
  id: number
  articleId: number | null
  type: "email" | "whatsapp"
  isPhishing: boolean
  body: string
  senderEmail: string | null
  subject: string | null
  attachments: string[]
  lureLink: string | null
  targetEntity: string | null
  targetDomain: string | null
  articleTitle: string | null
  articleUrl: string | null
  explanation: string
  feedback: string
  result: string | null
  isShown: boolean
  createdAt: string | null
}

const SIMULATIONS_ENDPOINT = getApiUrl("/api/simulaciones/")

function normalizeSimulation(item: SimulationApiItem): DisplaySimulation {
  const type = item.tipo_mensaje?.toLowerCase() === "whatsapp" ? "whatsapp" : "email"
  const attachments = Array.isArray(item.attachments) ? item.attachments.filter((attachment) => typeof attachment === "string") : []

  return {
    id: item.id,
    articleId: item.articulo,
    type,
    isPhishing: item.es_phishing,
    body: item.simulacion_texto,
    senderEmail: item.sender_email,
    subject: item.subject ?? null,
    attachments,
    lureLink: item.enlace_senuelo,
    targetEntity: item.entidad_objetivo,
    targetDomain: item.dominio_objetivo,
    articleTitle: item.articulo_titulo,
    articleUrl: item.articulo_url,
    explanation: item.resumen_justificacion ?? "Sin justificacion disponible.",
    feedback: item.feedback ?? "Sin feedback disponible.",
    result: item.resultado,
    isShown: item.es_mostrada,
    createdAt: item.fecha_creacion,
  }
}

function sortNewestFirst(items: DisplaySimulation[]) {
  return [...items].sort((left, right) => {
    const leftTime = left.createdAt ? Date.parse(left.createdAt) : 0
    const rightTime = right.createdAt ? Date.parse(right.createdAt) : 0
    return rightTime - leftTime
  })
}

function sortNewestFirstApi(items: SimulationApiItem[]) {
  return [...items].sort((left, right) => {
    const leftTime = left.fecha_creacion ? Date.parse(left.fecha_creacion) : 0
    const rightTime = right.fecha_creacion ? Date.parse(right.fecha_creacion) : 0
    return rightTime - leftTime
  })
}

function shuffleItems<T>(items: T[]) {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = getRandomIndex(index + 1)
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }

  return shuffled
}

function getRandomIndex(maxExclusive: number) {
  if (maxExclusive <= 1) return 0

  const randomValues = new Uint32Array(1)
  crypto.getRandomValues(randomValues)
  return randomValues[0] % maxExclusive
}

function determinateSelectedCount(totalSimulations: number): number {
  if (totalSimulations >= 20) return 20
  if (totalSimulations >= 15) return 15
  return totalSimulations
}

function pickRecentUniqueSimulations(items: SimulationApiItem[]) {
  const totalSimulations = items.length
  const selectedCount = determinateSelectedCount(totalSimulations)

  const recentItems = sortNewestFirstApi(items).slice(0, selectedCount)
  const groupedItems = new Map<string, SimulationApiItem[]>()

  for (const item of recentItems) {
    const groupKey = item.articulo != null ? `article:${item.articulo}` : `item:${item.id}`
    const group = groupedItems.get(groupKey) ?? []
    group.push(item)
    groupedItems.set(groupKey, group)
  }

  return shuffleItems(
    Array.from(groupedItems.values()).map((group) => {
      if (group.length === 1) return group[0]

      const randomIndex = getRandomIndex(group.length)
      return group[randomIndex]
    }),
  )
}

function getProgressDotClass(index: number, currentIndex: number) {
  if (index < currentIndex) return "bg-white"
  if (index === currentIndex) return "bg-white/80"
  return "bg-white/30"
}

export function SimulationModule({ onBack }: Readonly<SimulationModuleProps>) {
  const [simulations, setSimulations] = useState<DisplaySimulation[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadSimulations = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(SIMULATIONS_ENDPOINT, {
          headers: buildAuthHeaders(),
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("No se pudieron cargar las simulaciones.")
        }

        const payload = (await response.json()) as SimulationApiItem[] | { results?: SimulationApiItem[] }
        const items = Array.isArray(payload) ? payload : payload.results ?? []

        if (!active) return

        const selectedItems = pickRecentUniqueSimulations(items)
        setSimulations(selectedItems.map(normalizeSimulation))
        setCurrentIndex(0)
      } catch (loadError) {
        if (!active) return
        setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar las simulaciones.")
        setSimulations([])
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadSimulations()

    return () => {
      active = false
    }
  }, [])

  const current = simulations[currentIndex] ?? null

  const currentFeedback = useMemo(() => {
    if (!current) return ""

    const parts = [current.explanation, current.feedback].filter(Boolean)
    return parts.join(" ")
  }, [current])

  const handleAnswer = async (answer: boolean) => {
    if (!current) return

    setSelectedAnswer(answer)
    setShowResult(true)

    const isCorrect = answer === current.isPhishing
    if (isCorrect) {
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }))
    }
    setScore((prev) => ({ ...prev, total: prev.total + 1 }))

    try {
      await registrarRespuestaSimulacion(current.id, answer ? "phishing" : "no-phishing")
    } catch (error) {
      console.error("Error registrando respuesta:", error)
    }
  }

  const handleNext = () => {
    if (currentIndex < simulations.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore({ correct: 0, total: 0 })
  }

  const isCorrect = current ? selectedAnswer === current.isPhishing : false
  const showNextExample = currentIndex < simulations.length - 1

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center p-6 text-sm text-muted-foreground">
        Cargando simulaciones...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <Card className="w-full max-w-xl border-[#CE1126]/30 bg-[#CE1126]/5">
          <CardContent className="p-6 space-y-3 text-center">
            <h2 className="text-lg font-bold text-foreground">No se pudieron cargar las simulaciones</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button className="bg-[#0038A8] hover:bg-[#0038A8]/90 text-white" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!current) {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <Card className="w-full max-w-xl">
          <CardContent className="p-6 space-y-3 text-center">
            <h2 className="text-lg font-bold text-foreground">No hay simulaciones disponibles</h2>
            <p className="text-sm text-muted-foreground">Carga simulaciones desde el panel de administración para comenzar.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-[#CE1126] text-white">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          <button onClick={onBack} className="flex items-center gap-2 text-sm mb-4 opacity-80 hover:opacity-100 transition-opacity md:hidden">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <Target className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Modulo de Simulacion</h1>
                <p className="text-sm opacity-80">Practica detectando phishing con ejemplos reales</p>
              </div>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-2xl font-bold">{score.correct}/{score.total}</p>
              <p className="text-xs opacity-80">Aciertos</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm opacity-80">
              Simulacion {currentIndex + 1} de {simulations.length}
            </span>
            <span className="text-sm font-semibold md:hidden">
              Aciertos: {score.correct}/{score.total}
            </span>
          </div>

          {/* Progress dots */}
          <div className="flex gap-2 mt-3">
            {simulations.map((simulation, idx) => (
              <div
                key={simulation.id}
                className={cn("h-1.5 rounded-full flex-1 transition-all", getProgressDotClass(idx, currentIndex))}
              />
            ))}
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
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Message Card - takes more space */}
          <div className="lg:col-span-3">
            <Card className="border-2">
              <CardContent className="p-5 md:p-6 space-y-4">
                <div className="flex items-center gap-2">
                  {current.type === "email" ? (
                    <Mail className="w-5 h-5 text-[#0038A8]" />
                  ) : (
                    <MessageSquare className="w-5 h-5 text-[#0038A8]" />
                  )}
                  <span className="text-xs text-muted-foreground uppercase font-medium tracking-wider">
                    {current.type === "email" ? "Correo Electronico" : "Mensaje WhatsApp"}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {current.type === "email" && current.senderEmail && (
                    <p className="text-sm text-muted-foreground">
                      De: <span className="text-foreground font-mono text-xs bg-muted px-2 py-0.5 rounded">{current.senderEmail}</span>
                    </p>
                  )}
                  {current.type === "email" && current.subject && (
                    <p className="text-sm text-muted-foreground">
                      Asunto: <span className="text-foreground font-semibold">{current.subject}</span>
                    </p>
                  )}
                  {current.type === "whatsapp" && (
                    <p className="text-sm text-muted-foreground">
                      Canal: <span className="text-foreground font-semibold">WhatsApp</span>
                    </p>
                  )}
                </div>

                <div className="bg-muted/50 rounded-xl p-4 md:p-5">
                  <p className="text-sm whitespace-pre-line leading-relaxed">{current.body}</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {current.attachments.length > 0 && (
                    <div className="rounded-xl border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Adjuntos</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{current.attachments.join(", ")}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Panel */}
          <div className="lg:col-span-2 space-y-4">
            {!showResult ? (
              <div className="space-y-4">
                <Card className="bg-accent/30 border-0">
                  <CardContent className="p-5">
                    <p className="text-center font-bold text-foreground text-lg">
                      Este mensaje es un intento de phishing?
                    </p>
                    <p className="text-center text-sm text-muted-foreground mt-1">
                      Analiza cuidadosamente el mensaje antes de responder
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="outline"
                    className="h-16 border-2 border-[#CE1126] text-[#CE1126] hover:bg-[#CE1126] hover:text-white bg-transparent text-base"
                    onClick={() => handleAnswer(true)}
                  >
                    <ShieldAlert className="w-6 h-6 mr-3" />
                    Es Phishing
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 border-2 border-[#0038A8] text-[#0038A8] hover:bg-[#0038A8] hover:text-white bg-transparent text-base"
                    onClick={() => handleAnswer(false)}
                  >
                    <ShieldCheck className="w-6 h-6 mr-3" />
                    Es Legitimo
                  </Button>
                </div>
              </div>
            ) : (
              <Card
                className={cn(
                  "border-2",
                  isCorrect ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30",
                )}
              >
                <CardContent className="p-5 md:p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    {isCorrect ? (
                      <>
                        <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-success" />
                        </div>
                        <div>
                          <span className="font-bold text-success text-lg">Correcto!</span>
                          <p className="text-xs text-muted-foreground">Excelente analisis</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                          <XCircle className="w-6 h-6 text-destructive" />
                        </div>
                        <div>
                          <span className="font-bold text-destructive text-lg">Incorrecto</span>
                          <p className="text-xs text-muted-foreground">Revisa las senales</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">
                      Este mensaje {current.isPhishing ? "SI es phishing" : "es legitimo"}.
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{currentFeedback}</p>
                  </div>

                  <div className="space-y-2 bg-warning/10 rounded-xl p-4">
                    <p className="text-sm font-semibold text-foreground">Datos para feedback:</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {current.targetEntity && (
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-[#CE1126] mt-0.5 flex-shrink-0" />
                          <span>Entidad objetivo: {current.targetEntity}</span>
                        </li>
                      )}
                      {current.targetDomain && (
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-[#CE1126] mt-0.5 flex-shrink-0" />
                          <span>Dominio objetivo: {current.targetDomain}</span>
                        </li>
                      )}
                      {current.articleTitle && (
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-[#CE1126] mt-0.5 flex-shrink-0" />
                          <span>Articulo: {current.articleTitle}</span>
                        </li>
                      )}
                      {current.articleUrl && (
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-[#CE1126] mt-0.5 flex-shrink-0" />
                          <span className="break-all">Fuente: {current.articleUrl}</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="pt-2">
                    {showNextExample ? (
                      <Button className="w-full bg-[#0038A8] hover:bg-[#0038A8]/90 text-white" onClick={handleNext}>
                        Siguiente ejemplo
                      </Button>
                    ) : (
                      <Button className="w-full bg-[#0038A8] hover:bg-[#0038A8]/90 text-white" onClick={handleRestart}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reiniciar practica
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="pt-6">
          <ParaguayFlagBanner />
        </div>
      </div>
    </div>
  )
}
