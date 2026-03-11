'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react'
import { getHistory } from '@/lib/api'
import { AuditRecord } from '@/lib/types'
import { getScoreColor } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

function ScorePill({ score }: { score: number }) {
  return (
    <span className="font-mono text-sm font-bold w-8 text-right" style={{ color: getScoreColor(score) }}>
      {score}
    </span>
  )
}

export default function HistoryPage() {
  const [records, setRecords]   = useState<AuditRecord[]>([])
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    getHistory()
      .then(setRecords)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="p-6 space-y-1.5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-14 bg-zinc-900 animate-pulse border border-zinc-800" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="border border-red-900 bg-red-950/20 p-3 flex gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Clock className="w-8 h-8 text-zinc-700" />
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">No history yet</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-baseline gap-3 mb-5">
        <h1 className="text-xs font-mono text-zinc-400 uppercase tracking-[0.2em]">Audit History</h1>
        <span className="text-xs font-mono text-zinc-600">{records.length} records</span>
      </div>

      <div className="border border-zinc-800 divide-y divide-zinc-800">
        {records.map((record, i) => (
          <motion.div
            key={record.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.025 }}
          >
            {/* Row */}
            <button
              onClick={() => setExpanded(expanded === record.id ? null : record.id)}
              className="w-full flex items-center gap-4 px-4 py-3 hover:bg-zinc-900/60 transition-colors text-left group"
            >
              {expanded === record.id
                ? <ChevronDown className="w-3 h-3 text-zinc-600 shrink-0" />
                : <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />
              }

              <ScorePill score={record.maintainability_score} />
              <Badge variant="lang">{record.language}</Badge>

              <code className="flex-1 text-xs font-mono text-zinc-500 truncate">
                {record.code_snippet.split('\n').find(l => l.trim())?.trim() ?? '—'}
              </code>

              <div className="flex items-center gap-3 shrink-0">
                {record.security_risks.length > 0 && (
                  <span className="text-xs font-mono text-red-400">
                    {record.security_risks.length} risk{record.security_risks.length !== 1 ? 's' : ''}
                  </span>
                )}
                {record.refactoring_suggestions.length > 0 && (
                  <span className="text-xs font-mono text-amber-400">
                    {record.refactoring_suggestions.length} fix{record.refactoring_suggestions.length !== 1 ? 'es' : ''}
                  </span>
                )}
                <div className="flex items-center gap-1 text-xs font-mono text-zinc-600">
                  <Clock className="w-3 h-3" />
                  {new Date(record.created_at).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </div>
              </div>
            </button>

            {/* Expanded detail */}
            <AnimatePresence>
              {expanded === record.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-800 space-y-3">
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {record.plain_english_summary}
                    </p>
                    <pre className="text-xs font-mono text-zinc-500 bg-zinc-900 p-3 border border-zinc-800 overflow-x-auto max-h-48">
                      {record.code_snippet}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
