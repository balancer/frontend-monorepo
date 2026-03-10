import { daiAddress, polAddress } from '@repo/lib/debug-helpers'
import { alternativeTestUserAccount, defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { setUserTokenBalance } from '@repo/lib/test/integration/sdk-utils'
import {
  mainnetTestPublicClient,
  polygonTestPublicClient,
  baseTestPublicClient,
} from '@repo/test/utils/wagmi/wagmi-test-clients'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import { erc20Abi } from 'viem'
import { ChainContractConfig, useMulticall } from './useMulticall'
import { mainnet, polygon, base } from 'viem/chains'

describe('Performs multicall in multiple chains', () => {
  beforeAll(async () => {
    await setUserTokenBalance({
      client: mainnetTestPublicClient,
      account: defaultTestUserAccount,
      tokenAddress: daiAddress,
      slot: 2,
      balance: 1n,
    })

    await setUserTokenBalance({
      client: baseTestPublicClient,
      account: defaultTestUserAccount,
      tokenAddress: '0x6bb7a212910682dcfdbd5bcbb3e28fb4e8da10ee',
      slot: 4,
      balance: 7702n,
    })

    await polygonTestPublicClient.setBalance({
      address: alternativeTestUserAccount,
      value: 721n,
    })
  })
  const mainnetRequest: ChainContractConfig = {
    id: 'daiBalanceOnMainnet',
    chainId: mainnet.id,
    abi: erc20Abi,
    address: daiAddress,
    functionName: 'balanceOf',
    args: [defaultTestUserAccount],
  }

  const baseRequest: ChainContractConfig = {
    id: 'ghoBalanceOnBase',
    chainId: base.id,
    abi: erc20Abi,
    address: '0x6bb7a212910682dcfdbd5bcbb3e28fb4e8da10ee',
    functionName: 'balanceOf',
    args: [defaultTestUserAccount],
  }

  const polygonRequest: ChainContractConfig = {
    id: 'polBalanceOnPolygon',
    chainId: polygon.id,
    abi: erc20Abi,
    address: polAddress,
    functionName: 'balanceOf',
    args: [alternativeTestUserAccount],
  }

  test('including mixed mainnet and polygon contracts', async () => {
    const multicallRequests: ChainContractConfig[] = [mainnetRequest, baseRequest, polygonRequest]

    const { result } = testHook(() => useMulticall(multicallRequests))

    await waitFor(() => expect(result.current.results[mainnet.id].data).toBeDefined())
    expect(result.current.results[mainnet.id].data).toMatchInlineSnapshot(`
      {
        "daiBalanceOnMainnet": {
          "result": 1n,
          "status": "success",
        },
      }
    `)

    await waitFor(() => expect(result.current.results[base.id].data).toBeDefined())
    expect(result.current.results[base.id].data).toMatchInlineSnapshot(`
      {
        "ghoBalanceOnBase": {
          "result": 7702n,
          "status": "success",
        },
      }
    `)

    await waitFor(() => expect(result.current.results[polygon.id].data).toBeDefined())
    expect(result.current.results[polygon.id].data).toMatchInlineSnapshot(`
    {
      "polBalanceOnPolygon": {
        "result": 721n,
        "status": "success",
      },
    }
  `)
  })
})
