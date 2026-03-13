'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Copy, Check } from 'lucide-react'
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
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(refactored.refactored_code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

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
        <div className="px-4 py-1.5 flex items-center justify-between">
          <span className="text-xs font-mono text-emerald-600 uppercase tracking-widest">Refactored</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono border border-zinc-700 hover:border-emerald-600 hover:text-emerald-400 text-zinc-500 transition-colors"
            title="Copy refactored code"
          >
            {copied
              ? <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copied</span></>
              : <><Copy className="w-3 h-3" /><span>Copy</span></>
            }
          </button>
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
