'use client'

import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((m) => m.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 bg-zinc-900 flex items-center justify-center">
        <span className="text-xs font-mono text-zinc-600 animate-pulse">Loading editor...</span>
      </div>
    ),
  }
)

const PLACEHOLDER = `# Paste your legacy code here and run an audit.
# Example with intentional debt:

import os

def get_user(id):
    db = open('users.txt', 'r')
    data = db.read()
    users = data.split('\\n')
    for u in users:
        info = u.split(',')
        if info[0] == str(id):
            return info
    return None

def delete_user(id):
    os.system('rm -rf /users/' + id)

def login(user, pwd):
    query = "SELECT * FROM users WHERE user='" + user + "' AND pwd='" + pwd + "'"
    return query
`

interface CodeEditorProps {
  value: string
  language: string
  onChange: (value: string) => void
}

export function CodeEditor({ value, language, onChange }: CodeEditorProps) {
  return (
    <MonacoEditor
      height="100%"
      language={language}
      value={value || PLACEHOLDER}
      theme="vs-dark"
      onChange={(v) => onChange(v ?? '')}
      options={{
        fontSize: 13,
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        fontLigatures: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        renderLineHighlight: 'line',
        padding: { top: 12, bottom: 12 },
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        scrollbar: {
          vertical: 'visible',
          horizontal: 'visible',
          verticalScrollbarSize: 5,
          horizontalScrollbarSize: 5,
        },
        wordWrap: 'on',
      }}
    />
  )
}
