'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'

export function HeaderUserMenu() {
  const { user, loading } = useUser()
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    setOpen(false)
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  // Skeleton while resolving session
  if (loading) {
    return <div className="w-7 h-7 rounded-full bg-zinc-800 animate-pulse" />
  }

  if (!user) return null

  // Two-letter avatar from email
  const initials = (user.email ?? 'U').slice(0, 2).toUpperCase()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 group focus:outline-none"
        aria-label="Open user menu"
        aria-expanded={open}
      >
        {/* Avatar circle */}
        <div className="w-7 h-7 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center group-hover:border-amber-400/70 group-hover:bg-amber-400/15 transition-all duration-150">
          <span className="text-[10px] font-mono font-bold text-amber-400 select-none">
            {initials}
          </span>
        </div>
        <ChevronDown
          className={`w-3 h-3 text-zinc-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 top-full mt-2 z-50 w-56 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl shadow-black/60 overflow-hidden"
            >
              {/* User info */}
              <div className="px-3 py-2.5 border-b border-zinc-800">
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                  Signed in as
                </p>
                <p className="text-xs font-mono text-zinc-300 truncate mt-0.5">
                  {user.email}
                </p>
              </div>

              {/* Sign out */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-mono text-zinc-400 hover:text-red-400 hover:bg-red-950/20 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
