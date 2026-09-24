import { alternativeTestUserAccount, defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { setUserTokenBalance } from '@repo/lib/test/integration/sdk-utils'
import {
  baseTestPublicClient,
  sonicTestPublicClient,
} from '@repo/test/utils/wagmi/wagmi-test-clients'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import { erc20Abi } from 'viem'
import { ChainContractConfig, useMulticall } from './useMulticall'
import { base, sonic } from 'viem/chains'
import { sonicTokens } from '@repo/lib/test/integration/sonic-fixtures'

describe('Performs multicall in multiple chains', () => {
  beforeAll(async () => {
    await Promise.all([
      setUserTokenBalance({
        client: sonicTestPublicClient,
        account: defaultTestUserAccount,
        tokenAddress: sonicTokens.ws,
        slot: 2,
        balance: 1n,
      }),
      setUserTokenBalance({
        client: baseTestPublicClient,
        account: defaultTestUserAccount,
        tokenAddress: '0x4200000000000000000000000000000000000006',
        slot: 3,
        balance: 7702n,
      }),
      sonicTestPublicClient.setBalance({
        address: alternativeTestUserAccount,
        value: 721n,
      }),
    ])
  })

  const sonicRequest: ChainContractConfig = {
    id: 'wsBalanceOnSonic',
    chainId: sonic.id,
    abi: erc20Abi,
    address: sonicTokens.ws,
    functionName: 'balanceOf',
    args: [defaultTestUserAccount],
  }

  const sonicStsRequest: ChainContractConfig = {
    id: 'stsDecimalsOnSonic',
    chainId: sonic.id,
    abi: erc20Abi,
    address: sonicTokens.sts,
    functionName: 'decimals',
  }

  const baseRequest: ChainContractConfig = {
    id: 'wethBalanceOnBase',
    chainId: base.id,
    abi: erc20Abi,
    address: '0x4200000000000000000000000000000000000006',
    functionName: 'balanceOf',
    args: [defaultTestUserAccount],
  }

  test('including mixed sonic and base contracts', async () => {
    const multicallRequests: ChainContractConfig[] = [sonicRequest, sonicStsRequest, baseRequest]

    const { result } = testHook(() => useMulticall(multicallRequests))

    const waitForChainData = async (chainId: number, label: string) => {
      await waitFor(() => {
        const r = result.current.results[chainId]

        if (r?.error) {
          console.error(`useMulticall error for ${label} (chainId ${chainId}):`, r.error)
        }

        expect(r?.data).toBeDefined()
      })
    }

    await waitForChainData(sonic.id, 'sonic')

    // Requests for the same chain are batched and keyed by request id
    expect(result.current.results[sonic.id]!.data).toMatchObject({
      wsBalanceOnSonic: { result: 1n, status: 'success' },
      stsDecimalsOnSonic: { result: 18, status: 'success' },
    })

    await waitForChainData(base.id, 'base')

    expect(result.current.results[base.id]!.data).toMatchObject({
      wethBalanceOnBase: { result: 7702n, status: 'success' },
    })
  })
})
