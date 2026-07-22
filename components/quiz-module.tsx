"use client"

import { useState } from "react"
import { ArrowLeft, HelpCircle, CheckCircle, XCircle, Trophy, RefreshCw, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ParaguayFlag, ParaguayFlagBanner } from "@/components/paraguay-flag"
import { cn } from "@/lib/utils"

interface QuizModuleProps {
  onBack: () => void
}

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const questions: Question[] = [
  {
    id: 1,
    question: "Que es el phishing?",
    options: [
      "Un virus que destruye archivos",
      "Una tecnica de engano para obtener informacion personal",
      "Un tipo de red social",
      "Un programa antivirus",
    ],
    correctAnswer: 1,
    explanation:
      "El phishing es una tecnica de ingenieria social donde el atacante se hace pasar por una fuente confiable para robar informacion.",
  },
  {
    id: 2,
    question: "Cual de estas URLs es sospechosa?",
    options: [
      "https://www.bancobcp.com.py",
      "https://login.banc0bcp-seguro.tk",
      "https://personal.com.py/mi-cuenta",
      "https://www.tigo.com.py",
    ],
    correctAnswer: 1,
    explanation:
      "La URL usa '0' en lugar de 'o', tiene un dominio .tk no oficial, y un subdominio sospechoso. Los sitios legitimos usan dominios .com.py o .com.",
  },
  {
    id: 3,
    question: "Que deberias hacer si recibes un correo urgente de tu 'banco' pidiendo datos?",
    options: [
      "Responder inmediatamente con tus datos",
      "Hacer clic en el enlace para verificar",
      "Llamar directamente al banco usando el numero oficial",
      "Reenviar el correo a tus contactos",
    ],
    correctAnswer: 2,
    explanation:
      "Nunca respondas ni hagas clic en enlaces de correos sospechosos. Contacta directamente a tu banco por canales oficiales.",
  },
  {
    id: 4,
    question: "Cual es una senal de que un mensaje SMS es phishing?",
    options: [
      "Te llama por tu nombre completo",
      "Viene del numero oficial de la empresa",
      "Ofrece premios y pide datos bancarios",
      "Te informa sobre tu saldo actual",
    ],
    correctAnswer: 2,
    explanation:
      "Los mensajes que ofrecen premios no solicitados y piden informacion bancaria son tipicos intentos de phishing.",
  },
  {
    id: 5,
    question: "Cuantos intentos de ciberataques sufrio Paraguay en la primera mitad de 2025?",
    options: ["100 millones", "250 millones", "551 millones", "1 billon"],
    correctAnswer: 2,
    explanation:
      "Segun Fortinet, Paraguay fue victima de 551 millones de intentos de ciberataques en la primera mitad de 2025.",
  },
]

export function QuizModule({ onBack }: QuizModuleProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)
  const [answers, setAnswers] = useState<{ questionId: number; correct: boolean }[]>([])

  const current = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleSelect = (index: number) => {
    if (showResult) return
    setSelectedAnswer(index)
  }

  const handleConfirm = () => {
    if (selectedAnswer === null) return
    const isCorrect = selectedAnswer === current.correctAnswer
    if (isCorrect) {
      setScore(score + 1)
    }
    setAnswers([...answers, { questionId: current.id, correct: isCorrect }])
    setShowResult(true)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setQuizComplete(true)
    }
  }

  const handleRestart = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setQuizComplete(false)
    setAnswers([])
  }

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100
    if (percentage === 100) return { title: "Excelente!", message: "Dominas la deteccion de phishing", color: "text-success" }
    if (percentage >= 80) return { title: "Muy bien!", message: "Tienes buenos conocimientos", color: "text-[#0038A8]" }
    if (percentage >= 60) return { title: "Bien", message: "Puedes mejorar con mas practica", color: "text-[#0038A8]" }
    return { title: "Sigue practicando", message: "Revisa el modulo de capacitacion", color: "text-[#CE1126]" }
  }

  if (quizComplete) {
    const { title, message, color } = getScoreMessage()
    const percentage = Math.round((score / questions.length) * 100)

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
                  <p className="text-3xl font-bold text-[#0038A8]">{score}/{questions.length}</p>
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
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      {answer.correct ? (
                        <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                      )}
                      <span className="text-muted-foreground flex-1">Pregunta {idx + 1}: {questions[idx].question}</span>
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
              <span className="opacity-80">Pregunta {currentQuestion + 1} de {questions.length}</span>
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
                    Pregunta {currentQuestion + 1}
                  </span>
                </div>
                <p className="font-bold text-foreground text-lg md:text-xl leading-relaxed">{current.question}</p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {current.options.map((option, index) => {
                const isSelected = selectedAnswer === index
                const isCorrect = index === current.correctAnswer

                let cardStyle = "border-2 cursor-pointer transition-all duration-200"
                if (showResult) {
                  if (isCorrect) {
                    cardStyle += " bg-success/10 border-success"
                  } else if (isSelected && !isCorrect) {
                    cardStyle += " bg-destructive/10 border-destructive"
                  }
                } else if (isSelected) {
                  cardStyle += " border-[#0038A8] bg-[#0038A8]/5"
                } else {
                  cardStyle += " hover:border-[#0038A8]/30 hover:shadow-md"
                }

                return (
                  <Card key={index} className={cardStyle} onClick={() => handleSelect(index)}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0",
                          showResult && isCorrect
                            ? "bg-success text-success-foreground"
                            : showResult && isSelected && !isCorrect
                              ? "bg-destructive text-destructive-foreground"
                              : isSelected
                                ? "bg-[#0038A8] text-white"
                                : "bg-muted text-muted-foreground",
                        )}
                      >
                        {showResult && isCorrect ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : showResult && isSelected && !isCorrect ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          String.fromCharCode(65 + index)
                        )}
                      </div>
                      <span className="text-sm md:text-base text-foreground">{option}</span>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Side panel */}
          <div className="lg:col-span-2 space-y-4">
            {showResult && (
              <Card
                className={cn(
                  "border-2",
                  selectedAnswer === current.correctAnswer
                    ? "bg-success/10 border-success/30"
                    : "bg-destructive/10 border-destructive/30",
                )}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    {selectedAnswer === current.correctAnswer ? (
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
                  <p className="text-sm text-muted-foreground leading-relaxed">{current.explanation}</p>
                </CardContent>
              </Card>
            )}

            <div className="pt-2">
              {!showResult ? (
                <Button
                  className="w-full bg-[#0038A8] hover:bg-[#0038A8]/90 text-white h-12"
                  disabled={selectedAnswer === null}
                  onClick={handleConfirm}
                >
                  Confirmar respuesta
                </Button>
              ) : (
                <Button className="w-full bg-[#CE1126] hover:bg-[#CE1126]/90 text-white h-12" onClick={handleNext}>
                  {currentQuestion < questions.length - 1 ? "Siguiente pregunta" : "Ver resultados"}
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
