export type AuthTokens = {
  access: string
  refresh: string | null
}

export type AuthSession = {
  tokens: AuthTokens
  user: Record<string, unknown> | null
}

export type LoginPayload = {
  username: string
  password: string
}

export type RegisterPayload = {
  username: string
  password: string
  passwordConfirm: string
  email?: string
}

export type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
  newPasswordConfirm: string
}

export class AuthApiError extends Error {
  status: number
  details: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = "AuthApiError"
    this.status = status
    this.details = details
  }
}

const STORAGE_KEY = "treck-auth-session"
const DEFAULT_API_BASE_URL = "http://localhost:8000"
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, "")

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function pickString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null
}

function findNestedRecord(payload: unknown, keys: string[]): Record<string, unknown> | null {
  if (!isRecord(payload)) return null

  for (const key of keys) {
    const value = payload[key]
    if (isRecord(value)) return value
  }

  return null
}

function extractTokens(payload: unknown, fallbackRefresh: string | null = null): AuthTokens | null {
  if (!isRecord(payload)) return null

  const rootAccess = pickString(payload.access) ?? pickString(payload.token) ?? pickString(payload.jwt)
  const rootRefresh = pickString(payload.refresh) ?? pickString(payload.refreshToken)

  if (rootAccess) {
    return {
      access: rootAccess,
      refresh: rootRefresh ?? fallbackRefresh,
    }
  }

  const nested = findNestedRecord(payload, ["data", "tokens", "auth", "session", "result"])
  if (!nested) return null

  const nestedAccess = pickString(nested.access) ?? pickString(nested.token) ?? pickString(nested.jwt)
  const nestedRefresh = pickString(nested.refresh) ?? pickString(nested.refreshToken)

  if (!nestedAccess) return null

  return {
    access: nestedAccess,
    refresh: nestedRefresh ?? fallbackRefresh,
  }
}

function extractUser(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null

  if (isRecord(payload.user)) return payload.user

  const nested = findNestedRecord(payload, ["data", "result", "profile"])
  if (nested && isRecord(nested.user)) return nested.user

  return null
}

async function requestJson<T>(path: string, init?: RequestInit, extraHeaders?: HeadersInit): Promise<T> {
  const headers = new Headers(init?.headers)
  const requestHeaders = new Headers(extraHeaders)

  requestHeaders.forEach((value, key) => {
    headers.set(key, value)
  })

  headers.set("Content-Type", "application/json")

  const requestInit: RequestInit = { headers }
  if (init) Object.assign(requestInit, init)

  const response = await fetch(buildUrl(path), requestInit)

  const contentType = response.headers.get("content-type") ?? ""
  const payload = contentType.includes("application/json") ? await response.json() : await response.text()

  if (!response.ok) {
    const message =
      (isRecord(payload) && (pickString(payload.detail) ?? pickString(payload.message) ?? pickString(payload.error))) ||
      (typeof payload === "string" && payload.trim()) ||
      "No se pudo completar la solicitud."

    throw new AuthApiError(message, response.status, payload)
  }

  return payload as T
}

function getWindowStorage() {
  if (typeof window === "undefined") return null
  return window.localStorage
}

export function saveAuthSession(session: AuthSession) {
  const storage = getWindowStorage()
  if (!storage) return

  storage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function loadAuthSession(): AuthSession | null {
  const storage = getWindowStorage()
  if (!storage) return null

  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as AuthSession
    if (!parsed?.tokens?.access) return null

    return {
      tokens: {
        access: parsed.tokens.access,
        refresh: parsed.tokens.refresh ?? null,
      },
      user: isRecord(parsed.user) ? parsed.user : null,
    }
  } catch {
    return null
  }
}

export function clearAuthSession() {
  const storage = getWindowStorage()
  if (!storage) return

  storage.removeItem(STORAGE_KEY)
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".")
  if (parts.length < 2) return null

  try {
    let base64 = ""
    for (const char of parts[1]) {
      if (char === "-") {
        base64 += "+"
      } else if (char === "_") {
        base64 += "/"
      } else {
        base64 += char
      }
    }
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
    const payload = atob(padded)
    return JSON.parse(payload) as Record<string, unknown>
  } catch {
    return null
  }
}

export function isJwtExpired(token: string | null | undefined, skewSeconds = 30) {
  if (!token) return true

  const payload = decodeJwtPayload(token)
  const exp = typeof payload?.exp === "number" ? payload.exp : Number(payload?.exp)
  if (!Number.isFinite(exp)) return false

  return exp <= Math.floor(Date.now() / 1000) + skewSeconds
}

export async function loginWithApi(payload: LoginPayload): Promise<AuthSession> {
  const response = await requestJson<unknown>("/api/users/auth/login/", {
    method: "POST",
    body: JSON.stringify(payload),
  })

  const tokens = extractTokens(response)
  if (!tokens?.access) {
    throw new AuthApiError("El servidor no devolvió un token de acceso.", 500, response)
  }

  return {
    tokens,
    user: extractUser(response),
  }
}

export async function registerWithApi(payload: RegisterPayload): Promise<AuthSession | null> {
  const response = await requestJson<unknown>("/api/users/auth/register/", {
    method: "POST",
    body: JSON.stringify({
      username: payload.username,
      password: payload.password,
      password_confirm: payload.passwordConfirm,
      ...(payload.email ? { email: payload.email } : {}),
    }),
  })

  const tokens = extractTokens(response)
  if (!tokens?.access) return null

  return {
    tokens,
    user: extractUser(response),
  }
}

export async function refreshAuthSession(refreshToken: string): Promise<AuthSession> {
  const response = await requestJson<unknown>("/api/users/auth/login/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh: refreshToken }),
  })

  const tokens = extractTokens(response, refreshToken)
  if (!tokens?.access) {
    throw new AuthApiError("No se pudo renovar la sesión.", 500, response)
  }

  return {
    tokens,
    user: extractUser(response),
  }
}

export async function changePasswordWithApi(payload: ChangePasswordPayload, accessToken?: string | null) {
  const token = accessToken ?? loadAuthSession()?.tokens.access ?? null

  await requestJson<unknown>(
    "/api/users/auth/change-password/",
    {
      method: "POST",
      body: JSON.stringify({
        current_password: payload.currentPassword,
        new_password: payload.newPassword,
        new_password_confirm: payload.newPasswordConfirm,
      }),
    },
    token ? { Authorization: `Bearer ${token}` } : undefined,
  )
}

export async function bootstrapAuthSession(): Promise<AuthSession | null> {
  const session = loadAuthSession()
  if (!session) return null

  if (session.tokens.access && !isJwtExpired(session.tokens.access)) {
    return session
  }

  if (!session.tokens.refresh) {
    clearAuthSession()
    return null
  }

  try {
    const refreshed = await refreshAuthSession(session.tokens.refresh)
    const nextSession: AuthSession = {
      tokens: refreshed.tokens,
      user: refreshed.user ?? session.user,
    }

    saveAuthSession(nextSession)
    return nextSession
  } catch {
    clearAuthSession()
    return null
  }
}