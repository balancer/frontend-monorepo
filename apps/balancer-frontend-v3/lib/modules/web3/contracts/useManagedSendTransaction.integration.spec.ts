/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, expect, test } from 'vitest'

import { getSdkTestUtils } from '@/test/integration/sdk-utils'
import { aWjAuraWethPoolElementMock } from '@/test/msw/builders/gqlPoolElement.builders'
import { testHook } from '@/test/utils/custom-renderers'
import { defaultTestUserAccount } from '@/test/anvil/anvil-setup'
import { ChainId, HumanAmount } from '@balancer/sdk'
import { act, waitFor } from '@testing-library/react'
import { UnbalancedAddLiquidityHandler } from '../../pool/actions/add-liquidity/handlers/UnbalancedAddLiquidity.handler'
import { selectAddLiquidityHandler } from '../../pool/actions/add-liquidity/handlers/selectAddLiquidityHandler'
import { connectWithDefaultUser } from '../../../../test/utils/wagmi/wagmi-connections'
import { Address } from 'viem'
import { mainnetTestPublicClient } from '@/test/utils/wagmi/wagmi-test-clients'
import { useManagedSendTransaction } from './useManagedSendTransaction'
import { HumanTokenAmountWithAddress } from '../../tokens/token.types'

const chainId = ChainId.MAINNET
const account = defaultTestUserAccount

const utils = await getSdkTestUtils({
  account,
  chainId,
  client: mainnetTestPublicClient,
  pool: aWjAuraWethPoolElementMock(), // Balancer Weighted wjAura and WETH,
})

const { getPoolTokens, getPoolTokenBalances } = utils

const poolTokens = getPoolTokens()

describe('weighted add flow', () => {
  test('Sends transaction after updating amount inputs', async () => {
    await connectWithDefaultUser()
    await utils.setupTokens([...getPoolTokens().map(() => '1000' as HumanAmount), '1000'])

    const handler = selectAddLiquidityHandler(
      aWjAuraWethPoolElementMock()
    ) as UnbalancedAddLiquidityHandler

    const humanAmountsIn: HumanTokenAmountWithAddress[] = poolTokens.map(t => ({
      humanAmount: '0.1',
      tokenAddress: t.address,
    }))

    const queryOutput = await handler.simulate(humanAmountsIn)

    const txConfig = await handler.buildCallData({
      humanAmountsIn,
      account: defaultTestUserAccount,
      slippagePercent: '5',
      queryOutput,
    })

    const { result } = testHook(() => {
      return useManagedSendTransaction({
        labels: { init: 'foo', tooltip: 'bar' },
        txConfig,
      })
    })

    await waitFor(() => expect(result.current.simulation.data).toBeDefined())

    await act(async () => result.current.executeAsync?.())

    const hash = await waitFor(() => {
      const hash = result.current.execution.data
      expect(result.current.execution.data).toBeDefined()
      return hash || ('' as Address)
    })

    const transactionReceipt = await act(async () =>
      mainnetTestPublicClient.waitForTransactionReceipt({
        hash: hash,
      })
    )
    expect(transactionReceipt.status).to.eq('success')
  })
})
