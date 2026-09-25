import { selectAddLiquidityHandler } from './selectAddLiquidityHandler'
import { getApiPoolMock } from '../../../__mocks__/api-mocks/api-mocks'
import { scUsdStS, usdcFlyStS } from '../../../__mocks__/pool-examples/flat'

describe('selectAddLiquidityHandler', () => {
  it('returns ProportionalAddLiquidityHandlerV3 for V3 pools with wantsProportional', () => {
    const v3Pool = getApiPoolMock(usdcFlyStS)
    v3Pool.protocolVersion = 3

    const handler = selectAddLiquidityHandler(v3Pool, true)
    expect(handler).toBeDefined()
    expect(handler.constructor.name).toBe('ProportionalAddLiquidityHandlerV3')
  })

  it('returns UnbalancedAddLiquidityV3Handler for V3 non-boosted pools', () => {
    const v3Pool = getApiPoolMock(usdcFlyStS)
    v3Pool.protocolVersion = 3

    const handler = selectAddLiquidityHandler(v3Pool, false)
    expect(handler).toBeDefined()
    expect(handler.constructor.name).toBe('UnbalancedAddLiquidityV3Handler')
  })

  it('returns ProportionalAddLiquidityHandler for V2 pools with wantsProportional', () => {
    const v2Pool = getApiPoolMock(scUsdStS)
    v2Pool.protocolVersion = 2

    const handler = selectAddLiquidityHandler(v2Pool, true)
    expect(handler).toBeDefined()
    expect(handler.constructor.name).toBe('ProportionalAddLiquidityHandler')
  })

  it('returns UnbalancedAddLiquidityV2Handler for V2 pools without wantsProportional', () => {
    const v2Pool = getApiPoolMock(scUsdStS)
    v2Pool.protocolVersion = 2

    const handler = selectAddLiquidityHandler(v2Pool, false)
    expect(handler).toBeDefined()
    expect(handler.constructor.name).toBe('UnbalancedAddLiquidityV2Handler')
  })

  it('returns TwammAddLiquidityHandler for TWAMM example pool', () => {
    const twammPool = { ...getApiPoolMock(scUsdStS), id: 'TWAMM-example' }

    const handler = selectAddLiquidityHandler(twammPool)
    expect(handler).toBeDefined()
    expect(handler.constructor.name).toBe('TwammAddLiquidityHandler')
  })
})
