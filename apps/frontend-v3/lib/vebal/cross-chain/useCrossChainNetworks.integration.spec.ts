import { omniEscrowLocksMapMock } from '@bal/lib/vebal/cross-chain/__mocks__/omniEscrowMap.mock'
import { useCrossChainNetworks } from '@bal/lib/vebal/cross-chain/useCrossChainNetworks'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { connectWith } from '@repo/test/utils/wagmi/wagmi-connections'
import { waitFor } from '@testing-library/react'

describe('useCrossChainNetworks', () => {
  it('TBD', async () => {
    const veBalHolder = '0x36cc7b13029b5dee4034745fb4f24034f3f2ffc6' // Whale
    await connectWith(veBalHolder)

    const { result } = testHook(() =>
      useCrossChainNetworks([GqlChain.Mainnet], omniEscrowLocksMapMock)
    )

    await waitFor(() => expect(result.current[0].isLoading).toBeFalsy())

    const firstNetworkResult = result.current[0]

    expect(firstNetworkResult.chainId).toBe(GqlChain.Mainnet)
    expect(firstNetworkResult.votingEscrowLocks).toMatchInlineSnapshot(`undefined`)
  })
})
