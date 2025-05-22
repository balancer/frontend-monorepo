import { renderHook, waitFor } from '@testing-library/react'
import { useOmniEscrowLocksMap } from './useOmniEscrowLocksMap'

describe('useOmniEscrowLocksMap', () => {
  it('should have isEnabled=false and undefined data when no userAddress is provided', async () => {
    const veBalHolder = '0x36cc7b13029b5dee4034745fb4f24034f3f2ffc6' // Whale

    // TODO: use testHook instead of renderHook once we find out which provider to use
    // If we decide to finally use a gauges subgraph instead of the API, we should setup a proper Apollo Provider/client setup
    const { result } = renderHook(() => useOmniEscrowLocksMap(veBalHolder))

    expect(result.current.omniEscrowLocksMap).toBeNull()

    await waitFor(() => {
      expect(result.current.isLoadingOmniEscrow).toBe(false)
    })

    expect(result.current.omniEscrowLocksMap).toBeDefined()

    const map = result.current.omniEscrowLocksMap

    // TODO: set specific block number to avoid changes

    // dstChainId 106 is avalanche
    // https://github.com/balancer/frontend-v2/blob/0b18fdb77f4f2a897fda892056783081318eb34b/src/lib/config/avalanche/index.ts#L12
    expect(map).toMatchInlineSnapshot(`
      {
        "106": {
          "__typename": "OmniVotingEscrowLock",
          "bias": "30489.25379136740827009",
          "dstChainId": 106,
          "id": "0x36cc7b13029b5dee4034745fb4f24034f3f2ffc6-0xe241c6e48ca045c7f631600a0f1403b2bfea05ad-106",
          "localUser": {
            "__typename": "User",
            "id": "0x36cc7b13029b5dee4034745fb4f24034f3f2ffc6",
          },
          "remoteUser": "0x36cc7b13029b5dee4034745fb4f24034f3f2ffc6",
          "slope": "0.002003261788923538",
        },
        "109": {
          "__typename": "OmniVotingEscrowLock",
          "bias": "30489.25379136740827009",
          "dstChainId": 109,
          "id": "0x36cc7b13029b5dee4034745fb4f24034f3f2ffc6-0xe241c6e48ca045c7f631600a0f1403b2bfea05ad-109",
          "localUser": {
            "__typename": "User",
            "id": "0x36cc7b13029b5dee4034745fb4f24034f3f2ffc6",
          },
          "remoteUser": "0x36cc7b13029b5dee4034745fb4f24034f3f2ffc6",
          "slope": "0.002003261788923538",
        },
        "110": {
          "__typename": "OmniVotingEscrowLock",
          "bias": "30489.25379136740827009",
          "dstChainId": 110,
          "id": "0x36cc7b13029b5dee4034745fb4f24034f3f2ffc6-0xe241c6e48ca045c7f631600a0f1403b2bfea05ad-110",
          "localUser": {
            "__typename": "User",
            "id": "0x36cc7b13029b5dee4034745fb4f24034f3f2ffc6",
          },
          "remoteUser": "0x36cc7b13029b5dee4034745fb4f24034f3f2ffc6",
          "slope": "0.002003261788923538",
        },
        "111": {
          "__typename": "OmniVotingEscrowLock",
          "bias": "993346.661020209625071849",
          "dstChainId": 111,
          "id": "0x36cc7b13029b5dee4034745fb4f24034f3f2ffc6-0xe241c6e48ca045c7f631600a0f1403b2bfea05ad-111",
          "localUser": {
            "__typename": "User",
            "id": "0x36cc7b13029b5dee4034745fb4f24034f3f2ffc6",
          },
          "remoteUser": "0x36cc7b13029b5dee4034745fb4f24034f3f2ffc6",
          "slope": "0.031755895145067549",
        },
        "145": {
          "__typename": "OmniVotingEscrowLock",
          "bias": "993346.661020209625071849",
          "dstChainId": 145,
          "id": "0x36cc7b13029b5dee4034745fb4f24034f3f2ffc6-0xe241c6e48ca045c7f631600a0f1403b2bfea05ad-145",
          "localUser": {
            "__typename": "User",
            "id": "0x36cc7b13029b5dee4034745fb4f24034f3f2ffc6",
          },
          "remoteUser": "0x36cc7b13029b5dee4034745fb4f24034f3f2ffc6",
          "slope": "0.031755895145067549",
        },
        "184": {
          "__typename": "OmniVotingEscrowLock",
          "bias": "30489.25379136740827009",
          "dstChainId": 184,
          "id": "0x36cc7b13029b5dee4034745fb4f24034f3f2ffc6-0xe241c6e48ca045c7f631600a0f1403b2bfea05ad-184",
          "localUser": {
            "__typename": "User",
            "id": "0x36cc7b13029b5dee4034745fb4f24034f3f2ffc6",
          },
          "remoteUser": "0x36cc7b13029b5dee4034745fb4f24034f3f2ffc6",
          "slope": "0.002003261788923538",
        },
      }
    `)
  })
})
