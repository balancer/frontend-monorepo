import { aWjAuraWethPoolElementMock } from '@/test/msw/builders/gqlPoolElement.builders'
import {
  LiquidityActionHelpers,
  areEmptyAmounts,
  shouldUseRecoveryRemoveLiquidity,
  roundDecimals,
  supportsNestedActions,
} from './LiquidityActionHelpers'
import { nestedPoolMock } from '../__mocks__/nestedPoolMock'
import {
  bpt3PoolAddress,
  wETHAddress,
  threePoolId,
  daiAddress,
  usdcAddress,
  usdtAddress,
  wjAuraAddress,
  ethAddress,
} from '@/lib/debug-helpers'
import { recoveryPoolMock } from '../__mocks__/recoveryPoolMock'
import { Pool } from '../PoolProvider'
import { mock } from 'vitest-mock-extended'
import { HumanTokenAmountWithAddress } from '../../tokens/token.types'

describe('areEmptyAmounts', () => {
  test('when all humanAmounts are empty, zero or zero with decimals', () => {
    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { tokenAddress: '0x198d7387fa97a73f05b8578cdeff8f2a1f34cd1f', humanAmount: '' },
      { tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', humanAmount: '0' },
      { tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756bb3', humanAmount: '0.00' },
    ]
    expect(areEmptyAmounts(humanAmountsIn)).toBeTruthy()
  })

  test('when  humanAmounts is an empty array', () => {
    const humanAmountsIn: HumanTokenAmountWithAddress[] = []
    expect(areEmptyAmounts(humanAmountsIn)).toBeTruthy()
  })
})

test('detects pools requiring nested liquidity', () => {
  expect(supportsNestedActions(aWjAuraWethPoolElementMock())).toBeFalsy()
  expect(supportsNestedActions(nestedPoolMock)).toBeTruthy()
})

describe('detects pools requiring recovery removal', () => {
  test('when the pool is in recovery and paused', () => {
    const pausedAndInRecoveryPool: Pool = mock<Pool>({
      dynamicData: { isInRecoveryMode: true, isPaused: true },
    })
    expect(shouldUseRecoveryRemoveLiquidity(pausedAndInRecoveryPool)).toBeTruthy()
  })

  test('when the pool is in recovery and affected by CSP', () => {
    expect(shouldUseRecoveryRemoveLiquidity(recoveryPoolMock)).toBeTruthy()
  })
})

it('returns poolState for non nested pools', () => {
  const poolMock = aWjAuraWethPoolElementMock()
  const helpers = new LiquidityActionHelpers(aWjAuraWethPoolElementMock())
  expect(helpers.poolState.id).toBe(poolMock.id)
})

it('returns NestedPoolState for nested pools', () => {
  const helpers = new LiquidityActionHelpers(nestedPoolMock)
  const nestedPoolState = helpers.nestedPoolState

  expect(nestedPoolState.pools).toHaveLength(2)
  const firstPool = nestedPoolState.pools[0]
  expect(firstPool.id).toBe(nestedPoolMock.id)
  expect(firstPool.tokens.map(t => t.address)).toEqual([bpt3PoolAddress, wETHAddress])

  const secondPool = nestedPoolState.pools[1]
  expect(secondPool.id).toBe(threePoolId)
  expect(secondPool.tokens.map(t => t.address)).toEqual([
    daiAddress,
    bpt3PoolAddress,
    usdcAddress,
    usdtAddress,
  ])

  expect(nestedPoolState.mainTokens).toHaveLength(4)
  expect(nestedPoolState.mainTokens.map(t => t.address)).toEqual([
    wETHAddress,
    usdtAddress,
    daiAddress,
    usdcAddress,
  ])
})

describe('toInputAmounts', () => {
  it('when the token input is empty', () => {
    const helpers = new LiquidityActionHelpers(aWjAuraWethPoolElementMock())
    const humanTokenAmountsWithAddress: HumanTokenAmountWithAddress[] = []
    expect(helpers.toInputAmounts(humanTokenAmountsWithAddress)).toEqual([])
  })

  it('when the token input includes the wrapped native asset', () => {
    const helpers = new LiquidityActionHelpers(aWjAuraWethPoolElementMock())
    const humanTokenAmountsWithAddress: HumanTokenAmountWithAddress[] = [
      { tokenAddress: wjAuraAddress, humanAmount: '10' },
      { tokenAddress: wETHAddress, humanAmount: '20' },
    ]
    expect(helpers.toInputAmounts(humanTokenAmountsWithAddress)).toEqual([
      {
        address: wjAuraAddress,
        decimals: 18,
        rawAmount: 10000000000000000000n,
      },
      {
        address: wETHAddress,
        decimals: 18,
        rawAmount: 20000000000000000000n,
      },
    ])
  })

  it('when the token input is the native asset', () => {
    const helpers = new LiquidityActionHelpers(aWjAuraWethPoolElementMock())
    const humanTokenAmountsWithAddress: HumanTokenAmountWithAddress[] = [
      { tokenAddress: ethAddress, humanAmount: '30' },
    ]
    expect(helpers.toInputAmounts(humanTokenAmountsWithAddress)).toEqual([
      {
        address: ethAddress,
        decimals: 18,
        rawAmount: 30000000000000000000n,
      },
    ])
  })

  it('when the token input is zero', () => {
    const helpers = new LiquidityActionHelpers(aWjAuraWethPoolElementMock())
    const humanTokenAmountsWithAddress: HumanTokenAmountWithAddress[] = [
      { tokenAddress: wETHAddress, humanAmount: '0' },
    ]
    expect(helpers.toInputAmounts(humanTokenAmountsWithAddress)).toEqual([])
  })
})

describe('toSdkInputAmounts', () => {
  it('swaps the native asset by the wrapped native asset', () => {
    const helpers = new LiquidityActionHelpers(aWjAuraWethPoolElementMock())
    const humanTokenAmountsWithAddress: HumanTokenAmountWithAddress[] = [
      { tokenAddress: ethAddress, humanAmount: '30' },
    ]
    const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    expect(helpers.toSdkInputAmounts(humanTokenAmountsWithAddress)).toEqual([
      {
        address: wethAddress,
        decimals: 18,
        rawAmount: 30000000000000000000n,
      },
    ])
  })
})

test('trimDecimals', () => {
  const humanTokenAmountsWithAddress: HumanTokenAmountWithAddress[] = [
    { tokenAddress: ethAddress, humanAmount: '0.001013801345314809' },
    { tokenAddress: wETHAddress, humanAmount: '0.001302248169953014' },
  ]
  expect(roundDecimals(humanTokenAmountsWithAddress)).toEqual([
    {
      humanAmount: '0.0010138013',
      tokenAddress: ethAddress,
    },
    {
      humanAmount: '0.0013022481',
      tokenAddress: wETHAddress,
    },
  ])
})
