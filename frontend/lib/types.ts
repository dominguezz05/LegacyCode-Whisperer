export interface SecurityRisk {
  severity: 'critical' | 'high' | 'medium' | 'low'
  description: string
  line_hint: string | null
}

export interface RefactoringSuggestion {
  priority: 'high' | 'medium' | 'low'
  category: string
  description: string
  before_snippet: string | null
  after_snippet: string | null
}

export interface ComplexityFunction {
  name: string
  complexity: number
  rank: string
  lineno: number
}

export interface ComplexityReport {
  functions: ComplexityFunction[]
  average_complexity: number
  maintainability_index: number
  radon_mi_rank: string
  parse_error?: string
}

export interface AnalysisResponse {
  maintainability_score: number
  complexity_report: ComplexityReport
  security_risks: SecurityRisk[]
  refactoring_suggestions: RefactoringSuggestion[]
  plain_english_summary: string
}

export interface RefactorResponse {
  refactored_code: string
  explanation: string
}

export interface AuditRecord extends AnalysisResponse {
  id: string
  created_at: string
  language: string
  code_snippet: string
}
