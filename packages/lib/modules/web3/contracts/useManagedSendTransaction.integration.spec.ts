/* eslint-disable @typescript-eslint/no-unused-vars*/
/* eslint-disable max-len */
import { describe, expect, test } from 'vitest'

import { getSdkTestUtils } from '@repo/lib/test/integration/sdk-utils'
import { aWjAuraWethPoolElementMock } from '@repo/lib/test/msw/builders/gqlPoolElement.builders'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { ChainId, HumanAmount } from '@balancer/sdk'
import { act, waitFor } from '@testing-library/react'
import { UnbalancedAddLiquidityV2Handler } from '../../pool/actions/add-liquidity/handlers/UnbalancedAddLiquidityV2.handler'
import { selectAddLiquidityHandler } from '../../pool/actions/add-liquidity/handlers/selectAddLiquidityHandler'
import { connectWithDefaultUser } from '@repo/test/utils/wagmi/wagmi-connections'
import { Address } from 'viem'
import { mainnetTestPublicClient } from '@repo/test/utils/wagmi/wagmi-test-clients'
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

const { getPoolTokens } = utils

const poolTokens = getPoolTokens()

describe('weighted add flow', () => {
  test('Sends transaction after updating amount inputs', async () => {
    await connectWithDefaultUser()
    await utils.setupTokens([...getPoolTokens().map(() => '1000' as HumanAmount), '1000'])

    const handler = selectAddLiquidityHandler(
      aWjAuraWethPoolElementMock()
    ) as UnbalancedAddLiquidityV2Handler

    const humanAmountsIn: HumanTokenAmountWithAddress[] = poolTokens.map(t => ({
      humanAmount: '0.1',
      tokenAddress: t.address,
      symbol: t.symbol || 'Unknown',
    }))

    const queryOutput = await handler.simulate(humanAmountsIn, defaultTestUserAccount)

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
