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
    const [progresoCapacitaciones, respuestasSimulaciones, respuestasEvaluaciones] = await Promise.all([
      obtenerProgresoCapacitaciones(),
      obtenerRespuestasSimulaciones(),
      obtenerRespuestasEvaluaciones(),
    ])

    // Calcular estadísticas de capacitaciones
    const totalCapacitaciones = 6 // Asumiendo 6 lecciones como está en el seed
    const completadasCapacitaciones = progresoCapacitaciones.filter((p) => p.completada).length
    const porcentajeCapacitaciones = totalCapacitaciones > 0 ? Math.round((completadasCapacitaciones / totalCapacitaciones) * 100) : 0

    // Calcular estadísticas de simulaciones
    const totalSimulaciones = respuestasSimulaciones.length
    const correctasSimulaciones = respuestasSimulaciones.filter((r) => r.es_correcta).length
    const incorrectasSimulaciones = totalSimulaciones - correctasSimulaciones
    const porcentajeSimulaciones = totalSimulaciones > 0 ? Math.round((correctasSimulaciones / totalSimulaciones) * 100) : 0

    // Calcular estadísticas de evaluaciones
    const totalEvaluaciones = respuestasEvaluaciones.length
    const correctasEvaluaciones = respuestasEvaluaciones.filter((r) => r.es_correcta).length
    const incorrectasEvaluaciones = totalEvaluaciones - correctasEvaluaciones
    const porcentajeEvaluaciones = totalEvaluaciones > 0 ? Math.round((correctasEvaluaciones / totalEvaluaciones) * 100) : 0

    // Calcular progreso general (40% capacitaciones, 30% simulaciones, 30% evaluaciones)
    // Nota: los porcentajes ya están entre 0-100, así que multiplicamos directamente
    const progresoGeneral = Math.round(
      porcentajeCapacitaciones * 0.4 + porcentajeSimulaciones * 0.3 + porcentajeEvaluaciones * 0.3
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
        total: totalSimulaciones,
        correctas: correctasSimulaciones,
        incorrectas: incorrectasSimulaciones,
        porcentaje: porcentajeSimulaciones,
      },
      evaluaciones: {
        total: totalEvaluaciones,
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
