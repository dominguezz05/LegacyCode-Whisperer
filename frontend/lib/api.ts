import { AnalysisResponse, AuditRecord, RefactorResponse } from './types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function analyzeCode(
  code: string,
  language: string
): Promise<AnalysisResponse> {
  const response = await fetch(`${BASE_URL}/api/v1/analyze/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language }),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }
  return response.json()
}

export async function refactorCode(
  code: string,
  language: string
): Promise<RefactorResponse> {
  const response = await fetch(`${BASE_URL}/api/v1/refactor/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language }),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }
  return response.json()
}

export async function getHistory(limit = 20): Promise<AuditRecord[]> {
  const response = await fetch(`${BASE_URL}/api/v1/history/?limit=${limit}`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

export async function getAuditById(id: string): Promise<AuditRecord> {
  const response = await fetch(`${BASE_URL}/api/v1/history/${id}`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}
