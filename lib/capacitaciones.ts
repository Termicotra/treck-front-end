import { buildAuthHeaders, getApiUrl } from "@/lib/auth"

export interface ItemLista {
  id: number
  texto: string
  orden: number
}

export interface Seccion {
  id: number
  encabezado: string
  texto: string | null
  items_lista: ItemLista[]
  orden: number
}

export interface Contenido {
  title: string
  sections: Array<{
    heading: string
    text: string | null
    list: string[] | null
  }>
}

export interface Leccion {
  id: number
  titulo: string
  duracion: string
  orden: number
  activa: boolean
  bloqueada: boolean
  fecha_creacion: string | null
  completed?: boolean
}

export interface LeccionDetalle extends Leccion {
  secciones: Seccion[]
  contenido: Contenido
}

export interface ProgresoLeccion {
  id: number
  leccion: number
  leccion_titulo: string
  completada: boolean
  fecha_inicio: string
  fecha_completacion: string | null
}

const LECCIONES_ENDPOINT = getApiUrl("/api/capacitaciones/lecciones/")
const PROGRESO_ENDPOINT = getApiUrl("/api/capacitaciones/lecciones/mi_progreso/")

export async function obtenerLecciones(): Promise<Leccion[]> {
  const response = await fetch(LECCIONES_ENDPOINT, {
    headers: buildAuthHeaders(),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("No se pudieron cargar las lecciones de capacitacion.")
  }

  const data = (await response.json()) as Leccion[] | { results?: Leccion[] }
  return Array.isArray(data) ? data : data.results ?? []
}

export async function obtenerLeccionDetalle(id: number): Promise<LeccionDetalle> {
  const response = await fetch(`${LECCIONES_ENDPOINT}${id}/`, {
    headers: buildAuthHeaders(),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("No se pudo cargar la leccion.")
  }

  return (await response.json()) as LeccionDetalle
}

export async function marcarLeccionCompletada(id: number): Promise<ProgresoLeccion> {
  const response = await fetch(`${LECCIONES_ENDPOINT}${id}/marcar_completada/`, {
    method: "POST",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
  })

  if (!response.ok) {
    throw new Error("No se pudo marcar la leccion como completada.")
  }

  return (await response.json()) as ProgresoLeccion
}

export async function obtenerProgreso(): Promise<ProgresoLeccion[]> {
  const response = await fetch(PROGRESO_ENDPOINT, {
    headers: buildAuthHeaders(),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("No se pudo cargar el progreso.")
  }

  return (await response.json()) as ProgresoLeccion[]
}
