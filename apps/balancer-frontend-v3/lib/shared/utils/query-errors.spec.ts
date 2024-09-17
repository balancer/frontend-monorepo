/* eslint-disable max-len */
import {
  sentryMetaForAddLiquidityHandler,
  sentryMetaForRemoveLiquidityHandler,
  captureSentryError,
  sentryMetaForWagmiSimulation,
  shouldIgnoreException,
} from '@/lib/shared/utils/query-errors'
import { Exception as SentryException } from '@sentry/nextjs'
import { defaultTestUserAccount } from '@/test/anvil/anvil-setup'
import * as Sentry from '@sentry/nextjs'
import { waitFor } from '@testing-library/react'
import sentryTestkit from 'sentry-testkit'
import { recoveryPoolMock } from '../../modules/pool/__mocks__/recoveryPoolMock'
// eslint-disable-next-line max-len
import { Extras } from '@sentry/types'
// eslint-disable-next-line max-len
import { RecoveryRemoveLiquidityHandler } from '../../modules/pool/actions/remove-liquidity/handlers/RecoveryRemoveLiquidity.handler'
import { UnbalancedAddLiquidityHandler } from '@/lib/modules/pool/actions/add-liquidity/handlers/UnbalancedAddLiquidity.handler'
import { aWjAuraWethPoolElementMock } from '@/test/msw/builders/gqlPoolElement.builders'
import { AddLiquidityParams } from '@/lib/modules/pool/actions/add-liquidity/queries/add-liquidity-keys'
import { wETHAddress, wjAuraAddress } from '@/lib/debug-helpers'
import { RemoveLiquidityParams } from '@/lib/modules/pool/actions/remove-liquidity/queries/remove-liquidity-keys'

const { testkit, sentryTransport } = sentryTestkit()
const test_DSN = 'https://testDns@sentry.io/000001'

Sentry.init({
  dsn: test_DSN,
  transport: sentryTransport,
})

async function getSentryReport() {
  await waitFor(() => expect(testkit.reports()).toHaveLength(1))
  return testkit.reports()[0]
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

  test('for remove liquidity handler query error', async function () {
    const params: RemoveLiquidityParams = {
      handler: new RecoveryRemoveLiquidityHandler(recoveryPoolMock),
      userAddress: defaultTestUserAccount,
      slippage: '0.1',
      poolId: recoveryPoolMock.id,
      humanBptIn: '1',
    }

    const error = new Error('test cause error')
    const meta = sentryMetaForRemoveLiquidityHandler('Test error message', params)
    captureSentryError(error, meta)

    const report = await getSentryReport()

    expect(report.level).toBe('fatal')
    expect(report.error?.name).toBe('Error')
    expect(report.error?.message).toBe('test cause error')
    expect(report.extra).toMatchInlineSnapshot(`
      {
        "handler": "RecoveryRemoveLiquidityHandler",
        "params": {
          "handler": {
            "helpers": "[LiquidityActionHelpers]",
          },
          "humanBptIn": "1",
          "poolId": "0x4fd4687ec38220f805b6363c3c1e52d0df3b5023000200000000000000000473",
          "slippage": "0.1",
          "userAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        },
      }
    `)
  })

  test('for add liquidity handler query error', async function () {
    const pool = aWjAuraWethPoolElementMock()
    const params: AddLiquidityParams = {
      handler: new UnbalancedAddLiquidityHandler(pool),
      userAddress: defaultTestUserAccount,
      slippage: '0.1',
      poolId: pool.id,
      poolType: pool.type,
      humanAmountsIn: [
        { humanAmount: '3', tokenAddress: wjAuraAddress },
        { humanAmount: '0.01', tokenAddress: wETHAddress },
      ],
    }

    const error = new Error('test cause error')
    const meta = sentryMetaForAddLiquidityHandler('Test error message', params)
    captureSentryError(error, meta)

    const report = await getSentryReport()

    expect(report.level).toBe('fatal')
    expect(report.error?.name).toBe('Error')
    expect(report.error?.message).toBe('test cause error')
    expect(report.extra).toMatchInlineSnapshot(`
      {
        "handler": "UnbalancedAddLiquidityHandler",
        "params": {
          "handler": {
            "helpers": "[LiquidityActionHelpers]",
          },
          "humanAmountsIn": "[{"humanAmount":"3","tokenAddress":"0x198d7387fa97a73f05b8578cdeff8f2a1f34cd1f"},{"humanAmount":"0.01","tokenAddress":"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"}]",
          "poolId": "0x68e3266c9c8bbd44ad9dca5afbfe629022aee9fe000200000000000000000512",
          "poolType": "WEIGHTED",
          "slippage": "0.1",
          "userAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        },
      }
    `)
  })

  test('for wagmi simulation error', async function () {
    const extra: Extras = {
      tokenSymbol: 'BAL',
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
        "tokenSymbol": "BAL",
      }
    `)
  })
})

describe('shouldIgnoreError', () => {
  it('Ignores errors', () => {
    expect(
      shouldIgnoreException(createSentryException('e.getAccounts is not a function'))
    ).toBeTruthy()
    expect(shouldIgnoreException(createSentryException('foo bar baz'))).toBeFalsy()
  })

  it('when error does not have message', () => {
    expect(shouldIgnoreException(createSentryException(''))).toBeFalsy()
  })
})

function createSentryException(errorMessage: string) {
  return { value: errorMessage } as SentryException
}
