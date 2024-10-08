import { daiAddress, maticAddress } from '@repo/lib/debug-helpers'
import {
  alternativeTestUserAccount,
  defaultTestUserAccount,
} from '@repo/lib/test/anvil/anvil-setup'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import { erc20Abi } from 'viem'
import { ChainContractConfig, useMulticall } from './useMulticall'
import { mainnet, polygon } from 'viem/chains'

describe('Performs multicall in multiple chains', () => {
  const mainnetRequest: ChainContractConfig = {
    id: 'ethBalance',
    chainId: mainnet.id,
    abi: erc20Abi,
    address: daiAddress,
    functionName: 'balanceOf',
    args: [defaultTestUserAccount],
  }

  const polygonRequest: ChainContractConfig = {
    id: 'maticBalance',
    chainId: polygon.id,
    abi: erc20Abi,
    address: maticAddress,
    functionName: 'balanceOf',
    args: [alternativeTestUserAccount],
  }

  test('including mixed mainnet and polygon contracts', async () => {
    const multicallRequests: ChainContractConfig[] = [mainnetRequest, polygonRequest]

    const { result } = testHook(() => useMulticall(multicallRequests))

    await waitFor(() => expect(result.current.results[mainnet.id].data).toBeDefined())

    expect(result.current.results[mainnet.id].data).toMatchInlineSnapshot(`
      {
        "ethBalance": {
          "result": 0n,
          "status": "success",
        },
      }
    `)

    await waitFor(() => expect(result.current.results[polygon.id].data).toBeDefined())
    expect(result.current.results[polygon.id].data).toMatchInlineSnapshot(`
    {
      "maticBalance": {
        "result": 10000000000000000000000n,
        "status": "success",
      },
    }
  `)
  })
})
