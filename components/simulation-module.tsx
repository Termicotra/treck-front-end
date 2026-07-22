"use client"

import { useState } from "react"
import { ArrowLeft, Target, Mail, MessageSquare, AlertTriangle, CheckCircle, XCircle, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ParaguayFlagBanner } from "@/components/paraguay-flag"
import { cn } from "@/lib/utils"

interface SimulationModuleProps {
  onBack: () => void
}

interface SimulationItem {
  id: number
  type: "email" | "sms"
  isPhishing: boolean
  from: string
  subject?: string
  preview: string
  fullContent: string
  redFlags: string[]
  explanation: string
}

const simulations: SimulationItem[] = [
  {
    id: 1,
    type: "email",
    isPhishing: true,
    from: "seguridad@banc0-nacional.py",
    subject: "URGENTE: Su cuenta sera bloqueada",
    preview: "Estimado cliente, hemos detectado actividad sospechosa...",
    fullContent:
      "Estimado cliente,\n\nHemos detectado actividad sospechosa en su cuenta. Para evitar el bloqueo permanente, debe verificar sus datos inmediatamente haciendo clic en el siguiente enlace:\n\nhttp://banconacional-verificar.tk/login\n\nTiene 24 horas para completar la verificacion.\n\nAtentamente,\nEquipo de Seguridad",
    redFlags: [
      "Dominio sospechoso: 'banc0-nacional' (con numero 0)",
      "URL con extension .tk (no oficial)",
      "Urgencia extrema ('24 horas')",
      "No menciona tu nombre real",
    ],
    explanation:
      "Este es un tipico correo de phishing. Los bancos legitimos nunca solicitan datos por correo ni usan dominios extranos.",
  },
  {
    id: 2,
    type: "sms",
    isPhishing: true,
    from: "+595 971 *** ***",
    preview: "TIGO: Ganaste Gs. 5.000.000! Reclama tu premio en...",
    fullContent:
      "TIGO: Felicitaciones! Ganaste Gs. 5.000.000 en nuestro sorteo mensual. Para reclamar tu premio ingresa a: bit.ly/tigo-premio-py y completa tus datos bancarios. Valido por 48hs.",
    redFlags: [
      "Numero desconocido, no oficial de Tigo",
      "Premio no solicitado",
      "URL acortada (bit.ly)",
      "Solicita datos bancarios",
      "Urgencia artificial",
    ],
    explanation: "Las empresas de telefonia no regalan premios por SMS ni solicitan datos bancarios por este medio.",
  },
  {
    id: 3,
    type: "email",
    isPhishing: false,
    from: "notificaciones@personal.com.py",
    subject: "Tu factura de diciembre esta disponible",
    preview: "Hola Juan, tu factura del mes de diciembre ya esta...",
    fullContent:
      "Hola Juan Perez,\n\nTu factura del mes de diciembre ya esta disponible para consulta en nuestra app Mi Personal o en personal.com.py/mi-cuenta.\n\nMonto: Gs. 185.000\nVencimiento: 15/01/2026\n\nPodes pagar en cualquier punto autorizado o a traves de nuestra app.\n\nGracias por elegirnos.\nPersonal Paraguay",
    redFlags: [],
    explanation:
      "Este es un correo legitimo. Usa el dominio oficial, menciona tu nombre, no solicita datos sensibles y te dirige al sitio oficial.",
  },
  {
    id: 4,
    type: "sms",
    isPhishing: true,
    from: "+595 985 *** ***",
    preview: "BCP: Se detecto un cobro de USD 890. Si no reconoces...",
    fullContent:
      "BCP: Se detecto un cobro de USD 890.00 en su tarjeta. Si no reconoces esta transaccion, cancelala aqui: bcp-seguridad.net/cancelar. Responde STOP si no deseas recibir alertas.",
    redFlags: [
      "Numero personal, no linea oficial",
      "Dominio falso: 'bcp-seguridad.net'",
      "El BCP no envia estos mensajes",
      "Genera panico con cobro falso",
    ],
    explanation:
      "Los bancos nunca envian enlaces por SMS para cancelar transacciones. Siempre llama directamente al banco.",
  },
]

export function SimulationModule({ onBack }: SimulationModuleProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const current = simulations[currentIndex]

  const handleAnswer = (answer: boolean) => {
    setSelectedAnswer(answer)
    setShowResult(true)

    const isCorrect = answer === current.isPhishing
    if (isCorrect) {
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }))
    }
    setScore((prev) => ({ ...prev, total: prev.total + 1 }))
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

  const isCorrect = selectedAnswer === current.isPhishing

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
              Ejemplo {currentIndex + 1} de {simulations.length}
            </span>
            <span className="text-sm font-semibold md:hidden">
              Aciertos: {score.correct}/{score.total}
            </span>
          </div>

          {/* Progress dots */}
          <div className="flex gap-2 mt-3">
            {simulations.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-1.5 rounded-full flex-1 transition-all",
                  idx < currentIndex ? "bg-white" : idx === currentIndex ? "bg-white/80" : "bg-white/30",
                )}
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
                    {current.type === "email" ? "Correo Electronico" : "Mensaje SMS"}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">
                    De: <span className="text-foreground font-mono text-xs bg-muted px-2 py-0.5 rounded">{current.from}</span>
                  </p>
                  {current.subject && (
                    <p className="text-sm text-muted-foreground">
                      Asunto: <span className="text-foreground font-semibold">{current.subject}</span>
                    </p>
                  )}
                </div>

                <div className="bg-muted/50 rounded-xl p-4 md:p-5">
                  <p className="text-sm whitespace-pre-line leading-relaxed">{current.fullContent}</p>
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
                    <p className="text-sm text-muted-foreground leading-relaxed">{current.explanation}</p>
                  </div>

                  {current.redFlags.length > 0 && (
                    <div className="space-y-2 bg-warning/10 rounded-xl p-4">
                      <p className="text-sm font-semibold text-foreground">Senales de alerta:</p>
                      <ul className="space-y-2">
                        {current.redFlags.map((flag, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <AlertTriangle className="w-4 h-4 text-[#CE1126] mt-0.5 flex-shrink-0" />
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2">
                    {currentIndex < simulations.length - 1 ? (
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
