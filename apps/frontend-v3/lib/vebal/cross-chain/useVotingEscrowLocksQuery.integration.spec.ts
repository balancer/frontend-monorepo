import { useVotingEscrowLocksQuery } from '@bal/lib/vebal/cross-chain/useVotingEscrowLocksQuery'
import { renderHook, waitFor } from '@testing-library/react'

describe('useVotingEscrowLocksQuery', () => {
  it('returns locks for veBal whale', async () => {
    const veBalHolder = '0x36cc7b13029b5dee4034745fb4f24034f3f2ffc6'

    // TODO: use testHook instead of renderHook once we find out which provider to use
    // If we decide to finally use a gauges subgraph instead of the API, we should setup a proper Apollo Provider/client setup
    const { result } = renderHook(() => useVotingEscrowLocksQuery(veBalHolder))

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // TODO: set specific block number to avoid changes
    const locks = result.current.data.votingEscrowLocks
    expect(locks).toMatchInlineSnapshot(`
      [
        {
          "__typename": "VotingEscrowLock",
          "updatedAt": 1739909795,
          "votingEscrowID": {
            "__typename": "VotingEscrow",
            "id": "0xc128a9954e6c874ea3d62ce62b468ba073093f25",
          },
        },
      ]
    `)
  })
})
