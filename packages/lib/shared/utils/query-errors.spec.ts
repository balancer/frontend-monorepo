import {
  sentryMetaForAddLiquidityHandler,
  sentryMetaForRemoveLiquidityHandler,
  captureSentryError,
  sentryMetaForWagmiSimulation,
} from '@repo/lib/shared/utils/query-errors'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import * as Sentry from '@sentry/nextjs'
import { waitFor } from '@testing-library/react'
import sentryTestkit from 'sentry-testkit'
import { recoveryPoolMock } from '../../modules/pool/__mocks__/recoveryPoolMock'
import { Extras } from '@sentry/types'
import { RecoveryRemoveLiquidityHandler } from '../../modules/pool/actions/remove-liquidity/handlers/RecoveryRemoveLiquidity.handler'
import { UnbalancedAddLiquidityV2Handler } from '@repo/lib/modules/pool/actions/add-liquidity/handlers/UnbalancedAddLiquidityV2.handler'
import {} from '@repo/lib/test/msw/builders/gqlPoolElement.builders'
import { AddLiquidityParams } from '@repo/lib/modules/pool/actions/add-liquidity/queries/add-liquidity-keys'
import {} from '@repo/lib/debug-helpers'
import { RemoveLiquidityParams } from '@repo/lib/modules/pool/actions/remove-liquidity/queries/remove-liquidity-keys'
import { getApiPoolMock } from '@repo/lib/modules/pool/__mocks__/api-mocks/api-mocks'
import { scUsdStS } from '@repo/lib/modules/pool/__mocks__/pool-examples/flat'
import { sonicTokens } from '@repo/lib/test/integration/sonic-fixtures'

const { testkit, sentryTransport } = sentryTestkit()
const test_DSN = 'https://testDns@sentry.io/000001'

Sentry.init({
  dsn: test_DSN,
  transport: sentryTransport,
})

async function getSentryReport() {
  await waitFor(() => expect(testkit.reports()).toHaveLength(1))
  return testkit.reports()[0]!
}

describe('Captures sentry error', () => {
  afterEach(() => testkit.reset())

  test('for simple Error exception', async function () {
    const error = new Error('Test error')
    Sentry.captureException(error, { extra: { foo: 'bar' } })

    const report = await getSentryReport()

    expect(report.error?.message).toBe('Test error')
    expect(report.extra).toEqual({ foo: 'bar' })
  })

  // TODO: Add a Beets/Sonic pool in recovery mode for remove-liquidity error metadata.
  test.skip('for remove liquidity handler query error', async function () {
    const params: RemoveLiquidityParams = {
      handler: new RecoveryRemoveLiquidityHandler(recoveryPoolMock),
      userAddress: defaultTestUserAccount,
      slippage: '0.1',
      poolId: recoveryPoolMock.id,
      humanBptIn: '1',
    }

    const error = new Error('test cause error')

    const meta = sentryMetaForRemoveLiquidityHandler('Test error message', {
      ...params,
      chainId: 1,
    })

    captureSentryError(error, meta)

    const report = await getSentryReport()

    expect(report.level).toBe('fatal')
    expect(report.error?.name).toBe('Error')
    expect(report.error?.message).toBe('test cause error')

    expect(report.extra).toMatchInlineSnapshot(`
      {
        "handler": "RecoveryRemoveLiquidityHandler",
        "params": {
          "chainId": 1,
          "handler": {
            "helpers": "[LiquidityActionHelpers]",
          },
          "humanBptIn": "1",
          "poolId": "0x4fd4687ec38220f805b6363c3c1e52d0df3b5023000200000000000000000473",
          "slippage": "0.1",
          "userAddress": "0x3B7D260597A3e3f90274563a9e481618C6B951Eb",
        },
      }
    `)
  })

  test('for add liquidity handler query error', async function () {
    const pool = getApiPoolMock(scUsdStS)

    const params: AddLiquidityParams = {
      handler: new UnbalancedAddLiquidityV2Handler(pool),
      userAddress: defaultTestUserAccount,
      slippage: '0.1',
      pool,
      humanAmountsIn: [
        {
          humanAmount: '3',
          tokenAddress: '0xd3dce716f3ef535c5ff8d041c1a41c3bd89b97ae',
          symbol: 'scUSD',
        },
        { humanAmount: '0.01', tokenAddress: sonicTokens.sts, symbol: 'stS' },
      ],
    }

    const error = new Error('test cause error')
    const meta = sentryMetaForAddLiquidityHandler('Test error message', { ...params, chainId: 146 })
    captureSentryError(error, meta)

    const report = await getSentryReport()

    expect(report.level).toBe('fatal')
    expect(report.error?.name).toBe('Error')
    expect(report.error?.message).toBe('test cause error')

    expect(report.extra).toMatchInlineSnapshot(`
      {
        "handler": "UnbalancedAddLiquidityV2Handler",
        "params": {
          "chainId": 146,
          "handler": {
            "helpers": "[LiquidityActionHelpers]",
          },
          "humanAmountsIn": "[{"humanAmount":"3","tokenAddress":"0xd3dce716f3ef535c5ff8d041c1a41c3bd89b97ae","symbol":"scUSD"},{"humanAmount":"0.01","tokenAddress":"0xe5da20f15420ad15de0fa650600afc998bbe3955","symbol":"stS"}]",
          "poolId": "0x25ca5451cd5a50ab1d324b5e64f32c0799661891000200000000000000000018",
          "poolType": "WEIGHTED",
          "slippage": "0.1",
          "userAddress": "0x3B7D260597A3e3f90274563a9e481618C6B951Eb",
        },
      }
    `)
  })

  test('for wagmi simulation error', async function () {
    const extra: Extras = {
      tokenSymbol: 'stS',
      tokenAmount: 100,
    }

    const error = new Error('Error in viem')
    const meta = sentryMetaForWagmiSimulation('Error executing token approval tx', extra)
    captureSentryError(error, meta)

    const report = await getSentryReport()

    expect(report.level).toBe('fatal')
    expect(report.error?.name).toBe('Error')
    expect(report.error?.message).toBe('Error in viem')

    expect(report.extra).toMatchInlineSnapshot(`
      {
        "tokenAmount": 100,
        "tokenSymbol": "stS",
      }
    `)
  })
})
