import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getScoreColor(score: number): string {
  if (score >= 70) return '#10b981' // emerald-500
  if (score >= 40) return '#fbbf24' // amber-400
  return '#ef4444'                  // red-500
}

export function getScoreLabel(score: number): string {
  if (score >= 70) return 'HEALTHY'
  if (score >= 40) return 'DEGRADED'
  return 'CRITICAL'
}
