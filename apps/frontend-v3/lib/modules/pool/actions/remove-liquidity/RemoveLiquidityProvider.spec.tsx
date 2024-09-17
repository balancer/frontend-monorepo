import { balAddress, wETHAddress } from '@/lib/debug-helpers'
import { aTokenPriceMock } from '@/lib/modules/tokens/__mocks__/token.builders'
import { GqlPoolElement } from '@/lib/shared/services/api/generated/graphql'
import { aBalWethPoolElementMock } from '@/test/msw/builders/gqlPoolElement.builders'
import { aUserPoolBalance } from '@/test/msw/builders/gqlUserBalance.builders'
import { mockTokenPricesList } from '@/test/msw/handlers/Tokens.handlers'
import { buildDefaultPoolTestProvider, testHook } from '@/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { mock } from 'vitest-mock-extended'
import { aTokenAmountMock } from '../__mocks__/liquidity.builders'
import { RemoveLiquiditySimulationQueryResult } from './queries/useRemoveLiquiditySimulationQuery'
import { _useRemoveLiquidity } from './RemoveLiquidityProvider'
import { aSuccessfulQueryResultMock } from '@/test/utils/react-query'

const balTokenOutUnits = '1'
const wEthTokenOutUnits = '0.5'

const simulationQueryResult = {
  ...mock<RemoveLiquiditySimulationQueryResult>(),
  ...aSuccessfulQueryResultMock(),
  data: {
    amountsOut: [
      aTokenAmountMock(balAddress, balTokenOutUnits),
      aTokenAmountMock(wETHAddress, wEthTokenOutUnits),
    ],
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

const poolMock = aBalWethPoolElementMock() // 80BAL-20WETH

poolMock.userBalance = aUserPoolBalance({ totalBalance: '200' }) // maxBptUnits
poolMock.dynamicData.totalLiquidity = '1000'
poolMock.dynamicData.totalShares = '100'
// bptPrice = 1000/100 = 10

async function testUseRemoveLiquidity(pool: GqlPoolElement = poolMock) {
  const { result } = testHook(() => _useRemoveLiquidity(), {
    wrapper: buildDefaultPoolTestProvider(pool),
  })
  return result
}

describe('When the user choses proportional remove liquidity', () => {
  const balPrice = 2
  const wethPrice = 3
  beforeEach(() => {
    mockTokenPricesList([
      aTokenPriceMock({ address: balAddress, price: balPrice }),
      aTokenPriceMock({ address: wETHAddress, price: wethPrice }),
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

    expect(result.current.amountOutForToken(balAddress)).toBe(balTokenOutUnits)
    expect(result.current.amountOutForToken(wETHAddress)).toBe(wEthTokenOutUnits)
  })

  // TODO: avoid flaky test until improve mock
  test.skip('calculates token usd out ', async () => {
    const result = await testUseRemoveLiquidity()

    await waitFor(() => expect(result.current.usdOutForToken(balAddress) !== '0.00').toBeTruthy())
    expect(result.current.usdOutForToken(balAddress)).toBe('2') // balTokenOutUnits * balPrice = 1 * 2 = 2.00
    expect(result.current.usdOutForToken(wETHAddress)).toBe('1.5')

    // total usd value is the sum of the token out usd values (2.00 + 1.50 = 3.50)
    expect(result.current.totalUSDValue).toBe('3.5')
  })
})

describe('When the user choses single token remove liquidity', () => {
  test('returns selected token address', async () => {
    const result = await testUseRemoveLiquidity()

    act(() => result.current.setSingleTokenType())
    act(() => result.current.setSingleTokenAddress(wETHAddress))

    expect(result.current.singleTokenOutAddress).toEqual(wETHAddress)
  })
})
