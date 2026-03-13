import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { User } from '@supabase/supabase-js'

// ── Mock the Supabase browser client ─────────────────────────────────────────
// We mock at the module level so every createClient() call returns our stub.

const mockUnsubscribe = vi.fn()
const mockGetUser = vi.fn()
const mockOnAuthStateChange = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
    },
  }),
}))

// Import AFTER mock is registered
import { useUser } from './useUser'

// ── Helpers ───────────────────────────────────────────────────────────────────

function setupMocks(user: User | null) {
  mockGetUser.mockResolvedValue({ data: { user } })
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: mockUnsubscribe } },
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts with loading=true', () => {
    setupMocks(null)
    const { result } = renderHook(() => useUser())
    expect(result.current.loading).toBe(true)
  })

  it('resolves to user=null when unauthenticated', async () => {
    setupMocks(null)
    const { result } = renderHook(() => useUser())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toBeNull()
  })

  it('resolves to the user object when authenticated', async () => {
    const fakeUser = { id: 'uuid-123', email: 'test@example.com' } as User
    setupMocks(fakeUser)
    const { result } = renderHook(() => useUser())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toEqual(fakeUser)
  })

  it('unsubscribes from auth changes on unmount', async () => {
    setupMocks(null)
    const { unmount } = renderHook(() => useUser())
    await waitFor(() => expect(mockGetUser).toHaveBeenCalled())
    unmount()
    expect(mockUnsubscribe).toHaveBeenCalledOnce()
  })
})
