import { describe, expect, it, vi, beforeEach } from 'vitest'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import { useEip5792AtomicCapability } from './useEip5792Capabilities'

vi.mock('wagmi', async () => {
  const actual = await vi.importActual<typeof import('wagmi')>('wagmi')
  return {
    ...actual,
    useCapabilities: vi.fn(),
  }
})

vi.mock('@repo/lib/modules/web3/UserAccountProvider', async () => {
  const actual = await vi.importActual<typeof import('@repo/lib/modules/web3/UserAccountProvider')>(
    '@repo/lib/modules/web3/UserAccountProvider'
  )

  return {
    ...actual,
    useUserAccount: vi.fn(),
  }
})

describe('useEip5792AtomicCapability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  async function setupMocks(opts: {
    atomicStatus?: 'supported' | 'ready' | 'unsupported'
    userAddress?: string
    chainId?: number
  }) {
    const { useCapabilities } = await import('wagmi')

    const { useUserAccount } = await import('@repo/lib/modules/web3/UserAccountProvider')

    ;(useUserAccount as ReturnType<typeof vi.fn>).mockReturnValue({
      userAddress: opts.userAddress ?? '0x1234567890123456789012345678901234567890',
      chainId: opts.chainId ?? 1,
    })

    ;(useCapabilities as ReturnType<typeof vi.fn>).mockReturnValue({
      data: opts.atomicStatus ? { atomic: { status: opts.atomicStatus } } : undefined,
      isLoading: false,
    })
  }

  it('returns "supported" when the wallet reports atomic supported', async () => {
    await setupMocks({ atomicStatus: 'supported' })

    const { result } = testHook(() => useEip5792AtomicCapability())

    await waitFor(() => expect(result.current.atomicStatus).toBe('supported'))
  })

  it('returns "ready" when the wallet reports atomic ready', async () => {
    await setupMocks({ atomicStatus: 'ready' })

    const { result } = testHook(() => useEip5792AtomicCapability())

    await waitFor(() => expect(result.current.atomicStatus).toBe('ready'))
  })

  it('returns "unsupported" when the wallet reports atomic unsupported', async () => {
    await setupMocks({ atomicStatus: 'unsupported' })

    const { result } = testHook(() => useEip5792AtomicCapability())

    await waitFor(() => expect(result.current.atomicStatus).toBe('unsupported'))
  })

  it('returns undefined when capabilities data is not available', async () => {
    await setupMocks({ atomicStatus: undefined })

    const { result } = testHook(() => useEip5792AtomicCapability())

    await waitFor(() => expect(result.current.atomicStatus).toBeUndefined())
  })
})
