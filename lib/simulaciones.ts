import { buildAuthHeaders, getApiUrl } from "@/lib/auth"

export interface ProgresoSimulacion {
  id: number
  usuario: number
  simulacion: number
  simulacion_titulo: string
  respuesta_usuario: boolean
  es_correcta: boolean
  fecha_respuesta: string
}

const SIMULACIONES_ENDPOINT = getApiUrl("/api/simulaciones/")
const RESPUESTAS_SIMULACIONES_ENDPOINT = getApiUrl("/api/simulaciones/mis-respuestas/")
const SIMULACIONES_PARA_USUARIO_ENDPOINT = getApiUrl("/api/simulaciones/para-usuario/")

export async function obtenerRespuestasSimulaciones(): Promise<ProgresoSimulacion[]> {
  const response = await fetch(RESPUESTAS_SIMULACIONES_ENDPOINT, {
    headers: buildAuthHeaders(),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("No se pudo cargar las respuestas de simulaciones.")
  }

  const data = (await response.json()) as ProgresoSimulacion[] | { results?: ProgresoSimulacion[] }
  return Array.isArray(data) ? data : data.results ?? []
}

export interface CupoSimulaciones<T> {
  total_disponibles: number
  cantidad_mostrada: number
  simulaciones: T[]
}

export async function obtenerSimulacionesParaUsuario<T>(): Promise<CupoSimulaciones<T>> {
  const response = await fetch(SIMULACIONES_PARA_USUARIO_ENDPOINT, {
    headers: buildAuthHeaders(),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("No se pudieron cargar las simulaciones.")
  }

  return (await response.json()) as CupoSimulaciones<T>
}

export async function registrarRespuestaSimulacion(
  simulacionId: number,
  respuesta: "phishing" | "no-phishing"
): Promise<{
  simulacion_id: number
  fue_correcto: boolean
  resultado: string
  es_phishing_real: boolean
  respuesta_usuario: string
  feedback: string
  resumen_justificacion: string
  articulo_titulo: string
  articulo_url: string
}> {
  const response = await fetch(`${SIMULACIONES_ENDPOINT}registrar-respuesta/`, {
    method: "POST",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      simulacion_id: simulacionId,
      respuesta_usuario: respuesta,
    }),
  })

  if (!response.ok) {
    throw new Error("No se pudo registrar la respuesta.")
  }

  return (await response.json()) as any
}
