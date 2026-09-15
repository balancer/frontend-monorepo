'use client'

import { useEffect, useState } from 'react'
import { Address, PublicClient, parseAbi } from 'viem'
import { mainnet } from 'wagmi/chains'
import { usePublicClient } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { isBalancer } from '@repo/lib/config/getProjectConfig'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { balancerV1PoolAddresses } from './balancerV1PoolAddresses'

// Every pool version implements balanceOf, so one ABI covers the whole V1 list.
const balanceOfAbi = parseAbi(['function balanceOf(address account) view returns (uint256)'])

// Pinned rather than resolved per chain: the scan always reads mainnet, whatever chain is connected.
const MAINNET_MULTICALL3 = '0xca11bde05977b3631167028862be2a173976ca11'

/*
  ~3200 reads, so they go out in chunks: one oversized request is slower and some RPCs reject it
  outright. Chunking does not by itself make the sweep safe, though — public RPCs also truncate
  large batch responses (measured: one mainnet gateway dropped ~2000 of 3195 calls at this batch
  size and returned them as per-call failures). `allowFailure` would turn those into a
  clean-looking "no positions", so the scan counts failures and refuses to cache any result built
  from a batch that had one.
*/
const POOL_BATCH_SIZE = 150

const SCAN_STALE_TIME = Infinity

// Upper bound on how long the sweep waits for an idle frame before starting anyway.
const SCAN_DEFER_TIMEOUT = 2_000

// `hasV1Pools` -> 'true' | 'false', plus the address the answer was computed for.
const HAS_V1_POOLS_KEY = LS_KEYS.HasV1Pools
const HAS_V1_POOLS_ADDRESS_KEY = `${LS_KEYS.HasV1Pools}:address`

export type LegacyV1Position = { pool: Address; balance: bigint }

/*
  `hasV1Pools` holds the boolean answer of the last completed scan, qualified by the address it
  belongs to. The pairing is what makes the bare boolean safe: without it the next wallet to
  connect would inherit a stranger's answer and either miss its own positions or be shown an
  alert that isn't theirs.
*/
function readHasV1Pools(userAddress: Address): boolean | null {
  try {
    if (!isScanStoredFor(userAddress)) return null

    return window.localStorage.getItem(HAS_V1_POOLS_KEY) === 'true'
  } catch {
    return null
  }
}

function isScanStoredFor(userAddress: Address): boolean {
  try {
    const stored = window.localStorage.getItem(HAS_V1_POOLS_ADDRESS_KEY)

    return stored?.toLowerCase() === userAddress.toLowerCase()
  } catch {
    return false
  }
}

function writeHasV1Pools(userAddress: Address, hasV1Pools: boolean) {
  try {
    window.localStorage.setItem(HAS_V1_POOLS_KEY, String(hasV1Pools))
    window.localStorage.setItem(HAS_V1_POOLS_ADDRESS_KEY, userAddress)
  } catch {
    // Private browsing and similar: the result just won't be cached across sessions.
  }
}

async function readPoolBatch(
  client: PublicClient,
  pools: Address[],
  userAddress: Address
): Promise<{ positions: LegacyV1Position[]; failedCalls: number }> {
  const results = await client.multicall({
    multicallAddress: MAINNET_MULTICALL3,
    allowFailure: true,
    contracts: pools.map(address => ({
      abi: balanceOfAbi,
      address,
      functionName: 'balanceOf',
      args: [userAddress],
    })),
  })

  const positions: LegacyV1Position[] = []
  let failedCalls = 0

  results.forEach((result, index) => {
    if (result.status !== 'success') {
      failedCalls++

      return
    }

    const pool = pools[index]

    if (pool && result.result > 0n) positions.push({ pool, balance: result.result })
  })

  return { positions, failedCalls }
}

/*
  V1 predates the vault and is not covered by the Balancer API, so a holder's positions are only
  visible as BPT balances on the pool contracts themselves.

  A failed read is never treated as a zero balance: `balanceOf` cannot revert on these pools, so a
  failure means the RPC dropped the call. Reporting "no positions" from a partial sweep would hide
  a real position, so failed batches are retried once and, if they still fail, the sweep throws
  and nothing is cached — the next visit tries again rather than remembering a wrong answer.
*/
async function scanLegacyV1Positions(
  client: PublicClient,
  userAddress: Address
): Promise<LegacyV1Position[]> {
  const batches: Address[][] = []

  for (let i = 0; i < balancerV1PoolAddresses.length; i += POOL_BATCH_SIZE) {
    batches.push(balancerV1PoolAddresses.slice(i, i + POOL_BATCH_SIZE))
  }

  const positions: LegacyV1Position[] = []
  const retryable: Address[][] = []

  for (const batch of batches) {
    const { positions: found, failedCalls } = await readPoolBatch(client, batch, userAddress)

    positions.push(...found)
    if (failedCalls > 0) retryable.push(batch)
  }

  for (const batch of retryable) {
    const { positions: found, failedCalls } = await readPoolBatch(client, batch, userAddress)

    positions.push(...found)
    if (failedCalls > 0) throw new Error('Balancer V1 scan: RPC dropped part of the pool sweep')
  }

  return positions
}

/*
  The sweep is ~3200 reads, so it is kept off both the critical path and the main thread: the
  stored answer is consulted during render (a wallet that already has one costs zero requests) and
  a first-time wallet is swept from an idle callback, after the connected UI has painted. The
  fetch itself is chunked and awaited, so it never blocks a frame.
*/
export function useLegacyV1Positions() {
  const { userAddress, isConnected } = useUserAccount()
  const isMounted = useIsMounted()
  const publicClient = usePublicClient({ chainId: mainnet.id })
  const [isScanDeferred, setIsScanDeferred] = useState(false)

  // Resolved as soon as the wallet is known, so a cached answer is in place before the deferred
  // sweep is allowed to start — a returning wallet costs zero requests and never flashes a scan.
  // `isMounted` only keeps localStorage out of the server render.
  const [storedHasV1Pools, setStoredHasV1Pools] = useState<boolean | null>(null)

  useEffect(() => {
    setStoredHasV1Pools(isBalancer && userAddress ? readHasV1Pools(userAddress) : null)
  }, [isMounted, userAddress])

  useEffect(() => {
    if (!isMounted || !isBalancer || !isConnected || !userAddress || storedHasV1Pools !== null) {
      setIsScanDeferred(false)

      return undefined
    }

    if (typeof window.requestIdleCallback === 'function') {
      // The timeout keeps a busy main thread from deferring the scan indefinitely.
      const idleId = window.requestIdleCallback(() => setIsScanDeferred(true), {
        timeout: SCAN_DEFER_TIMEOUT,
      })

      return () => window.cancelIdleCallback(idleId)
    }

    const timeoutId = window.setTimeout(() => setIsScanDeferred(true), SCAN_DEFER_TIMEOUT)

    return () => window.clearTimeout(timeoutId)
  }, [isMounted, isConnected, userAddress, storedHasV1Pools])

  const {
    data: positions = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['legacy-v1-positions', userAddress],
    queryFn: () => scanLegacyV1Positions(publicClient as PublicClient, userAddress as Address),
    enabled:
      isMounted &&
      isBalancer &&
      isConnected &&
      Boolean(userAddress) &&
      Boolean(publicClient) &&
      isScanDeferred &&
      storedHasV1Pools === null,
    staleTime: SCAN_STALE_TIME,
    gcTime: SCAN_STALE_TIME,
    // The sweep is ~3200 reads: one retry of the failed batches is built into the scan, and the
    // whole thing must never be re-run by a focus event or a reconnect.
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })

  // Only a completed, successful sweep is stored — a failed one must not record "no positions".
  const hasCompletedScan =
    isScanDeferred && storedHasV1Pools === null && !isLoading && !isFetching && !isError

  useEffect(() => {
    if (!hasCompletedScan || !userAddress) return

    writeHasV1Pools(userAddress, positions.length > 0)
    setStoredHasV1Pools(positions.length > 0)
  }, [hasCompletedScan, userAddress, positions.length])

  return {
    legacyV1PositionCount: positions.length,
    // The stored answer when there is one, the sweep's otherwise. This is what the UI gates on;
    // note the count is only populated for a wallet swept in this session.
    hasLegacyV1Positions: storedHasV1Pools ?? positions.length > 0,
    legacyV1Positions: positions,
    isLoading: isConnected && storedHasV1Pools === null && (isLoading || isFetching),
    isError,
    refetch,
  }
}
