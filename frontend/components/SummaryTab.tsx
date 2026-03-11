'use client'

import { motion } from 'framer-motion'
import { ComplexityReport } from '@/lib/types'

interface SummaryTabProps {
  summary: string
  complexityReport: ComplexityReport
}

export function SummaryTab({ summary, complexityReport }: SummaryTabProps) {
  return (
    <div className="space-y-6">
      {/* Summary prose */}
      <div>
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3">
          — Analysis
        </p>
        <p className="text-sm text-zinc-300 leading-relaxed">{summary}</p>
      </div>

      {/* Stat grid */}
      <div>
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3">
          — Metrics
        </p>
        <div className="grid grid-cols-3 gap-px bg-zinc-800 border border-zinc-800">
          {[
            { label: 'Avg Complexity', value: complexityReport?.average_complexity ?? 0 },
            { label: 'MI Index', value: complexityReport?.maintainability_index ?? 0 },
            { label: 'MI Rank', value: complexityReport?.radon_mi_rank ?? 'N/A' },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900 p-3">
              <div className="text-xs font-mono text-zinc-500 mb-1 uppercase tracking-wider">
                {stat.label}
              </div>
              <div className="text-xl font-mono text-zinc-100">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Functions table */}
      {complexityReport?.functions?.length > 0 && (
        <div>
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3">
            — Functions
          </p>
          <div className="border border-zinc-800">
            <div className="grid grid-cols-4 px-3 py-1.5 bg-zinc-900 border-b border-zinc-800">
              {['Function', 'CC', 'Rank', 'Line'].map((h) => (
                <span key={h} className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                  {h}
                </span>
              ))}
            </div>
            {complexityReport.functions.map((fn, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="grid grid-cols-4 px-3 py-2 border-b border-zinc-800 last:border-0 hover:bg-zinc-900/50"
              >
                <span className="text-xs font-mono text-amber-400 truncate">{fn.name}</span>
                <span className="text-xs font-mono text-zinc-200">{fn.complexity}</span>
                <span className="text-xs font-mono text-zinc-400">{fn.rank}</span>
                <span className="text-xs font-mono text-zinc-500">{fn.lineno}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
