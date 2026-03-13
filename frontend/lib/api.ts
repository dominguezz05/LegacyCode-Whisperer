import { AnalysisResponse, AuditRecord, RefactorResponse, StreamEvent } from './types'
import { createClient } from './supabase/client'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ── Auth header helper ────────────────────────────────────────────────────────
// Reads the current Supabase session and returns headers with Bearer token.
// If the user is not logged in, returns headers without Authorization.

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }
  return headers
}


// ── Blocking endpoints (kept for Swagger / fallback) ─────────────────────────

export async function analyzeCode(code: string, language: string): Promise<AnalysisResponse> {
  const response = await fetch(`${BASE_URL}/api/v1/analyze/`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ code, language }),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }
  return response.json()
}

export async function refactorCode(code: string, language: string): Promise<RefactorResponse> {
  const response = await fetch(`${BASE_URL}/api/v1/refactor/`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ code, language }),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }
  return response.json()
}

// ── SSE parser ────────────────────────────────────────────────────────────────
// Consumes a POST response body as a Server-Sent Events stream.
// Yields one parsed StreamEvent per SSE message.

async function* parseSseStream(response: Response): AsyncGenerator<StreamEvent> {
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    // SSE events are separated by double newlines
    const parts = buffer.split('\n\n')
    buffer = parts.pop() ?? ''

    for (const part of parts) {
      const dataLine = part.split('\n').find((l) => l.startsWith('data: '))
      if (!dataLine) continue
      try {
        yield JSON.parse(dataLine.slice(6)) as StreamEvent
      } catch {
        // malformed SSE line — skip silently
      }
    }
  }
}

// ── Streaming endpoints ───────────────────────────────────────────────────────

export async function* streamAnalyzeCode(
  code: string,
  language: string
): AsyncGenerator<StreamEvent> {
  const response = await fetch(`${BASE_URL}/api/v1/analyze/stream`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ code, language }),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }
  yield* parseSseStream(response)
}

export async function* streamRefactorCode(
  code: string,
  language: string
): AsyncGenerator<StreamEvent> {
  const response = await fetch(`${BASE_URL}/api/v1/refactor/stream`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ code, language }),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }
  yield* parseSseStream(response)
}

// ── History ───────────────────────────────────────────────────────────────────

export async function getHistory(limit = 20): Promise<AuditRecord[]> {
  const response = await fetch(`${BASE_URL}/api/v1/history/?limit=${limit}`, {
    headers: await getAuthHeaders(),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

export async function getAuditById(id: string): Promise<AuditRecord> {
  const response = await fetch(`${BASE_URL}/api/v1/history/${id}`, {
    headers: await getAuthHeaders(),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}
