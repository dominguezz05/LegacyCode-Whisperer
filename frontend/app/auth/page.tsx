'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Terminal,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Mode = 'login' | 'signup'

export default function AuthPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setMessage(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/')
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Account created — check your email to confirm before logging in.')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #3f3f46 1px, transparent 1px), linear-gradient(to bottom, #3f3f46 1px, transparent 1px)',
          backgroundSize: '3rem 3rem',
        }}
      />

      {/* Amber glow blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[22rem]"
      >
        {/* Terminal window card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-2xl shadow-black/70">

          {/* Titlebar */}
          <div className="flex items-center gap-2.5 px-4 py-3 bg-zinc-800/50 border-b border-zinc-700/60">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-400/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
            </div>
            <span className="flex-1 text-center text-[10px] font-mono text-zinc-500 tracking-widest uppercase select-none">
              {mode === 'login' ? 'session — auth/login' : 'session — auth/register'}
            </span>
          </div>

          {/* Logo */}
          <div className="flex flex-col items-center gap-1.5 pt-8 pb-1">
            <div className="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-amber-400" />
            </div>
            <h1 className="font-mono text-sm font-semibold tracking-tight mt-1">
              Legacy<span className="text-amber-400">Code</span>
              <span className="text-zinc-500 font-normal"> Whisperer</span>
            </h1>
            <p className="text-[10px] font-mono text-zinc-600 tracking-wider uppercase">
              AI-powered technical debt auditor
            </p>
          </div>

          {/* Mode tabs */}
          <div className="flex border-b border-zinc-800 mx-6 mt-6">
            {(['login', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 text-xs font-mono uppercase tracking-widest transition-colors ${
                  mode === m
                    ? 'text-amber-400 border-b-2 border-amber-400 -mb-px'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {m === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 pt-5 pb-6 space-y-4">
            {/* Email field */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                <Mail className="w-3 h-3" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="user@example.com"
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm font-mono text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-colors"
              />
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                <Lock className="w-3 h-3" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 pr-9 text-sm font-mono text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  {showPassword
                    ? <EyeOff className="w-3.5 h-3.5" />
                    : <Eye className="w-3.5 h-3.5" />
                  }
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-[10px] font-mono text-zinc-600">Minimum 6 characters</p>
              )}
            </div>

            {/* Feedback banners */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-2 bg-red-950/30 border border-red-800/50 rounded px-3 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                    <span className="text-xs font-mono text-red-400">{error}</span>
                  </div>
                </motion.div>
              )}
              {message && (
                <motion.div
                  key="message"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-2 bg-emerald-950/30 border border-emerald-800/50 rounded px-3 py-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-xs font-mono text-emerald-400">{message}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-mono font-semibold text-sm py-2.5 rounded transition-colors"
            >
              {loading ? (
                <span className="text-[11px] tracking-widest uppercase animate-pulse">
                  Authenticating...
                </span>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Login
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer hint */}
        <p className="text-center text-[10px] font-mono text-zinc-700 mt-4 tracking-wider">
          Secure sessions · Groq + Llama 3.3 70B
        </p>
      </motion.div>
    </div>
  )
}
