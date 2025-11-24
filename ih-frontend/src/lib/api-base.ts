const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`)

const appendPath = (base: string, path: string) => `${stripTrailingSlash(base)}${ensureLeadingSlash(path)}`

const containsApiSegment = (value: string) => /\/api(\b|\/)/i.test(value)

const normalizeEnvBase = (value?: string | null, defaultSuffix = '/api/v1') => {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const normalized = stripTrailingSlash(trimmed)
  return containsApiSegment(normalized) ? normalized : appendPath(normalized, defaultSuffix)
}

const resolveDeploymentUrl = () => {
  const candidate = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL
  if (!candidate) return null
  return candidate.startsWith('http') ? candidate : `https://${candidate}`
}

export const resolveApiBase = (pathSuffix = '/api/v1') => {
  const envBase = normalizeEnvBase(process.env.NEXT_PUBLIC_API_BASE_URL, pathSuffix)
  if (envBase) return envBase

  if (typeof window !== 'undefined') {
    return appendPath(window.location.origin, pathSuffix)
  }

  const deploymentUrl = resolveDeploymentUrl()
  if (deploymentUrl) {
    return appendPath(deploymentUrl, pathSuffix)
  }

  return appendPath('http://localhost:8000', pathSuffix)
}
