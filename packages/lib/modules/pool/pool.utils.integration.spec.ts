import { getPoolForTest } from './__mocks__/getPoolMock'
import {
  morphoStakeHouse,
  sDAIBoosted,
  v3SepoliaNestedBoosted,
} from './__mocks__/pool-examples/boosted'
import {
  balWeth8020,
  osETHPhantom,
  sDAIWeighted,
  v2SepoliaStableWithERC4626,
} from './__mocks__/pool-examples/flat'
import { auraBal, staBALv2Nested } from './__mocks__/pool-examples/nested'
import {
  tokenSymbols,
  underlyingTokenSymbols,
} from './__mocks__/pool-examples/pool-example-helpers'
import { PoolExample } from './__mocks__/pool-examples/pool-examples.types'
import {
  getCompositionDisplayTokens,
  getHeaderDisplayTokens,
  getHeaderTokensWithPossibleNestedTokens,
} from './pool.tokens.display'
import { ApiToken } from './pool.types'

// Testing utils that can be kept in the test:
async function getCompositionDisplaySymbols(poolExample: PoolExample): Promise<string[]> {
  const pool = await getPoolForTest(poolExample)

  return tokenSymbols(getCompositionDisplayTokens(pool))
}

async function getCompositionDisplayTokensFromPoolExample(
  poolExample: PoolExample
): Promise<ApiToken[]> {
  const pool = await getPoolForTest(poolExample)
  return getCompositionDisplayTokens(pool)
}

async function getHeaderDisplaySymbols(poolExample: PoolExample): Promise<string[]> {
  const pool = await getPoolForTest(poolExample)

  return tokenSymbols(getHeaderDisplayTokens(pool))
}

async function getBoostedUnderlyingTokenSymbols(poolExample: PoolExample): Promise<string[]> {
  const displayTokens = await getCompositionDisplayTokensFromPoolExample(poolExample)

  return underlyingTokenSymbols(displayTokens)
}

async function getNestedTokenSymbols(poolExample: PoolExample): Promise<string[]> {
  const displayTokens = await getCompositionDisplayTokensFromPoolExample(poolExample)

  return displayTokens
    .filter(token => token.nestedTokens)
    .flatMap(token => token.nestedTokens?.map(t => t.symbol) || [])
}

async function getHeaderTokensWithPossibleNestedTokensSymbols(
  poolExample: PoolExample
): Promise<string[]> {
  const pool = await getPoolForTest(poolExample)

  return tokenSymbols(getHeaderTokensWithPossibleNestedTokens(pool) as ApiToken[])
}

describe('getDisplayTokens for flat pools', () => {
  it('BAL WETH 80 20', async () => {
    expect(await getCompositionDisplaySymbols(balWeth8020)).toEqual(['BAL', 'WETH'])

    expect(await getHeaderDisplaySymbols(balWeth8020)).toEqual(['BAL', 'WETH'])

    expect(await getHeaderTokensWithPossibleNestedTokensSymbols(balWeth8020)).toEqual([
      'BAL',
      'WETH',
    ])
  })

  it('osETH Phantom Composable Stable', async () => {
    expect(await getCompositionDisplaySymbols(osETHPhantom)).toEqual(['WETH', 'osETH'])

    expect(await getHeaderDisplaySymbols(osETHPhantom)).toEqual(['WETH', 'osETH'])

    expect(await getHeaderTokensWithPossibleNestedTokensSymbols(osETHPhantom)).toEqual([
      'WETH',
      'osETH',
    ])
  })

  it('sDAI weighted', async () => {
    expect(await getCompositionDisplaySymbols(sDAIWeighted)).toEqual(['sDAI', 'wstETH'])

    expect(await getHeaderDisplaySymbols(sDAIWeighted)).toEqual(['sDAI', 'wstETH'])

    expect(await getHeaderTokensWithPossibleNestedTokensSymbols(sDAIWeighted)).toEqual([
      'sDAI',
      'wstETH',
    ])
  })

  it.skip('v2 stable with ERC4626 tokens (V2 so no boosted)', async () => {
    expect(await getCompositionDisplaySymbols(v2SepoliaStableWithERC4626)).toEqual([
      'dai-aave',
      'usdc-aave',
    ])
    expect(await getHeaderDisplaySymbols(v2SepoliaStableWithERC4626)).toEqual([
      'dai-aave',
      'usdc-aave',
    ])

    expect(
      await getHeaderTokensWithPossibleNestedTokensSymbols(v2SepoliaStableWithERC4626)
    ).toEqual(['dai-aave', 'usdc-aave'])
  })
})

describe('getDisplayTokens for NESTED pools', () => {
  it('v2 nested', async () => {
    expect(await getCompositionDisplaySymbols(staBALv2Nested)).toEqual(['WBTC', 'WETH', 'staBAL3'])

    expect(await getHeaderDisplaySymbols(staBALv2Nested)).toEqual(['WBTC', 'WETH', 'staBAL3'])

    expect(await getHeaderTokensWithPossibleNestedTokensSymbols(staBALv2Nested)).toEqual([
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
    expect(await getCompositionDisplaySymbols(auraBal)).toEqual(['B-80BAL-20WETH', 'auraBAL'])

    expect(await getHeaderDisplaySymbols(auraBal)).toEqual(['B-80BAL-20WETH', 'auraBAL'])

    expect(await getHeaderTokensWithPossibleNestedTokensSymbols(auraBal)).toEqual([
      'BAL',
      'WETH',
      'auraBAL',
    ])
  })
})

describe('getDisplayTokens for BOOSTED pools', () => {
  it('Morpho boosted', async () => {
    expect(await getCompositionDisplaySymbols(morphoStakeHouse)).toEqual(['csUSDL', 'steakUSDC'])

    expect(await getHeaderDisplaySymbols(morphoStakeHouse)).toEqual(['USDC', 'wUSDL'])

    expect(await getBoostedUnderlyingTokenSymbols(morphoStakeHouse)).toEqual(['USDC', 'wUSDL'])

    expect(await getHeaderTokensWithPossibleNestedTokensSymbols(morphoStakeHouse)).toEqual([
      'USDC',
      'wUSDL',
    ])
  })

  it('sDAI boosted', async () => {
    expect(await getCompositionDisplaySymbols(sDAIBoosted)).toEqual(['sDAI', 'waGnoGNO'])

    expect(await getHeaderDisplaySymbols(sDAIBoosted)).toEqual(['GNO', 'sDAI'])

    expect(await getHeaderTokensWithPossibleNestedTokensSymbols(sDAIBoosted)).toEqual([
      'GNO',
      'sDAI',
    ])
  })

  // unskip when we have a non-sepolia nested v3
  it.skip('v3 nested boosted', async () => {
    expect(await getCompositionDisplaySymbols(v3SepoliaNestedBoosted)).toEqual(['WETH', 'bb-a-USD'])

    expect(await getHeaderDisplaySymbols(v3SepoliaNestedBoosted)).toEqual(['WETH', 'bb-a-USD']) // DO WE WANT THIS in the header?

    const lpToken = getCompositionDisplayTokens(await getPoolForTest(v3SepoliaNestedBoosted))[1]
    expect(tokenSymbols(lpToken.nestedTokens as ApiToken[])).toEqual([
      'stataEthUSDC',
      'stataEthUSDT',
    ])

    expect(await getHeaderTokensWithPossibleNestedTokensSymbols(v3SepoliaNestedBoosted)).toEqual([
      'WETH',
      'stataEthUSDC',
      'stataEthUSDT',
    ])
  })
})

//TODO: add tests for weights and iconUrl
