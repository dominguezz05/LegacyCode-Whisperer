'use client'

import { useState } from 'react'
import { Play, Wand2 } from 'lucide-react'
import * as Select from '@radix-ui/react-select'
import { ChevronDown } from 'lucide-react'
import { CodeEditor } from '@/components/CodeEditor'
import { AnalysisPanel } from '@/components/AnalysisPanel'
import { analyzeCode, refactorCode } from '@/lib/api'
import { AnalysisResponse, RefactorResponse } from '@/lib/types'
import { cn } from '@/lib/utils'

const LANGUAGES: { value: string; label: string; ext: string; monacoLang: string }[] = [
  { value: 'python',     label: 'Python',      ext: 'py',    monacoLang: 'python' },
  { value: 'javascript', label: 'JavaScript',  ext: 'js',    monacoLang: 'javascript' },
  { value: 'typescript', label: 'TypeScript',  ext: 'ts',    monacoLang: 'typescript' },
  { value: 'jsx',        label: 'React JSX',   ext: 'jsx',   monacoLang: 'javascript' },
  { value: 'tsx',        label: 'React TSX',   ext: 'tsx',   monacoLang: 'typescript' },
  { value: 'java',       label: 'Java',        ext: 'java',  monacoLang: 'java' },
  { value: 'csharp',     label: 'C#',          ext: 'cs',    monacoLang: 'csharp' },
  { value: 'cpp',        label: 'C++',         ext: 'cpp',   monacoLang: 'cpp' },
  { value: 'c',          label: 'C',           ext: 'c',     monacoLang: 'c' },
  { value: 'go',         label: 'Go',          ext: 'go',    monacoLang: 'go' },
  { value: 'rust',       label: 'Rust',        ext: 'rs',    monacoLang: 'rust' },
  { value: 'php',        label: 'PHP',         ext: 'php',   monacoLang: 'php' },
  { value: 'ruby',       label: 'Ruby',        ext: 'rb',    monacoLang: 'ruby' },
  { value: 'swift',      label: 'Swift',       ext: 'swift', monacoLang: 'swift' },
  { value: 'kotlin',     label: 'Kotlin',      ext: 'kt',    monacoLang: 'kotlin' },
  { value: 'sql',        label: 'SQL',         ext: 'sql',   monacoLang: 'sql' },
  { value: 'shell',      label: 'Shell/Bash',  ext: 'sh',    monacoLang: 'shell' },
]

export default function HomePage() {
  const [code, setCode]         = useState('')
  const [language, setLanguage] = useState('python')
  const [result, setResult]     = useState<AnalysisResponse | null>(null)
  const [refactored, setRefactored] = useState<RefactorResponse | null>(null)
  const [isLoading, setLoading]       = useState(false)
  const [isRefactoring, setRefactoring] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const selectedLang = LANGUAGES.find((l) => l.value === language) ?? LANGUAGES[0]

  const handleAnalyze = async () => {
    if (!code.trim() || isLoading) return
    setLoading(true)
    setError(null)
    try {
      const data = await analyzeCode(code, language)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRefactor = async () => {
    if (!code.trim() || isRefactoring) return
    setRefactoring(true)
    setError(null)
    try {
      const data = await refactorCode(code, language)
      setRefactored(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refactoring failed')
    } finally {
      setRefactoring(false)
    }
  }

  const lineCount = code.trim() ? code.split('\n').length : 0

  return (
    <div className="flex h-full">
      {/* ── Left panel — Editor ─────────────────────────── */}
      <div className="w-[42%] flex flex-col border-r border-zinc-800">

        {/* Editor toolbar */}
        <div className="h-10 border-b border-zinc-800 flex items-center gap-3 px-3 bg-zinc-900/50 shrink-0">
          {/* Window dots */}
          <div className="flex gap-1.5">
            {['bg-zinc-700', 'bg-zinc-700', 'bg-zinc-700'].map((c, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full ${c}`} />
            ))}
          </div>

          <span className="text-xs font-mono text-zinc-600 select-none">
            {`legacy_code.${selectedLang.ext}`}
          </span>

          {/* Language selector */}
          <div className="ml-auto">
            <Select.Root value={language} onValueChange={setLanguage}>
              <Select.Trigger className="flex items-center gap-1 text-xs font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-800 border border-zinc-700 px-2 py-1 focus:outline-none cursor-pointer">
                <Select.Value />
                <Select.Icon>
                  <ChevronDown className="w-3 h-3 ml-0.5" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content
                  className="bg-zinc-900 border border-zinc-700 z-50 shadow-xl"
                  position="popper"
                  sideOffset={4}
                >
                  <Select.Viewport>
                    {LANGUAGES.map((lang) => (
                      <Select.Item
                        key={lang.value}
                        value={lang.value}
                        className="text-xs font-mono text-zinc-300 px-3 py-1.5 cursor-pointer focus:bg-zinc-800 focus:text-zinc-100 focus:outline-none data-[highlighted]:bg-zinc-800 data-[highlighted]:text-zinc-100"
                      >
                        <Select.ItemText>{lang.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>
        </div>

        {/* Monaco */}
        <div className="flex-1 min-h-0">
          <CodeEditor value={code} language={selectedLang.monacoLang} onChange={setCode} />
        </div>

        {/* Run bar */}
        <div className="h-11 border-t border-zinc-800 flex items-center px-3 gap-2 bg-zinc-900/50 shrink-0">
          <button
            onClick={handleAnalyze}
            disabled={isLoading || isRefactoring || !code.trim()}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-all active:scale-95',
              'bg-amber-400 text-zinc-950 hover:bg-amber-300',
              'disabled:opacity-30 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <div className="w-3 h-3 border border-zinc-800 border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                Run Audit
              </>
            )}
          </button>

          <button
            onClick={handleRefactor}
            disabled={isLoading || isRefactoring || !code.trim()}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-all active:scale-95',
              'bg-zinc-700 text-zinc-200 hover:bg-zinc-600 border border-zinc-600',
              'disabled:opacity-30 disabled:cursor-not-allowed'
            )}
          >
            {isRefactoring ? (
              <>
                <div className="w-3 h-3 border border-zinc-400 border-t-transparent rounded-full animate-spin" />
                Refactoring...
              </>
            ) : (
              <>
                <Wand2 className="w-3 h-3" />
                Refactor
              </>
            )}
          </button>

          <span className="text-xs font-mono text-zinc-600 ml-auto">
            {lineCount > 0 ? `${lineCount} lines` : 'No code'}
          </span>
        </div>
      </div>

      {/* ── Right panel — Results ───────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnalysisPanel
          result={result}
          refactored={refactored}
          originalCode={code}
          monacoLang={selectedLang.monacoLang}
          isLoading={isLoading}
          isRefactoring={isRefactoring}
          error={error}
        />
      </div>
    </div>
  )
}
