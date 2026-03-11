'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2, Circle } from 'lucide-react'
import { StreamPhase } from '@/lib/types'

interface PhaseStep {
  id: StreamPhase
  label: string
  sublabel: string
}

const ANALYZE_PHASES: PhaseStep[] = [
  { id: 'static_analysis', label: 'Static Analysis',  sublabel: 'Radon complexity metrics' },
  { id: 'ai_audit',        label: 'AI Audit',          sublabel: 'Groq · Llama 3.3 70B' },
  { id: 'building',        label: 'Building Report',   sublabel: 'Score blending & validation' },
]

const REFACTOR_PHASES: PhaseStep[] = [
  { id: 'refactoring', label: 'Refactoring', sublabel: 'Groq · Llama 3.3 70B' },
  { id: 'building',    label: 'Extracting',  sublabel: 'XML parsing' },
]

type StepStatus = 'done' | 'active' | 'pending'

function getStatus(step: StreamPhase, current: StreamPhase, phases: PhaseStep[]): StepStatus {
  if (current === 'done' || current === 'idle') {
    return current === 'done' ? 'done' : 'pending'
  }
  const ids = phases.map((p) => p.id)
  const currentIdx = ids.indexOf(current)
  const stepIdx = ids.indexOf(step)
  if (stepIdx < currentIdx) return 'done'
  if (step === current) return 'active'
  return 'pending'
}

interface StreamingLoaderProps {
  phase: StreamPhase
  tokens: string
  isRefactor?: boolean
}

export function StreamingLoader({ phase, tokens, isRefactor = false }: StreamingLoaderProps) {
  const tokenRef = useRef<HTMLPreElement>(null)
  const phases = isRefactor ? REFACTOR_PHASES : ANALYZE_PHASES

  // Auto-scroll the token terminal as tokens arrive
  useEffect(() => {
    if (tokenRef.current) {
      tokenRef.current.scrollTop = tokenRef.current.scrollHeight
    }
  }, [tokens])

  return (
    <div className="flex flex-col h-full p-5 gap-5 overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-amber-400"
        />
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          {isRefactor ? 'Refactoring' : 'Analyzing'}
        </span>
      </div>

      {/* ── Phase steps ────────────────────────────────────────────────────── */}
      <div className="space-y-3 shrink-0">
        {phases.map((step, i) => {
          const s = getStatus(step.id, phase, phases)
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3"
            >
              {/* Icon */}
              <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                {s === 'done'   && <Check    className="w-3.5 h-3.5 text-emerald-400" />}
                {s === 'active' && <Loader2  className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
                {s === 'pending'&& <Circle   className="w-3 h-3 text-zinc-700" />}
              </div>

              {/* Labels */}
              <div className="flex items-baseline gap-2">
                <span className={`text-xs font-mono transition-colors ${
                  s === 'done'    ? 'text-zinc-400 line-through decoration-zinc-600' :
                  s === 'active'  ? 'text-zinc-100' :
                                    'text-zinc-600'
                }`}>
                  {step.label}
                </span>
                <span className="text-[10px] font-mono text-zinc-700">
                  {step.sublabel}
                </span>
              </div>

              {/* Active timing pulse */}
              {s === 'active' && (
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="ml-auto text-[10px] font-mono text-amber-500"
                >
                  streaming
                </motion.span>
              )}
              {s === 'done' && (
                <span className="ml-auto text-[10px] font-mono text-emerald-700">done</span>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* ── Divider ────────────────────────────────────────────────────────── */}
      <div className="border-t border-zinc-800 shrink-0" />

      {/* ── Token terminal ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: tokens ? 1 : 0 }}
        className="flex-1 min-h-0 border border-zinc-800 flex flex-col bg-zinc-950"
      >
        {/* Terminal title bar */}
        <div className="h-7 border-b border-zinc-800 bg-zinc-900/60 flex items-center px-3 gap-2 shrink-0">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-zinc-700" />
            <div className="w-2 h-2 rounded-full bg-zinc-700" />
            <div className="w-2 h-2 rounded-full bg-zinc-700" />
          </div>
          <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest ml-1">
            {isRefactor ? 'output stream' : 'ai stream'}
          </span>
          {phase !== 'done' && phase !== 'idle' && (
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"
            />
          )}
        </div>

        {/* Token content */}
        <pre
          ref={tokenRef}
          className="flex-1 overflow-y-auto p-3 text-[11px] font-mono text-zinc-500 whitespace-pre-wrap break-all leading-relaxed scrollbar-thin"
        >
          {tokens || (
            <span className="text-zinc-700 italic">Waiting for AI response...</span>
          )}
          {/* Blinking block cursor */}
          {phase !== 'done' && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.7, repeat: Infinity }}
              className="inline-block w-[7px] h-[13px] bg-amber-400 align-middle ml-0.5"
            />
          )}
        </pre>
      </motion.div>
    </div>
  )
}
