import { getSwapPathParams } from './getSwapPathParams'

describe('Parses swap params from the url slug when', () => {
  it('slug is undefined', () => {
    expect(getSwapPathParams()).toEqual({})
  })
  it('slug is empty', () => {
    expect(getSwapPathParams([])).toEqual({})
  })
  it('slug contains only chain', () => {
    expect(getSwapPathParams(['ethereum'])).toEqual({
      chain: 'ethereum',
    })
  })
  it('slug contains chain and txHash', () => {
    expect(
      getSwapPathParams([
        'ethereum',
        '0x11380dcffb24c512da18f032d9f7354d154cfda6bbab0633df182fcd202c4244',
      ])
    ).toEqual({
      chain: 'ethereum',
      urlTxHash: '0x11380dcffb24c512da18f032d9f7354d154cfda6bbab0633df182fcd202c4244',
    })
  })
  it('slug contains chain and tokenIn', () => {
    expect(getSwapPathParams(['ethereum', 'USDC', 'DAI', '123'])).toEqual({
      chain: 'ethereum',
      tokenIn: 'USDC',
      tokenOut: 'DAI',
      amountIn: '123',
    })
  })
})
