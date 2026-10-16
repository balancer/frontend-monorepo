import { ANVIL_NETWORKS } from '@repo/test/anvil/anvil-setup'

/*
  Unit tests must never dial a local anvil fork. A leaked chain RPC pointing at
  http://127.0.0.1:<anvil port> opens a real socket, and on CI that refused socket
  makes @mswjs/interceptors abort it, crashing the vitest worker
  ("Assertion failed: !wrap->started_" -> SIGABRT).
*/
const anvilTestRpcUrls = Object.values(ANVIL_NETWORKS).map(
  ({ port }) => `http://127.0.0.1:${port}/1`
)

describe('defaultPostMswHandlers', () => {
  test.each(anvilTestRpcUrls)('%s is answered locally', async url => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_gasPrice' }),
      signal: AbortSignal.timeout(2_000),
    })

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ error: { code: -32000 } })
  })
})
