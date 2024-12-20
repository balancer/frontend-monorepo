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
  getCompositionTokens,
  getUserReferenceTokens,
  getUserReferenceTokensWithPossibleNestedTokens,
} from './pool.tokens.display'
import { ApiToken } from './pool.types'

// Testing utils that can be kept in the test:
async function getCompositionTokenSymbols(poolExample: PoolExample): Promise<string[]> {
  const pool = await getPoolForTest(poolExample)

  return tokenSymbols(getCompositionTokens(pool))
}

async function getCompositionTokensFromPoolExample(poolExample: PoolExample): Promise<ApiToken[]> {
  const pool = await getPoolForTest(poolExample)
  return getCompositionTokens(pool)
}

async function getUserReferenceTokenSymbols(poolExample: PoolExample): Promise<string[]> {
  const pool = await getPoolForTest(poolExample)

  return tokenSymbols(getUserReferenceTokens(pool))
}

async function getBoostedUnderlyingTokenSymbols(poolExample: PoolExample): Promise<string[]> {
  const displayTokens = await getCompositionTokensFromPoolExample(poolExample)

  return underlyingTokenSymbols(displayTokens)
}

async function getNestedTokenSymbols(poolExample: PoolExample): Promise<string[]> {
  const displayTokens = await getCompositionTokensFromPoolExample(poolExample)

  return displayTokens
    .filter(token => token.nestedTokens)
    .flatMap(token => token.nestedTokens?.map(t => t.symbol) || [])
}

async function getUserReferenceTokensWithPossibleNestedTokensSymbols(
  poolExample: PoolExample
): Promise<string[]> {
  const pool = await getPoolForTest(poolExample)

  return tokenSymbols(getUserReferenceTokensWithPossibleNestedTokens(pool) as ApiToken[])
}

async function getUserReferenceTokensWeights(
  poolExample: PoolExample
): Promise<(string | undefined)[]> {
  const pool = await getPoolForTest(poolExample)

  return getUserReferenceTokens(pool).map(t => t.weight)
}

async function getUserReferenceTokensURIs(
  poolExample: PoolExample
): Promise<(string | null | undefined)[]> {
  const pool = await getPoolForTest(poolExample)

  return getUserReferenceTokens(pool).map(t => t.logoURI)
}

async function getCompositionTokensWeights(
  poolExample: PoolExample
): Promise<(string | undefined)[]> {
  const pool = await getPoolForTest(poolExample)

  return getCompositionTokens(pool).map(t => t.weight)
}

async function getCompositionTokensURIs(
  poolExample: PoolExample
): Promise<(string | null | undefined)[]> {
  const pool = await getPoolForTest(poolExample)

  return getCompositionTokens(pool).map(t => t.logoURI)
}

describe('getDisplayTokens for flat pools', () => {
  it('BAL WETH 80 20', async () => {
    expect(await getCompositionTokenSymbols(balWeth8020)).toEqual(['BAL', 'WETH'])

    expect(await getUserReferenceTokenSymbols(balWeth8020)).toEqual(['BAL', 'WETH'])

    expect(await getUserReferenceTokensWeights(balWeth8020)).toEqual(['0.8', '0.2'])
    expect(await getCompositionTokensWeights(balWeth8020)).toEqual(['0.8', '0.2'])

    expect(await getUserReferenceTokensURIs(balWeth8020)).toMatchInlineSnapshot(`
      [
        "https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xba100000625a3754423978a60c9317c58a424e3d.png",
        "https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
      ]
    `)

    expect(await getCompositionTokensURIs(balWeth8020)).toMatchInlineSnapshot(`
      [
        "https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xba100000625a3754423978a60c9317c58a424e3d.png",
        "https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
      ]
    `)

    expect(await getUserReferenceTokensWithPossibleNestedTokensSymbols(balWeth8020)).toEqual([
      'BAL',
      'WETH',
    ])
  })

  it('osETH Phantom Composable Stable', async () => {
    expect(await getCompositionTokenSymbols(osETHPhantom)).toEqual(['WETH', 'osETH'])

    expect(await getUserReferenceTokenSymbols(osETHPhantom)).toEqual(['WETH', 'osETH'])

    expect(await getUserReferenceTokensWithPossibleNestedTokensSymbols(osETHPhantom)).toEqual([
      'WETH',
      'osETH',
    ])
  })

  it('sDAI weighted', async () => {
    expect(await getCompositionTokenSymbols(sDAIWeighted)).toEqual(['sDAI', 'wstETH'])

    expect(await getUserReferenceTokenSymbols(sDAIWeighted)).toEqual(['sDAI', 'wstETH'])

    expect(await getUserReferenceTokensWithPossibleNestedTokensSymbols(sDAIWeighted)).toEqual([
      'sDAI',
      'wstETH',
    ])
  })

  it.skip('v2 stable with ERC4626 tokens (V2 so no boosted)', async () => {
    expect(await getCompositionTokenSymbols(v2SepoliaStableWithERC4626)).toEqual([
      'dai-aave',
      'usdc-aave',
    ])
    expect(await getUserReferenceTokenSymbols(v2SepoliaStableWithERC4626)).toEqual([
      'dai-aave',
      'usdc-aave',
    ])

    expect(
      await getUserReferenceTokensWithPossibleNestedTokensSymbols(v2SepoliaStableWithERC4626)
    ).toEqual(['dai-aave', 'usdc-aave'])
  })
})

describe('getDisplayTokens for NESTED pools', () => {
  it('v2 nested', async () => {
    expect(await getCompositionTokenSymbols(staBALv2Nested)).toEqual(['WBTC', 'WETH', 'staBAL3'])

    expect(await getUserReferenceTokenSymbols(staBALv2Nested)).toEqual(['WBTC', 'WETH', 'staBAL3'])

    expect(await getUserReferenceTokensWithPossibleNestedTokensSymbols(staBALv2Nested)).toEqual([
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
    expect(await getCompositionTokenSymbols(auraBal)).toEqual(['B-80BAL-20WETH', 'auraBAL'])

    expect(await getUserReferenceTokenSymbols(auraBal)).toEqual(['B-80BAL-20WETH', 'auraBAL'])

    expect(await getUserReferenceTokensWithPossibleNestedTokensSymbols(auraBal)).toEqual([
      'BAL',
      'WETH',
      'auraBAL',
    ])
  })
})

describe('getDisplayTokens for BOOSTED pools', () => {
  it('Morpho boosted', async () => {
    expect(await getCompositionTokenSymbols(morphoStakeHouse)).toEqual(['csUSDL', 'steakUSDC'])

    expect(await getUserReferenceTokenSymbols(morphoStakeHouse)).toEqual(['USDC', 'wUSDL'])

    expect(await getBoostedUnderlyingTokenSymbols(morphoStakeHouse)).toEqual(['USDC', 'wUSDL'])

    expect(await getUserReferenceTokensWithPossibleNestedTokensSymbols(morphoStakeHouse)).toEqual([
      'USDC',
      'wUSDL',
    ])
  })

  it('sDAI boosted', async () => {
    expect(await getCompositionTokenSymbols(sDAIBoosted)).toEqual(['sDAI', 'waGnoGNO'])

    expect(await getUserReferenceTokenSymbols(sDAIBoosted)).toEqual(['GNO', 'sDAI'])

    expect(await getUserReferenceTokensWithPossibleNestedTokensSymbols(sDAIBoosted)).toEqual([
      'GNO',
      'sDAI',
    ])
  })

  // unskip when we have a non-sepolia nested v3
  it.skip('v3 nested boosted', async () => {
    expect(await getCompositionTokenSymbols(v3SepoliaNestedBoosted)).toEqual(['WETH', 'bb-a-USD'])

    expect(await getUserReferenceTokenSymbols(v3SepoliaNestedBoosted)).toEqual(['WETH', 'bb-a-USD']) // DO WE WANT THIS in the header?

    const lpToken = getCompositionTokens(await getPoolForTest(v3SepoliaNestedBoosted))[1]
    expect(tokenSymbols(lpToken.nestedTokens as ApiToken[])).toEqual([
      'stataEthUSDC',
      'stataEthUSDT',
    ])

    expect(
      await getUserReferenceTokensWithPossibleNestedTokensSymbols(v3SepoliaNestedBoosted)
    ).toEqual(['WETH', 'stataEthUSDC', 'stataEthUSDT'])
  })
})

//TODO: add tests for weights and iconUrl
