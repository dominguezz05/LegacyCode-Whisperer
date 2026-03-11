'use client'

import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import { SecurityRisk } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

type SeverityKey = 'critical' | 'high' | 'medium' | 'low'

const severityOrder: Record<SeverityKey, number> = {
  critical: 0, high: 1, medium: 2, low: 3,
}

interface RisksTabProps {
  risks: SecurityRisk[]
}

export function RisksTab({ risks }: RisksTabProps) {
  if (risks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Shield className="w-8 h-8 text-emerald-600" />
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">No risks detected</p>
      </div>
    )
  }

  const sorted = [...risks].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  )

  return (
    <div className="space-y-1.5">
      {sorted.map((risk, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className="border border-zinc-800 bg-zinc-900/40 p-3 flex gap-3 items-start"
        >
          <Badge variant={risk.severity}>{risk.severity}</Badge>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-sm text-zinc-300 leading-relaxed">{risk.description}</p>
            {risk.line_hint && (
              <code className="inline-block text-xs font-mono text-zinc-500 bg-zinc-800 px-1.5 py-0.5 border border-zinc-700">
                {risk.line_hint}
              </code>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
