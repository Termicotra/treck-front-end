import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TRECK - Entrenamiento en Detección de Phishing",
  description:
    "Aplicación educativa para el entrenamiento en detección de phishing en Paraguay. Tecnología, Riesgo, Educación, Concienciación y Know-how.",
  generator: "v0.app",
  keywords: ["phishing", "ciberseguridad", "Paraguay", "educación", "TRECK"],
  authors: [{ name: "Federico Gabriel Traversi Ramírez" }],
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0038A8",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
