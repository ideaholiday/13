const BASE_ENV_KEYS = [
  'NEXT_PUBLIC_API_BASE_URL',
  'NEXT_PUBLIC_API_BASE'
] as const

function readEnvBase(): string | undefined {
  for (const key of BASE_ENV_KEYS) {
    const value = process.env[key]
    if (value && value.trim().length > 0) {
      return value.trim()
    }
  }
  return undefined
}

function ensureApiV1Suffix(base: string): string {
  const normalized = base.replace(/\/+$/, '')
  if (normalized.toLowerCase().endsWith('/api/v1')) {
    return normalized
  }
  return `${normalized}/api/v1`
}

/**
 * Resolve the API base URL for browser fetch calls.
 * Defaults to a relative `/api/v1` path so same-origin deployments work
 * without requiring `NEXT_PUBLIC_API_BASE_URL`.
 */
export function getApiBaseUrl(): string {
  const envBase = readEnvBase()
  if (!envBase) {
    return '/api/v1'
  }
  return ensureApiV1Suffix(envBase)
}

/**
 * Helper to join an endpoint to the resolved base without introducing
 * double slashes.
 */
export function buildApiUrl(endpoint: string): string {
  const base = getApiBaseUrl().replace(/\/+$/, '')
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${base}${path}`
}
