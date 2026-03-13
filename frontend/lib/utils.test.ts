import { describe, it, expect } from 'vitest'
import { cn, getScoreColor, getScoreLabel } from './utils'

// ── cn (clsx + tailwind-merge) ────────────────────────────────────────────────

describe('cn', () => {
  it('merges class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('deduplicates conflicting tailwind classes (last wins)', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('ignores falsy values', () => {
    expect(cn('foo', false && 'bar', undefined, null, '')).toBe('foo')
  })

  it('supports conditional object syntax', () => {
    expect(cn({ 'font-bold': true, italic: false })).toBe('font-bold')
  })
})

// ── getScoreColor ─────────────────────────────────────────────────────────────

describe('getScoreColor', () => {
  it('returns emerald for score >= 70', () => {
    expect(getScoreColor(70)).toBe('#10b981')
    expect(getScoreColor(100)).toBe('#10b981')
  })

  it('returns amber for score 40-69', () => {
    expect(getScoreColor(40)).toBe('#fbbf24')
    expect(getScoreColor(69)).toBe('#fbbf24')
  })

  it('returns red for score < 40', () => {
    expect(getScoreColor(0)).toBe('#ef4444')
    expect(getScoreColor(39)).toBe('#ef4444')
  })
})

// ── getScoreLabel ─────────────────────────────────────────────────────────────

describe('getScoreLabel', () => {
  it('returns HEALTHY for score >= 70', () => {
    expect(getScoreLabel(70)).toBe('HEALTHY')
    expect(getScoreLabel(100)).toBe('HEALTHY')
  })

  it('returns DEGRADED for score 40-69', () => {
    expect(getScoreLabel(40)).toBe('DEGRADED')
    expect(getScoreLabel(69)).toBe('DEGRADED')
  })

  it('returns CRITICAL for score < 40', () => {
    expect(getScoreLabel(0)).toBe('CRITICAL')
    expect(getScoreLabel(39)).toBe('CRITICAL')
  })
})
