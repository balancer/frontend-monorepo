import { selectAddLiquidityHandler } from './selectAddLiquidityHandler'
import { getApiPoolMock } from '../../../__mocks__/api-mocks/api-mocks'
import { balWeth8020, v3StableNonBoosted } from '../../../__mocks__/pool-examples/flat'
import { nestedPoolMock } from '../../../__mocks__/nestedPoolMock'

describe('selectAddLiquidityHandler', () => {
  it('returns NestedAddLiquidityV2Handler for nested pools with nested BPT in pool tokens (V2)', () => {
    // nestedPoolMock has protocolVersion 2 with nested structure
    const handler = selectAddLiquidityHandler(nestedPoolMock)
    expect(handler).toBeDefined()
    expect(handler.constructor.name).toBe('NestedAddLiquidityV2Handler')
  })

  it('returns ProportionalAddLiquidityHandlerV3 for V3 pools with wantsProportional', () => {
    const v3Pool = getApiPoolMock(v3StableNonBoosted)
    v3Pool.protocolVersion = 3

    const handler = selectAddLiquidityHandler(v3Pool, true)
    expect(handler).toBeDefined()
    expect(handler.constructor.name).toBe('ProportionalAddLiquidityHandlerV3')
  })

  it('returns UnbalancedAddLiquidityV3Handler for V3 non-boosted pools', () => {
    const v3Pool = getApiPoolMock(v3StableNonBoosted)
    v3Pool.protocolVersion = 3

    const handler = selectAddLiquidityHandler(v3Pool, false)
    expect(handler).toBeDefined()
    expect(handler.constructor.name).toBe('UnbalancedAddLiquidityV3Handler')
  })

  it('returns ProportionalAddLiquidityHandler for V2 pools with wantsProportional', () => {
    const v2Pool = getApiPoolMock(balWeth8020)
    v2Pool.protocolVersion = 2

    const handler = selectAddLiquidityHandler(v2Pool, true)
    expect(handler).toBeDefined()
    expect(handler.constructor.name).toBe('ProportionalAddLiquidityHandler')
  })

  it('returns UnbalancedAddLiquidityV2Handler for V2 pools without wantsProportional', () => {
    const v2Pool = getApiPoolMock(balWeth8020)
    v2Pool.protocolVersion = 2

    const handler = selectAddLiquidityHandler(v2Pool, false)
    expect(handler).toBeDefined()
    expect(handler.constructor.name).toBe('UnbalancedAddLiquidityV2Handler')
  })

  it('returns TwammAddLiquidityHandler for TWAMM example pool', () => {
    const twammPool = { ...getApiPoolMock(balWeth8020), id: 'TWAMM-example' }

    const handler = selectAddLiquidityHandler(twammPool)
    expect(handler).toBeDefined()
    expect(handler.constructor.name).toBe('TwammAddLiquidityHandler')
  })
})
