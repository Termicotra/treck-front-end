import { buildAuthHeaders, getApiUrl } from "@/lib/auth"
import { obtenerProgreso as obtenerProgresoCapacitaciones } from "@/lib/capacitaciones"
import { obtenerRespuestasSimulaciones, obtenerSimulacionesParaUsuario } from "@/lib/simulaciones"

export interface EstadisticasProgreso {
  capacitaciones: {
    total: number
    completadas: number
    porcentaje: number
  }
  simulaciones: {
    total: number
    respondidas: number
    correctas: number
    incorrectas: number
    porcentaje: number
  }
  evaluaciones: {
    total: number
    respondidas: number
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
    const [progresoCapacitaciones, respuestasSimulaciones, respuestasEvaluaciones, totalesSimulaciones, idsEvaluacionesActivas, totalCapacitaciones] =
      await Promise.all([
        obtenerProgresoCapacitaciones(),
        obtenerRespuestasSimulaciones(),
        obtenerRespuestasEvaluaciones(),
        obtenerCupoSimulaciones(),
        obtenerIdsEvaluacionesActivas(),
        obtenerTotalCapacitaciones(),
      ])
    const completadasCapacitaciones = progresoCapacitaciones.filter((p) => p.completada).length
    const porcentajeCapacitaciones = totalCapacitaciones > 0 ? Math.round((completadasCapacitaciones / totalCapacitaciones) * 100) : 0

    // Avance en simulaciones sobre el cupo mostrado al usuario (cantidad_mostrada del backend).
    // Solo cuentan las primeras N respuestas del cupo, así nunca se pasa aunque el catálogo crezca.
    const respuestasCupo = [...respuestasSimulaciones]
      .sort((a, b) => Date.parse(a.fecha_respuesta) - Date.parse(b.fecha_respuesta))
      .slice(0, totalesSimulaciones)
    const correctasSimulaciones = respuestasCupo.filter((r) => r.es_correcta).length
    const incorrectasSimulaciones = respuestasCupo.length - correctasSimulaciones
    const respondidasSimulaciones = respuestasCupo.length
    const porcentajeSimulaciones = totalesSimulaciones > 0 ? Math.round((respondidasSimulaciones / totalesSimulaciones) * 100) : 0

    // Avance en evaluaciones: ejercicios activos respondidos sobre ejercicios activos disponibles
    // /respuestas/ devuelve solo la última respuesta por ejercicio, así que cada fila es un ejercicio distinto
    const ejerciciosActivos = new Set(idsEvaluacionesActivas)
    const respuestasEvaluacionesActivas = respuestasEvaluaciones.filter((r: any) => ejerciciosActivos.has(r.ejercicio))
    const correctasEvaluaciones = respuestasEvaluacionesActivas.filter((r: any) => r.es_correcta).length
    const incorrectasEvaluaciones = respuestasEvaluacionesActivas.filter((r: any) => !r.es_correcta).length
    const respondidasEvaluaciones = respuestasEvaluacionesActivas.length
    const totalEvaluacionesDisponibles = idsEvaluacionesActivas.length
    const porcentajeEvaluaciones = totalEvaluacionesDisponibles > 0 ? Math.min(Math.round((respondidasEvaluaciones / totalEvaluacionesDisponibles) * 100), 100) : 0

    // Progreso general (33% capacitaciones, 33% simulaciones, 33% evaluaciones)
    // Los tres módulos miden avance sobre su contenido disponible
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
        total: totalesSimulaciones,
        respondidas: respondidasSimulaciones,
        correctas: correctasSimulaciones,
        incorrectas: incorrectasSimulaciones,
        porcentaje: porcentajeSimulaciones,
      },
      evaluaciones: {
        total: totalEvaluacionesDisponibles,
        respondidas: respondidasEvaluaciones,
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

async function obtenerCupoSimulaciones(): Promise<number> {
  try {
    const { cantidad_mostrada } = await obtenerSimulacionesParaUsuario()
    return cantidad_mostrada
  } catch (error) {
    console.error("Error obteniendo cupo de simulaciones:", error)
    return 0
  }
}

async function obtenerIdsEvaluacionesActivas(): Promise<number[]> {
  try {
    const endpoint = getApiUrl("/api/evaluaciones/ejercicios/?activo=true")
    const response = await fetch(endpoint, {
      headers: buildAuthHeaders(),
      cache: "no-store",
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      console.error("Error obteniendo total de evaluaciones:", response.status)
      return []
    }

    const data = (await response.json()) as any[] | { results?: any[] }
    const evaluaciones = Array.isArray(data) ? data : data.results ?? []

    if (evaluaciones.length === 0) {
      console.warn("No se encontraron ejercicios disponibles")
    }

    return evaluaciones.map((e: any) => e.id as number)
  } catch (error) {
    console.error("Error obtieniendo total de evaluaciones:", error)
    return []
  }
}

async function obtenerTotalCapacitaciones() {
  try {
    const endpoint = getApiUrl("/api/capacitaciones/lecciones/")
    const response = await fetch(endpoint, {
      headers: buildAuthHeaders(),
      cache: "no-store",
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      console.error("Error obteniendo total de capacitaciones:", response.status)
      return 0
    }

    const data = (await response.json()) as any[] | { results?: any[] }
    const lecciones = Array.isArray(data) ? data : data.results ?? []
    const total = lecciones.length

    if (total === 0) {
      console.warn("No se encontraron lecciones activas")
      return 0
    }

    return total
  } catch (error) {
    console.error("Error obtieniendo total de capacitaciones:", error)
    return 0
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
