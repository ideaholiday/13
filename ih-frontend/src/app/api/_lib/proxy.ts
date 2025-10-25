import { NextResponse } from 'next/server'

const TIMEOUT_MS = 20_000

function baseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1'
}

function withTimeout(init?: RequestInit): { controller: AbortController; init: RequestInit } {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const initWithTimeout: RequestInit = {
    ...init,
    signal: controller.signal,
  }
  // Ensure timeout cleanup happens after response/throw in callers
  ;(initWithTimeout as any).__timeoutId = id
  return { controller, init: initWithTimeout }
}

async function finalizeTimeout(init?: RequestInit) {
  const id = (init as any)?.__timeoutId as ReturnType<typeof setTimeout> | undefined
  if (id) clearTimeout(id)
}

function getIdempotencyKey(req: Request): string | null {
  return req.headers.get('Idempotency-Key') || null
}

async function parseBodySafe(res: Response): Promise<any> {
  const text = await res.text()
  try {
    return text ? JSON.parse(text) : null
  } catch {
    return { message: text }
  }
}

function toErrorShape(input: any, fallbackStatus: number) {
  if (!input) return { status: fallbackStatus, body: { message: 'Request failed' } }
  const code = input.code || input.errorCode || input.ErrorCode
  const message = input.message || input.error || input.ErrorMessage || 'Request failed'
  const details = input.details || input.data || input.Error || undefined
  return { status: fallbackStatus, body: { code, message, details } }
}

export async function proxyGET(req: Request, path: string) {
  const url = new URL(req.url)
  const upstream = new URL(path, baseUrl())
  upstream.search = url.search

  const { init } = withTimeout({
    method: 'GET',
    headers: Object.fromEntries(
      Object.entries({
        Accept: 'application/json',
        'X-API-Key': process.env.BACKEND_API_KEY || '',
      }).filter(([_, v]) => v !== '' && v != null)
    ),
    // signal attached by withTimeout
  })

  try {
    const res = await fetch(upstream.toString(), init)
    const data = await parseBodySafe(res)
    await finalizeTimeout(init)
    if (!res.ok) {
      const err = toErrorShape(data, res.status)
      return NextResponse.json(err.body, { status: err.status })
    }
    return NextResponse.json(data, { status: res.status })
  } catch (e: any) {
    await finalizeTimeout(init)
    const aborted = e?.name === 'AbortError'
    const msg = aborted ? 'Upstream timeout after 20s' : (e?.message || 'Upstream request failed')
    return NextResponse.json({ message: msg }, { status: aborted ? 504 : 502 })
  }
}

export async function proxyPOST(req: Request, path: string) {
  // We forward raw body to avoid double-encoding
  const upstream = new URL(path, baseUrl())
  const bodyText = await req.text()
  const contentType = req.headers.get('content-type') || 'application/json'
  const idempotency = getIdempotencyKey(req)
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': contentType,
  }
  if (idempotency) headers['Idempotency-Key'] = idempotency
  if (process.env.BACKEND_API_KEY) headers['X-API-Key'] = process.env.BACKEND_API_KEY

  const { init } = withTimeout({
    method: 'POST',
    headers,
    body: bodyText || undefined,
  })

  try {
    const res = await fetch(upstream.toString(), init)
    const data = await parseBodySafe(res)
    await finalizeTimeout(init)
    if (!res.ok) {
      const err = toErrorShape(data, res.status)
      return NextResponse.json(err.body, { status: err.status })
    }
    return NextResponse.json(data, { status: res.status })
  } catch (e: any) {
    await finalizeTimeout(init)
    const aborted = e?.name === 'AbortError'
    const msg = aborted ? 'Upstream timeout after 20s' : (e?.message || 'Upstream request failed')
    return NextResponse.json({ message: msg }, { status: aborted ? 504 : 502 })
  }
}
