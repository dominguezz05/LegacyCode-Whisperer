'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Wrench } from 'lucide-react'
import { RefactoringSuggestion } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

const ReactDiffViewer = dynamic(
  () => import('react-diff-viewer-continued'),
  {
    ssr: false,
    loading: () => <div className="h-16 bg-zinc-800 animate-pulse" />,
  }
)

const diffStyles = {
  variables: {
    dark: {
      diffViewerBackground: '#09090b',
      diffViewerColor: '#e4e4e7',
      addedBackground: '#052e16',
      addedColor: '#86efac',
      removedBackground: '#1c0a0a',
      removedColor: '#fca5a5',
      wordAddedBackground: '#14532d',
      wordRemovedBackground: '#7f1d1d',
      gutterBackground: '#18181b',
      gutterColor: '#52525b',
      codeFoldBackground: '#18181b',
      emptyLineBackground: '#09090b',
      highlightBackground: '#1c1917',
      highlightGutterBackground: '#1c1917',
      codeFoldContentColor: '#71717a',
    },
  },
}

type Priority = 'high' | 'medium' | 'low'

const priorityVariant: Record<Priority, 'high' | 'medium' | 'low'> = {
  high: 'high',
  medium: 'medium',
  low: 'low',
}

interface RefactoringTabProps {
  suggestions: RefactoringSuggestion[]
}

export function RefactoringTab({ suggestions }: RefactoringTabProps) {
  if (suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Wrench className="w-8 h-8 text-zinc-700" />
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">No suggestions</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {suggestions.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="border border-zinc-800 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border-b border-zinc-800">
            <Badge variant={priorityVariant[s.priority]}>{s.priority}</Badge>
            <code className="text-xs font-mono text-zinc-600">{s.category}</code>
            <span className="flex-1 text-xs text-zinc-300 truncate">{s.description}</span>
          </div>

          {/* Diff */}
          {s.before_snippet && s.after_snippet ? (
            <div className="overflow-x-auto text-xs diff-viewer-wrapper">
              <ReactDiffViewer
                oldValue={s.before_snippet}
                newValue={s.after_snippet}
                splitView={false}
                useDarkTheme={true}
                styles={diffStyles}
                hideLineNumbers={false}
              />
            </div>
          ) : null}
        </motion.div>
      ))}
    </div>
  )
}
