import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { getApiPoolMock } from '../pool/__mocks__/api-mocks/api-mocks'
import { cowAmmPoolWethGno } from '../pool/__mocks__/pool-examples/flat'
import { buildCowSwapUrl, buildCowSwapUrlFromPool } from './cow.utils'

test('Builds Cow swap url from a given pool', () => {
  const pool = getApiPoolMock(cowAmmPoolWethGno)

  expect(buildCowSwapUrlFromPool(pool)).toBe(
    'https://swap.cow.fi/#/100/swap/0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1/0x9c58bacc331c9aa871afd802db6379a98e80cedb'
  )
})

test('Builds Cow swap url from swap params', () => {
  expect(
    buildCowSwapUrl({
      chain: GqlChain.Mainnet,
      tokenInAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      tokenOutAddress: '0xd9fcd98c322942075a5c3860693e9f4f03aae07b',
    })
  ).toBe(
    'https://swap.cow.fi/#/1/swap/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/0xd9fcd98c322942075a5c3860693e9f4f03aae07b'
  )
})
