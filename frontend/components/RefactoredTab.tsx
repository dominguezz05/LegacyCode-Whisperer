'use client'

import dynamic from 'next/dynamic'
import { RefactorResponse } from '@/lib/types'

const DiffEditor = dynamic(
  () => import('@monaco-editor/react').then((m) => m.DiffEditor),
  { ssr: false, loading: () => <div className="flex-1 bg-zinc-900 animate-pulse" /> }
)

interface RefactoredTabProps {
  refactored: RefactorResponse
  originalCode: string
  monacoLang: string
}

export function RefactoredTab({ refactored, originalCode, monacoLang }: RefactoredTabProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Explanation banner */}
      <div className="border-b border-zinc-800 bg-zinc-900/60 px-4 py-3">
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1">
          Refactor summary
        </p>
        <p className="text-sm text-zinc-300 leading-relaxed">{refactored.explanation}</p>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-2 border-b border-zinc-800 bg-zinc-950 shrink-0">
        <div className="px-4 py-1.5 border-r border-zinc-800">
          <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest">Original</span>
        </div>
        <div className="px-4 py-1.5">
          <span className="text-xs font-mono text-emerald-600 uppercase tracking-widest">Refactored</span>
        </div>
      </div>

      {/* Monaco diff editor */}
      <div className="flex-1 min-h-0">
        <DiffEditor
          height="100%"
          language={monacoLang}
          original={originalCode}
          modified={refactored.refactored_code}
          theme="vs-dark"
          options={{
            fontSize: 12,
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 10, bottom: 10 },
            readOnly: true,
            renderSideBySide: true,
            overviewRulerLanes: 0,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              verticalScrollbarSize: 5,
              horizontalScrollbarSize: 5,
            },
          }}
        />
      </div>
    </div>
  )
}
