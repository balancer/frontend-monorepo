import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { setUserTokenBalance } from '@repo/lib/test/integration/sdk-utils'
import { sonicTestPublicClient } from '@repo/test/utils/wagmi/wagmi-test-clients'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import { erc20Abi } from 'viem'
import { ChainContractConfig, useMulticall } from './useMulticall'
import { sonic } from 'viem/chains'
import { sonicTokens } from '@repo/lib/test/integration/sonic-fixtures'

describe('Performs multicall on the Sonic fork', () => {
  beforeAll(async () => {
    await setUserTokenBalance({
      client: sonicTestPublicClient,
      account: defaultTestUserAccount,
      tokenAddress: sonicTokens.ws,
      slot: 0,
      balance: 1n,
    })
  })

  const wsBalanceRequest: ChainContractConfig = {
    id: 'wsBalanceOnSonic',
    chainId: sonic.id,
    abi: erc20Abi,
    address: sonicTokens.ws,
    functionName: 'balanceOf',
    args: [defaultTestUserAccount],
  }

  /*
    Sonic is the only forked chain, so cross-chain batching is no longer exercised. What these
    two requests still cover is the parts useMulticall owns: grouping a request list per chain,
    batching each group into one multicall and keying every result back to its request id.
  */
  const stsDecimalsRequest: ChainContractConfig = {
    id: 'stsDecimalsOnSonic',
    chainId: sonic.id,
    abi: erc20Abi,
    address: sonicTokens.sts,
    functionName: 'decimals',
  }

  test('returning one result per request id', async () => {
    const { result } = testHook(() => useMulticall([wsBalanceRequest, stsDecimalsRequest]))

    await waitFor(() => {
      const sonicResults = result.current.results[sonic.id]

      if (sonicResults?.error) {
        console.error('useMulticall error on sonic:', sonicResults.error)
      }

      expect(sonicResults?.data).toBeDefined()
    })

    expect(result.current.results[sonic.id]!.data).toMatchObject({
      wsBalanceOnSonic: { result: 1n, status: 'success' },
      stsDecimalsOnSonic: { result: 18, status: 'success' },
    })
  })
})
