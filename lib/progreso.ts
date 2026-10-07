import { buildAuthHeaders, getApiUrl } from "@/lib/auth"
import { obtenerProgreso as obtenerProgresoCapacitaciones } from "@/lib/capacitaciones"
import { obtenerRespuestasSimulaciones } from "@/lib/simulaciones"

export interface EstadisticasProgreso {
  capacitaciones: {
    total: number
    completadas: number
    porcentaje: number
  }
  simulaciones: {
    total: number
    correctas: number
    incorrectas: number
    porcentaje: number
  }
  evaluaciones: {
    total: number
    correctas: number
    incorrectas: number
    porcentaje: number
  }
  resumen: {
    progresoGeneral: number
    ultimaActividad: string | null
    tiempoTotal: string
    modulosCompletados: number
  }
}

export async function obtenerEstadisticasProgreso(): Promise<EstadisticasProgreso> {
  try {
    const [progresoCapacitaciones, respuestasSimulaciones, respuestasEvaluaciones, totalesSimulaciones, totalesEvaluaciones, totalCapacitaciones] =
      await Promise.all([
        obtenerProgresoCapacitaciones(),
        obtenerRespuestasSimulaciones(),
        obtenerRespuestasEvaluaciones(),
        obtenerTotalSimulaciones(),
        obtenerTotalEvaluaciones(),
        obtenerTotalCapacitaciones(),
      ])
    const completadasCapacitaciones = progresoCapacitaciones.filter((p) => p.completada).length
    const porcentajeCapacitaciones = totalCapacitaciones > 0 ? Math.round((completadasCapacitaciones / totalCapacitaciones) * 100) : 0

    // Calcular estadísticas de simulaciones
    // El porcentaje se calcula sobre respuestas correctas vs respuestas totales del usuario
    const correctasSimulaciones = respuestasSimulaciones.filter((r: any) => r.es_correcta).length
    const incorrectasSimulaciones = respuestasSimulaciones.filter((r: any) => !r.es_correcta).length
    const totalSimulacionesRespondidas = respuestasSimulaciones.length
    const porcentajeSimulaciones = totalSimulacionesRespondidas > 0 ? Math.round((correctasSimulaciones / totalSimulacionesRespondidas) * 100) : 0

    // Calcular estadísticas de evaluaciones
    // El porcentaje se calcula sobre respuestas correctas vs respuestas totales del usuario
    const correctasEvaluaciones = respuestasEvaluaciones.filter((r: any) => r.es_correcta).length
    const incorrectasEvaluaciones = respuestasEvaluaciones.filter((r: any) => !r.es_correcta).length
    const totalEvaluacionesRespondidas = respuestasEvaluaciones.length
    const totalEvaluacionesDisponibles = totalesEvaluaciones // Dinámico del backend
    const porcentajeEvaluaciones = totalEvaluacionesRespondidas > 0 ? Math.round((correctasEvaluaciones / totalEvaluacionesRespondidas) * 100) : 0

    // Calcular progreso general (33% capacitaciones, 33% simulaciones, 33% evaluaciones)
    // CAPPED a 100% máximo para evitar valores como 107%
    const progresoGeneral = Math.min(
      Math.round((porcentajeCapacitaciones + porcentajeSimulaciones + porcentajeEvaluaciones) / 3),
      100
    )

    // Obtener fecha de última actividad
    let ultimaActividad: Date | null = null
    if (progresoCapacitaciones.length > 0 && progresoCapacitaciones[0].fecha_completacion) {
      ultimaActividad = new Date(progresoCapacitaciones[0].fecha_completacion)
    }
    if (respuestasSimulaciones.length > 0) {
      const fechaSimulacion = new Date(respuestasSimulaciones[0].fecha_respuesta)
      if (!ultimaActividad || fechaSimulacion > ultimaActividad) {
        ultimaActividad = fechaSimulacion
      }
    }
    if (respuestasEvaluaciones.length > 0) {
      const fechaEvaluacion = new Date(respuestasEvaluaciones[0].fecha_respuesta)
      if (!ultimaActividad || fechaEvaluacion > ultimaActividad) {
        ultimaActividad = fechaEvaluacion
      }
    }

    const formatoUltimaActividad = ultimaActividad ? formatFechaActividad(ultimaActividad) : "Sin actividad"

    return {
      capacitaciones: {
        total: totalCapacitaciones,
        completadas: completadasCapacitaciones,
        porcentaje: porcentajeCapacitaciones,
      },
      simulaciones: {
        total: totalSimulacionesRespondidas,
        correctas: correctasSimulaciones,
        incorrectas: incorrectasSimulaciones,
        porcentaje: porcentajeSimulaciones,
      },
      evaluaciones: {
        total: totalEvaluacionesDisponibles,
        correctas: correctasEvaluaciones,
        incorrectas: incorrectasEvaluaciones,
        porcentaje: porcentajeEvaluaciones,
      },
      resumen: {
        progresoGeneral,
        ultimaActividad: formatoUltimaActividad,
        tiempoTotal: "45 min", // Esto podría calcularse mejor si se tienen timestamps
        modulosCompletados: completadasCapacitaciones,
      },
    }
  } catch (error) {
    console.error("Error cargando estadísticas de progreso:", error)
    throw error
  }
}

async function obtenerRespuestasEvaluaciones() {
  try {
    const endpoint = getApiUrl("/api/evaluaciones/respuestas/")
    const response = await fetch(endpoint, {
      headers: buildAuthHeaders(),
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("Error en endpoint de evaluaciones:", response.status, response.statusText)
      return []
    }

    const data = (await response.json()) as any[] | { results?: any[] }
    return Array.isArray(data) ? data : data.results ?? []
  } catch (error) {
    console.error("Error obtieniendo respuestas de evaluaciones:", error)
    return []
  }
}

async function obtenerTotalSimulaciones() {
  try {
    const endpoint = getApiUrl("/api/simulaciones/totales/")
    const response = await fetch(endpoint, {
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("Error obteniendo total de simulaciones:", response.status)
      return 0
    }

    const data = (await response.json()) as { total: number }
    return data.total ?? 0
  } catch (error) {
    console.error("Error obtieniendo total de simulaciones:", error)
    return 0
  }
}

async function obtenerTotalEvaluaciones() {
  try {
    const endpoint = getApiUrl("/api/evaluaciones/totales/")
    const response = await fetch(endpoint, {
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("Error obteniendo total de evaluaciones:", response.status)
      return 4 // Default a 4 si falla
    }

    const data = (await response.json()) as { total: number }
    return data.total ?? 4
  } catch (error) {
    console.error("Error obtieniendo total de evaluaciones:", error)
    return 4
  }
}

async function obtenerTotalCapacitaciones() {
  try {
    const endpoint = getApiUrl("/api/capacitaciones/lecciones/")
    const response = await fetch(endpoint, {
      headers: buildAuthHeaders(),
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("Error obteniendo total de capacitaciones:", response.status)
      return 6 // Default a 6 si falla
    }

    const data = (await response.json()) as any[] | { results?: any[] }
    const lecciones = Array.isArray(data) ? data : data.results ?? []
    // Contar solo lecciones activas
    const leccionesActivas = lecciones.filter((l) => l.activa !== false)
    return leccionesActivas.length || 6
  } catch (error) {
    console.error("Error obtieniendo total de capacitaciones:", error)
    return 6 // Default a 6 si falla
  }
}

function formatFechaActividad(fecha: Date): string {
  const ahora = new Date()
  const diferencia = ahora.getTime() - fecha.getTime()
  const minutos = Math.floor(diferencia / (1000 * 60))
  const horas = Math.floor(diferencia / (1000 * 60 * 60))
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))

  if (minutos < 1) return "Hace poco"
  if (minutos < 60) return `Hace ${minutos} min`
  if (horas < 24) return `Hace ${horas} horas`
  if (dias === 1) return "Ayer"
  if (dias < 7) return `Hace ${dias} días`

  return fecha.toLocaleDateString("es-ES")
}
