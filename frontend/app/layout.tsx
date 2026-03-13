import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { Terminal } from 'lucide-react'
import { HeaderUserMenu } from '@/components/HeaderUserMenu'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: {
    default: 'LegacyCode Whisperer',
    template: '%s | LegacyCode Whisperer',
  },
  description:
    'AI-powered technical debt auditor. Paste legacy code and get instant maintainability scores, security risks, and AI-generated refactoring suggestions.',
  keywords: [
    'technical debt',
    'code review',
    'AI code analysis',
    'legacy code',
    'refactoring',
    'code quality',
    'maintainability',
    'security audit',
  ],
  authors: [{ name: 'LegacyCode Whisperer' }],
  openGraph: {
    title: 'LegacyCode Whisperer',
    description: 'AI-powered technical debt auditor — instant maintainability scores & refactoring.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'LegacyCode Whisperer',
    description: 'AI-powered technical debt auditor — instant maintainability scores & refactoring.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-zinc-950 text-zinc-100 antialiased`} suppressHydrationWarning>
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

          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-zinc-600">:8000</span>
            </div>
            <HeaderUserMenu />
          </div>
        </header>

        <main className="h-[calc(100vh-2.75rem)]">
          {children}
        </main>
      </body>
    </html>
  )
}
