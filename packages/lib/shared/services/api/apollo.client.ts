import { config } from '@repo/lib/config/app.config'
import { ApolloLink, HttpLink, type NormalizedCacheObject } from '@apollo/client'
import { ApolloClient, InMemoryCache, SSRMultipartLink } from '@apollo/client-integration-nextjs'

const defaultHeaders = {
  'x-graphql-client-name': 'FrontendClient',
  'x-graphql-client-version': '1.0.0',
}

// ── Optional Apollo cache persistence ───────────────────────────────────
//
// Opt-in via `createApolloClient({ persistKey })`. Read-only dashboards
// (e.g. balancer-analytics) benefit massively from persisting Apollo's
// `InMemoryCache` across reloads / new tabs: every cache-first useQuery
// served on warm tabs avoids an api-v3 roundtrip entirely. Apps with
// user-facing wallet actions (swaps, add/remove liquidity, approvals)
// should NOT pass `persistKey` — stale cached balances/approvals would
// be dangerous.
//
// Bump `PERSIST_CACHE_VERSION` when the GraphQL schema or cache
// `typePolicies` change in a way that would break stored shapes.
// Cached entries older than `PERSIST_MAX_AGE_MS` are evicted on
// hydrate to bound staleness.
const PERSIST_CACHE_VERSION = '1'
const PERSIST_MAX_AGE_MS = 24 * 60 * 60 * 1000 // 1 day
const PERSIST_INITIAL_WRITE_DELAY_MS = 5_000 // capture the initial query batch

type PersistEnvelope = {
  v: string
  ts: number
  data: NormalizedCacheObject
}

function hydrateCache(cache: InMemoryCache, key: string): void {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return
    const parsed = JSON.parse(raw) as Partial<PersistEnvelope>
    if (parsed.v !== PERSIST_CACHE_VERSION) return
    if (typeof parsed.ts !== 'number') return
    if (Date.now() - parsed.ts > PERSIST_MAX_AGE_MS) return
    if (!parsed.data || typeof parsed.data !== 'object') return
    cache.restore(parsed.data)
  } catch {
    // Corrupt entry / quota / private-mode → ignore and let a fresh
    // cache get written next time. Never block app startup on persist.
  }
}

function attachCachePersistence(cache: InMemoryCache, key: string): void {
  if (typeof window === 'undefined') return
  let writing = false
  function write(): void {
    if (writing) return
    writing = true
    try {
      const data = cache.extract()
      // Don't overwrite a good prior entry with an empty fresh cache
      // (could happen if persist runs before the first queries land).
      if (data && Object.keys(data).length > 0) {
        const envelope: PersistEnvelope = {
          v: PERSIST_CACHE_VERSION,
          ts: Date.now(),
          data,
        }
        window.localStorage.setItem(key, JSON.stringify(envelope))
      }
    } catch {
      // QuotaExceeded / private mode / etc. — non-fatal.
    } finally {
      writing = false
    }
  }
  // Snapshot the cache after the initial query batch settles so a user
  // who closes the tab quickly still benefits on next visit.
  window.setTimeout(write, PERSIST_INITIAL_WRITE_DELAY_MS)
  // Plus capture the cache when the tab becomes hidden or is unloaded —
  // these fire on tab close, hard refresh, and SPA navigation away.
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') write()
  })
  window.addEventListener('pagehide', write)
}

export function createApolloClient(options: { persistKey?: string } = {}) {
  const httpLink = new HttpLink({
    uri: config.apiUrl,
    headers: defaultHeaders,
  })

  const cache = new InMemoryCache({
    typePolicies: {
      GqlToken: {
        keyFields: ['address', 'chainId'],
      },
      GqlTokenPrice: {
        keyFields: ['address', 'chain'],
      },
      GqlUserPoolBalance: {
        keyFields: ['poolId'],
      },
      Query: {
        fields: {
          userGetPoolBalances: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            merge(existing = [], incoming: any[]) {
              return incoming
            },
          },
          userGetStaking: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            merge(existing = [], incoming: any[]) {
              return incoming
            },
          },
          poolGetBatchSwaps: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            merge(existing = [], incoming: any[]) {
              return incoming
            },
          },
        },
      },
    },
  })

  // Opt-in persistence — see comment above for guidance.
  if (options.persistKey) {
    hydrateCache(cache, options.persistKey)
    attachCachePersistence(cache, options.persistKey)
  }

  return new ApolloClient({
    link:
      typeof window === 'undefined'
        ? ApolloLink.from([
            new SSRMultipartLink({
              stripDefer: true,
            }),
            httpLink,
          ])
        : httpLink,
    cache,
    queryDeduplication: true,
  })
}
