import { PropsWithChildren } from 'react'
import { Address } from 'viem'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { useLegacyV1Positions } from './useLegacyV1Positions'

const USER = '0x68a17b587caf4f9329f0e372e3a78d23a46de6b5'
const OTHER_USER = '0xa354853c610c683fec13c828c39b22575838458d'

// `vi.mock` is hoisted above the imports, so the pool list it closes over has to be hoisted too.
// Long enough to need two chunks at POOL_BATCH_SIZE (150), short enough to assert on.
const { mockPools } = vi.hoisted(() => {
  const POOL_COUNT = 160

  return {
    mockPools: Array.from(
      { length: POOL_COUNT },
      (_, i) => `0x${(i + 1).toString(16).padStart(40, '0')}`
    ),
  }
})

const POOL_WITH_BALANCE = mockPools[0] as Address
const POOL_NEAR_END = mockPools[mockPools.length - 1] as Address

const HAS_V1_POOLS_KEY = LS_KEYS.HasV1Pools
const HAS_V1_POOLS_ADDRESS_KEY = `${LS_KEYS.HasV1Pools}:address`

type CallResult = { status: 'success'; result: bigint } | { status: 'failure'; error: Error }

let mockUser = { userAddress: USER, isConnected: true }
let mockIsBalancer = true
let mockClient: MulticallClient | undefined
let multicallImpl: (contracts: { address: string }[]) => CallResult[]

vi.mock('@repo/lib/modules/web3/UserAccountProvider', () => ({
  useUserAccount: () => mockUser,
}))

// A getter so the flag can be flipped per test: the hook reads it at render, not at import.
vi.mock('@repo/lib/config/getProjectConfig', () => ({
  get isBalancer() {
    return mockIsBalancer
  },
}))

vi.mock('wagmi', () => ({
  usePublicClient: () => mockClient,
}))

vi.mock('./balancerV1PoolAddresses', () => ({
  balancerV1PoolAddresses: mockPools,
}))

type MulticallClient = { multicall: ReturnType<typeof vi.fn> }

const balancesFor = (balances: Record<string, bigint>) => (contracts: { address: string }[]) =>
  contracts.map(({ address }) => {
    const balance = balances[address.toLowerCase()] ?? 0n

    return { status: 'success' as const, result: balance }
  })

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  })

  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useLegacyV1Positions', () => {
  // Assigned directly rather than through `vi.stubGlobal`: the idle callbacks have to survive the
  // unmount cleanup that runs after each test, which an auto-unstub would tear down first.
  beforeAll(() => {
    window.requestIdleCallback = (callback: IdleRequestCallback) => window.setTimeout(callback, 0)
    window.cancelIdleCallback = (id: number) => window.clearTimeout(id)
  })

  beforeEach(() => {
    window.localStorage.clear()
    mockUser = { userAddress: USER, isConnected: true }
    mockIsBalancer = true
    multicallImpl = balancesFor({})

    mockClient = {
      multicall: vi.fn(async ({ contracts }: { contracts: { address: string }[] }) =>
        multicallImpl(contracts)
      ),
    }
  })

  test('answers from the stored result without scanning', async () => {
    window.localStorage.setItem(HAS_V1_POOLS_KEY, 'true')
    window.localStorage.setItem(HAS_V1_POOLS_ADDRESS_KEY, USER)

    const { result } = renderHook(() => useLegacyV1Positions(), { wrapper: createWrapper() })

    expect(result.current.hasLegacyV1Positions).toBe(true)
    await waitFor(() => expect(mockClient?.multicall).not.toHaveBeenCalled())
  })

  test('scans in chunks and stores a true result when a position is found', async () => {
    multicallImpl = balancesFor({ [POOL_WITH_BALANCE.toLowerCase()]: 42n })

    const { result } = renderHook(() => useLegacyV1Positions(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.hasLegacyV1Positions).toBe(true))

    expect(result.current.legacyV1PositionCount).toBe(1)
    expect(result.current.legacyV1Positions[0]?.pool).toBe(POOL_WITH_BALANCE)
    expect(window.localStorage.getItem(HAS_V1_POOLS_KEY)).toBe('true')
    expect(window.localStorage.getItem(HAS_V1_POOLS_ADDRESS_KEY)).toBe(USER)

    // 160 pools at a 150 batch size: two multicalls, none of them oversized.
    expect(mockClient?.multicall).toHaveBeenCalledTimes(2)
    const sizes = mockClient?.multicall.mock.calls.map(([options]) => options.contracts.length)
    expect(sizes).toEqual([150, 10])
  })

  test('stores a false result for a wallet with no positions', async () => {
    const { result } = renderHook(() => useLegacyV1Positions(), { wrapper: createWrapper() })

    await waitFor(() => expect(window.localStorage.getItem(HAS_V1_POOLS_KEY)).toBe('false'))

    expect(result.current.hasLegacyV1Positions).toBe(false)
  })

  test('retries a dropped batch once before reporting a result', async () => {
    let attempt = 0

    multicallImpl = contracts => {
      attempt++

      // First attempt drops the whole batch — the RPC-truncation failure mode.
      if (attempt === 1) {
        return contracts.map(() => ({ status: 'failure', error: new Error('dropped') }))
      }

      return balancesFor({ [POOL_NEAR_END.toLowerCase()]: 7n })(contracts)
    }

    const { result } = renderHook(() => useLegacyV1Positions(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.hasLegacyV1Positions).toBe(true))

    expect(result.current.legacyV1Positions[0]?.pool).toBe(POOL_NEAR_END)
  })

  test('never caches an answer built from dropped reads', async () => {
    multicallImpl = contracts =>
      contracts.map(() => ({ status: 'failure', error: new Error('dropped') }))

    const { result } = renderHook(() => useLegacyV1Positions(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(window.localStorage.getItem(HAS_V1_POOLS_KEY)).toBeNull()
    expect(window.localStorage.getItem(HAS_V1_POOLS_ADDRESS_KEY)).toBeNull()
  })

  test('does not reuse another address result', async () => {
    window.localStorage.setItem(HAS_V1_POOLS_KEY, 'true')
    window.localStorage.setItem(HAS_V1_POOLS_ADDRESS_KEY, USER)
    mockUser = { userAddress: OTHER_USER, isConnected: true }

    const { result } = renderHook(() => useLegacyV1Positions(), { wrapper: createWrapper() })

    expect(result.current.hasLegacyV1Positions).toBe(false)

    // The stored answer did not apply, so this wallet gets swept and cached on its own behalf.
    await waitFor(() =>
      expect(window.localStorage.getItem(HAS_V1_POOLS_ADDRESS_KEY)).toBe(OTHER_USER)
    )
  })

  test('does not scan in the Beets app, which shares this package', async () => {
    mockIsBalancer = false

    renderHook(() => useLegacyV1Positions(), { wrapper: createWrapper() })

    await new Promise(resolve => setTimeout(resolve, 20))

    expect(mockClient?.multicall).not.toHaveBeenCalled()
  })

  test('does not scan while disconnected', async () => {
    mockUser = { userAddress: undefined as unknown as string, isConnected: false }

    renderHook(() => useLegacyV1Positions(), { wrapper: createWrapper() })

    await new Promise(resolve => setTimeout(resolve, 20))

    expect(mockClient?.multicall).not.toHaveBeenCalled()
  })
})
