import { GqlNestedPool } from '@repo/lib/shared/services/api/generated/graphql'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { sortBy } from 'lodash'
import { Address } from 'viem'
import { PoolToken } from '../tokens/token.helpers'
import { getPoolForTest } from './__mocks__/getPoolMock'
import {
  morphoStakeHouse,
  sDAIBoosted,
  v3SepoliaNestedBoosted,
} from './__mocks__/pool-examples/boosted'
import {
  balWeth8020,
  osETHPhantom,
  PoolExample,
  sDAIWeighted,
  v2SepoliaStableWithERC4626,
} from './__mocks__/pool-examples/flat'
import { auraBal, staBALv2Nested } from './__mocks__/pool-examples/nested'
import {
  tokenSymbols,
  underlyingTokenSymbols,
} from './__mocks__/pool-examples/pool-example-helpers'
import { isV3Pool } from './pool.helpers'
import { ApiToken } from './pool.types'
import { getPoolDisplayTokensWithPossibleNestedPools } from './pool.utils'
import { Pool } from './PoolProvider'

function isPool(pool: any): pool is Pool {
  return (pool as Pool).poolTokens !== undefined
}

function isGqlNestedPool(pool: any): pool is GqlNestedPool {
  return (pool as GqlNestedPool).tokens !== undefined
}

function getPoolTokens(pool: Pool | GqlNestedPool) {
  if (isPool(pool)) {
    return pool.poolTokens
  }
  if (isGqlNestedPool(pool)) {
    return pool.tokens
  }
  throw new Error('Invalid pool type: poolTokens or tokens but be defined')
}

// TODO: extract this pool helpers or utils
function getDisplayTokens(pool: Pool | GqlNestedPool): ApiToken[] {
  const tokens = getPoolTokens(pool).map(token => {
    if (token.hasNestedPool && token.nestedPool) {
      return {
        ...token,
        nestedTokens: getDisplayTokens(token.nestedPool as GqlNestedPool),
      } as ApiToken
    }
    return token as ApiToken
  })

  return sortBy(excludeNestedBptTokens(tokens as ApiToken[], pool.address), 'symbol')
}

function getHeaderDisplayTokens(pool: Pool): ApiToken[] {
  //  excludeNestedBptTokens(pool.poolTokens, pool.address) //TODO: do we need this case?? How is Panthom displayed after API fix?
  if (isV3Pool(pool) && pool.hasErc4626 && pool.hasAnyAllowedBuffer) {
    return pool.poolTokens.map(token =>
      token.isErc4626 && token.isBufferAllowed
        ? ({ ...token, ...token.underlyingToken } as ApiToken)
        : (token as ApiToken)
    )
  }
  // Is this correct?
  return getDisplayTokens(pool)
}

function excludeNestedBptTokens(tokens: PoolToken[] | ApiToken[], poolAddress: string): ApiToken[] {
  return tokens
    .filter(token => !isSameAddress(token.address, poolAddress as Address)) // Exclude the BPT pool token itself
    .filter(token => token !== undefined) as ApiToken[]
}

// Testing utils that can be kept in the test:
async function getDisplaySymbols(poolExample: PoolExample): Promise<string[]> {
  const pool = await getPoolForTest(poolExample)

  return tokenSymbols(getDisplayTokens(pool))
}

async function getDisplayTokensFromPoolExample(poolExample: PoolExample): Promise<ApiToken[]> {
  const pool = await getPoolForTest(poolExample)
  return getDisplayTokens(pool)
}

async function getHeaderDisplaySymbols(poolExample: PoolExample): Promise<string[]> {
  const pool = await getPoolForTest(poolExample)

  return tokenSymbols(getHeaderDisplayTokens(pool))
}

async function getBoostedUnderlyingTokenSymbols(poolExample: PoolExample): Promise<string[]> {
  const displayTokens = await getDisplayTokensFromPoolExample(poolExample)

  return underlyingTokenSymbols(displayTokens)
}

async function getNestedTokenSymbols(poolExample: PoolExample): Promise<string[]> {
  const displayTokens = await getDisplayTokensFromPoolExample(poolExample)

  return displayTokens
    .filter(token => token.nestedTokens)
    .flatMap(token => token.nestedTokens?.map(t => t.symbol) || [])
}

async function getOldCompositionDisplaySymbols(poolExample: PoolExample): Promise<string[]> {
  const pool = await getPoolForTest(poolExample)

  return tokenSymbols(getPoolDisplayTokensWithPossibleNestedPools(pool) as ApiToken[])
}

describe('getDisplayTokens for flat pools', () => {
  it('BAL WETH 80 20', async () => {
    expect(await getDisplaySymbols(balWeth8020)).toEqual(['BAL', 'WETH'])
  })

  it('osETH Phantom Composable Stable', async () => {
    expect(await getDisplaySymbols(osETHPhantom)).toEqual(['WETH', 'osETH'])
  })

  it('sDAI weighted', async () => {
    expect(await getDisplaySymbols(sDAIWeighted)).toEqual(['sDAI', 'wstETH'])
  })

  it.skip('v2 stable with ERC4626 tokens (V2 so no boosted)', async () => {
    expect(await getDisplaySymbols(v2SepoliaStableWithERC4626)).toEqual(['dai-aave', 'usdc-aave'])
  })
})

describe('getDisplayTokens for NESTED pools', () => {
  it('v2 nested', async () => {
    expect(await getDisplaySymbols(staBALv2Nested)).toEqual(['WBTC', 'WETH', 'staBAL3'])

    expect(await getHeaderDisplaySymbols(staBALv2Nested)).toEqual(['WBTC', 'WETH', 'staBAL3'])

    // TODO: merge this function logic into getDisplayTokens above and  getPoolDisplayTokens(pool: Pool | PoolListItem) in pool.utils
    expect(await getOldCompositionDisplaySymbols(staBALv2Nested)).toEqual([
      'USDC',
      'USDT',
      'WBTC',
      'WETH',
      'WXDAI',
      'staBAL3',
    ])

    expect(await getNestedTokenSymbols(staBALv2Nested)).toEqual(['USDC', 'USDT', 'WXDAI'])
  })

  it('aura bal (Nested with supportsNestedActions false)', async () => {
    expect(await getDisplaySymbols(auraBal)).toEqual(['B-80BAL-20WETH', 'auraBAL'])
  })
})

describe('getDisplayTokens for BOOSTED pools', () => {
  it('Morpho boosted', async () => {
    expect(await getDisplaySymbols(morphoStakeHouse)).toEqual(['csUSDL', 'steakUSDC'])

    // Only case where pool composition and header do not match
    expect(await getHeaderDisplaySymbols(morphoStakeHouse)).toEqual(['USDC', 'wUSDL'])

    expect(await getBoostedUnderlyingTokenSymbols(morphoStakeHouse)).toEqual(['USDC', 'wUSDL'])
  })

  it('sDAI boosted', async () => {
    expect(await getDisplaySymbols(sDAIBoosted)).toEqual(['sDAI', 'waGnoGNO'])
    // Only case where pool composition and header do not match
    expect(await getHeaderDisplaySymbols(sDAIBoosted)).toEqual(['GNO', 'sDAI'])
  })

  // unskip when we have a non-sepolia nested v3
  it.skip('v3 nested boosted', async () => {
    expect(await getDisplaySymbols(v3SepoliaNestedBoosted)).toEqual(['WETH', 'bb-a-USD'])

    expect(await getHeaderDisplaySymbols(v3SepoliaNestedBoosted)).toEqual(['WETH', 'bb-a-USD']) // DO WE WANT THIS in the header?

    const lpToken = getDisplayTokens(await getPoolForTest(v3SepoliaNestedBoosted))[1]
    expect(tokenSymbols(lpToken.nestedTokens as ApiToken[])).toEqual([
      'stataEthUSDC',
      'stataEthUSDT',
    ])

    // TODO: merge this function logic into getDisplayTokens above and  getPoolDisplayTokens(pool: Pool | PoolListItem) in pool.utils
    expect(await getOldCompositionDisplaySymbols(v3SepoliaNestedBoosted)).toEqual([
      'WETH',
      'stataEthUSDC',
      'stataEthUSDT',
    ])
  })
})
