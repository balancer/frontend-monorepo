import { formatAddress, formatENS, isNativeAsset } from './addresses'

test('isNativeAddress', () => {
  expect(isNativeAsset(1, '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')).toBeTruthy()
  expect(isNativeAsset(1, '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeEEEEE')).toBeTruthy()
  expect(isNativeAsset(42161, '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeEEEEE')).toBeTruthy()

  expect(isNativeAsset(1, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')).toBeFalsy()
  expect(isNativeAsset(42161, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')).toBeFalsy()
})

describe('formatAddress', () => {
  it('truncates addresses correctly', () => {
    expect(formatAddress('0xDE7F309DE0F69C49E7C065BB4AE6DFFE0F5E32F4')).toEqual('0xDE…32F4')
  })
})

describe('formatENS', () => {
  it('trucates ENS name over 24 characters', () => {
    expect(formatENS('reallylongensnameheretotestlongnames.eth')).toEqual(
      'reallylongensnameheretot...'
    )
  })

  it(`doesn't do anything to ENS names 24 characters or less`, () => {
    expect(formatENS('balancer.eth')).toEqual('balancer.eth')
  })

  it('if 24 characters, do not truncate .eth', () => {
    expect(formatENS('qwertyuiopasdfghjklzxcvb.eth')).toEqual('qwertyuiopasdfghjklzxcvb.eth')
  })

  it('Subdomains are taken into account', () => {
    expect(formatENS('balanecerbal.balancerbal.eth')).toEqual('balanecerbal.ba...')
  })

  it('Non .eth names work', () => {
    expect(formatENS('qwertyuiopasdfghjklzxcvb.xyz')).toEqual('qwertyuiopasdfghjklzxcvb.xyz')
  })
})
