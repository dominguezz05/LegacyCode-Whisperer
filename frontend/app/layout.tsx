import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { Terminal } from 'lucide-react'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'LegacyCode Whisperer',
  description: 'AI-powered technical debt auditor',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-zinc-950 text-zinc-100 antialiased`}>
        <header className="h-11 border-b border-zinc-800 flex items-center px-4 gap-6 bg-zinc-950 sticky top-0 z-50">
          <Link href="/" className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-sm font-semibold tracking-tight">
              Legacy<span className="text-amber-400">Code</span>
              <span className="text-zinc-500 font-normal"> Whisperer</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1 ml-2">
            <Link
              href="/"
              className="text-xs font-mono text-zinc-500 hover:text-zinc-100 transition-colors px-2 py-1 uppercase tracking-widest"
            >
              Analyzer
            </Link>
            <Link
              href="/history"
              className="text-xs font-mono text-zinc-500 hover:text-zinc-100 transition-colors px-2 py-1 uppercase tracking-widest"
            >
              History
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-zinc-600">:8000</span>
          </div>
        </header>

        <main className="h-[calc(100vh-2.75rem)]">
          {children}
        </main>
      </body>
    </html>
  )
}
