'use client'

import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScoreGauge } from '@/components/ScoreGauge'
import { RisksTab } from '@/components/RisksTab'
import { RefactoringTab } from '@/components/RefactoringTab'
import { SummaryTab } from '@/components/SummaryTab'
import { RefactoredTab } from '@/components/RefactoredTab'
import { AnalysisResponse, RefactorResponse } from '@/lib/types'

interface AnalysisPanelProps {
  result: AnalysisResponse | null
  refactored: RefactorResponse | null
  originalCode: string
  monacoLang: string
  error: string | null
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center select-none">
      <div className="w-14 h-14 border border-zinc-800 flex items-center justify-center">
        <span className="text-xl font-mono text-zinc-700">{'</>'}</span>
      </div>
      <div>
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          Awaiting analysis
        </p>
        <p className="text-xs font-mono text-zinc-700 mt-1">
          Paste code → Run Audit or Refactor
        </p>
      </div>
    </div>
  )
}

export function AnalysisPanel({
  result,
  refactored,
  originalCode,
  monacoLang,
  error,
}: AnalysisPanelProps) {
  if (error) {
    return (
      <div className="p-4">
        <div className="border border-red-900 bg-red-950/20 p-3 flex gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-mono text-red-400 uppercase tracking-wider mb-1">Error</p>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!result && !refactored) return <EmptyState />

  const risksCount = result?.security_risks.length ?? 0
  const suggestionsCount = result?.refactoring_suggestions.length ?? 0

  // Default to "refactored" tab when only a refactor has been run
  const defaultTab = result ? 'overview' : 'refactored'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full"
    >
      <Tabs defaultValue={defaultTab} className="flex flex-col h-full">
        <TabsList>
          <TabsTrigger value="overview" disabled={!result}>Overview</TabsTrigger>
          <TabsTrigger value="risks" disabled={!result}>
            Risks
            {risksCount > 0 && (
              <span className="ml-1 text-red-400">({risksCount})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="refactoring" disabled={!result}>
            Refactoring
            {suggestionsCount > 0 && (
              <span className="ml-1 text-amber-400">({suggestionsCount})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="summary" disabled={!result}>Summary</TabsTrigger>
          {refactored && (
            <TabsTrigger value="refactored">
              <span className="text-emerald-400">Refactored</span>
            </TabsTrigger>
          )}
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          {result && (
            <>
              <TabsContent value="overview">
                <div className="flex flex-col items-center gap-5">
                  <ScoreGauge score={result.maintainability_score} />

                  <div className="w-full grid grid-cols-2 gap-px bg-zinc-800 border border-zinc-800">
                    <div className="bg-zinc-900 p-3">
                      <div className="text-xs font-mono text-zinc-500 uppercase mb-1">Security Risks</div>
                      <div
                        className="text-2xl font-mono"
                        style={{ color: risksCount > 0 ? '#ef4444' : '#10b981' }}
                      >
                        {risksCount}
                      </div>
                    </div>
                    <div className="bg-zinc-900 p-3">
                      <div className="text-xs font-mono text-zinc-500 uppercase mb-1">Suggestions</div>
                      <div className="text-2xl font-mono text-amber-400">{suggestionsCount}</div>
                    </div>
                    <div className="bg-zinc-900 p-3">
                      <div className="text-xs font-mono text-zinc-500 uppercase mb-1">Avg Complexity</div>
                      <div className="text-2xl font-mono text-zinc-100">
                        {result.complexity_report?.average_complexity ?? 0}
                      </div>
                    </div>
                    <div className="bg-zinc-900 p-3">
                      <div className="text-xs font-mono text-zinc-500 uppercase mb-1">MI Rank</div>
                      <div className="text-2xl font-mono text-zinc-100">
                        {result.complexity_report?.radon_mi_rank ?? 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="risks">
                <RisksTab risks={result.security_risks} />
              </TabsContent>

              <TabsContent value="refactoring">
                <RefactoringTab suggestions={result.refactoring_suggestions} />
              </TabsContent>

              <TabsContent value="summary">
                <SummaryTab
                  summary={result.plain_english_summary}
                  complexityReport={result.complexity_report}
                />
              </TabsContent>
            </>
          )}

          {refactored && (
            <TabsContent value="refactored" className="h-full">
              <RefactoredTab
                refactored={refactored}
                originalCode={originalCode}
                monacoLang={monacoLang}
              />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </motion.div>
  )
}
