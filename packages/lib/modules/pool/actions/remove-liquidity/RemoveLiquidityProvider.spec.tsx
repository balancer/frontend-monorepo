import { aTokenPriceMock } from '@repo/lib/modules/tokens/__mocks__/token.builders'
import type { GqlPoolElement } from '@repo/lib/shared/services/api/graphql-derived-types'
import { aUserPoolBalance } from '@repo/lib/test/msw/builders/gqlUserBalance.builders'
import { mockTokenPricesList } from '@repo/lib/test/msw/handlers/Tokens.handlers'
import {
  buildDefaultPoolTestProvider,
  testHook,
  DefaultRemoveLiquidityTestProvider,
} from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import { act } from 'react'
import { mock } from 'vitest-mock-extended'
import { aTokenAmountMock } from '../__mocks__/liquidity.builders'
import { RemoveLiquiditySimulationQueryResult } from './queries/useRemoveLiquiditySimulationQuery'
import { RemoveLiquidityHandler } from './handlers/RemoveLiquidity.handler'
import { RemoveLiquidityType } from './remove-liquidity.types'
import { useRemoveLiquidityLogic } from './RemoveLiquidityProvider'
import { aSuccessfulQueryResultMock } from '@repo/lib/test/utils/react-query'
import { getApiPoolMock } from '../../__mocks__/api-mocks/api-mocks'
import { scUsdStS } from '../../__mocks__/pool-examples/flat'
import { sonicTokens } from '@repo/lib/test/integration/sonic-fixtures'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import { mockPool } from '@repo/lib/test/msw/handlers/Pool.handlers'

const scUsdAddress = '0xd3dce716f3ef535c5ff8d041c1a41c3bd89b97ae' as const

const scUsdTokenOutUnits = '1'
const stSTokenOutUnits = '0.5'

const simulationQueryResult = {
  ...mock<RemoveLiquiditySimulationQueryResult>(),
  ...aSuccessfulQueryResultMock(),
  data: {
    amountsOut: [
      aTokenAmountMock(scUsdAddress, scUsdTokenOutUnits),
      aTokenAmountMock(sonicTokens.sts, stSTokenOutUnits),
    ],
    sdkQueryOutput: { bptIn: { amount: 100000n } },
  },
}

// Mock query to avoid onchain SDK call from unit tests
vi.mock('./queries/useRemoveLiquiditySimulationQuery', () => {
  return {
    useRemoveLiquiditySimulationQuery(): RemoveLiquiditySimulationQueryResult {
      return simulationQueryResult
    },
  }
})

const poolMock = getApiPoolMock(scUsdStS) as unknown as GqlPoolElement // Sonic v2 scUSD/stS

poolMock.userBalance = aUserPoolBalance({ totalBalance: '200' }) // maxBptUnits
poolMock.dynamicData.totalLiquidity = '1000'
poolMock.dynamicData.totalShares = '100'
// bptPrice = 1000/100 = 10

async function testUseRemoveLiquidity(pool: GqlPoolElement = poolMock) {
  mockPool(pool)

  const { result } = testHook(() => useRemoveLiquidityLogic(), {
    wrapper: buildDefaultPoolTestProvider(pool, DefaultRemoveLiquidityTestProvider),
  })

  return result
}

describe('When the user choses proportional remove liquidity', () => {
  const scUsdPrice = 2
  const stSPrice = 3

  beforeEach(() => {
    mockTokenPricesList([
      aTokenPriceMock({ address: scUsdAddress, chain: GqlChainValues.Sonic, price: scUsdPrice }),
      aTokenPriceMock({ address: sonicTokens.sts, chain: GqlChainValues.Sonic, price: stSPrice }),
    ])
  })

  test('recalculates totalUSDValue when changing the slider', async () => {
    const result = await testUseRemoveLiquidity(poolMock)

    expect(result.current.isProportional).toBeTruthy()
    expect(result.current.humanBptInPercent).toBe(100)

    act(() => result.current.setHumanBptInPercent(50))
    expect(result.current.humanBptInPercent).toBe(50)
  })

  test('calculates token amounts out', async () => {
    const result = await testUseRemoveLiquidity()

    expect(result.current.amountOutForToken(scUsdAddress)).toBe(scUsdTokenOutUnits)
    expect(result.current.amountOutForToken(sonicTokens.sts)).toBe(stSTokenOutUnits)
  })

  test('calculates token usd out ', async () => {
    const result = await testUseRemoveLiquidity()

    await waitFor(() => expect(result.current.usdOutForToken(scUsdAddress)).toBe('2'))
    expect(result.current.usdOutForToken(scUsdAddress)).toBe('2') // scUsdTokenOutUnits * scUsdPrice = 1 * 2 = 2.00
    expect(result.current.usdOutForToken(sonicTokens.sts)).toBe('1.5')

    // total usd value is the sum of the token out usd values (2.00 + 1.50 = 3.50)
    expect(result.current.totalUSDValue).toBe('3.5')
  })
})

describe('When the user choses single token remove liquidity', () => {
  test('returns selected token address', async () => {
    const result = await testUseRemoveLiquidity()

    act(() => result.current.setSingleTokenType())
    act(() => result.current.setSingleTokenAddress(sonicTokens.sts))

    expect(result.current.singleTokenOutAddress).toEqual(sonicTokens.sts)
  })
})

test('uses custom remove liquidity handler selector and forwards handler to custom steps hook', async () => {
  const customHandler: RemoveLiquidityHandler = {
    simulate: vi.fn(),
    getPriceImpact: vi.fn(),
    buildCallData: vi.fn(),
  }

  const handlerSelector = vi.fn(() => customHandler)
  const useRemoveLiquiditySteps = vi.fn(() => [])

  const { result } = testHook(
    () =>
      useRemoveLiquidityLogic(
        undefined,
        false,
        handlerSelector,
        undefined,
        useRemoveLiquiditySteps
      ),
    {
      wrapper: buildDefaultPoolTestProvider(poolMock, DefaultRemoveLiquidityTestProvider),
    }
  )

  expect(result.current.handler).toBe(customHandler)
  expect(handlerSelector).toHaveBeenCalledWith(poolMock, RemoveLiquidityType.Proportional)

  expect(useRemoveLiquiditySteps).toHaveBeenCalledWith(
    expect.objectContaining({
      handler: customHandler,
    })
  )
})
