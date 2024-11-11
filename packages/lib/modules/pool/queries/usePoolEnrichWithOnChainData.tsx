import { cloneDeep } from 'lodash'
import { Address, formatUnits } from 'viem'
import { useReadContracts } from 'wagmi'
import { useTokens } from '../../tokens/TokensProvider'
import { Pool } from '../PoolProvider'
import { BPT_DECIMALS } from '../pool.constants'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { bn, safeSum } from '@repo/lib/shared/utils/numbers'
import { getVaultConfig, isCowAmmPool, isV1Pool, isV2Pool, isV3Pool } from '../pool.helpers'
import { getChainId } from '@repo/lib/config/app.config'
import {
  balancerV2ComposableStablePoolV5Abi,
  balancerV2VaultAbi,
} from '../../web3/contracts/abi/generated'
import { isComposableStablePool } from '../pool.utils'
import { cowAmmPoolAbi } from '../../web3/contracts/abi/cowAmmAbi'
import { weightedPoolAbi_V3, vaultExtensionAbi_V3 } from '@balancer/sdk'

export function usePoolEnrichWithOnChainData(pool: Pool) {
  const { priceFor } = useTokens()

  const { isLoading, poolTokenBalances, totalSupply, nestedPoolData, refetch } =
    usePoolOnchainData(pool)

  const clone = enrichPool({
    isLoading,
    pool,
    priceFor,
    poolTokenBalances,
    totalSupply,
    nestedPoolData,
  })

  return { isLoading, pool: clone, refetch }
}

/*
  We call all queries to avoid breaking the rules of react hooks
  but only one query will be executed (the one with enabled: true)
*/
function usePoolOnchainData(pool: Pool) {
  const cowAmmResult = useCowPoolOnchainData(pool)
  const v2Result = useV2PoolOnchainData(pool)
  const v3Result = useV3PoolOnchainData(pool)

  if (isCowAmmPool(pool.type)) return cowAmmResult
  if (isV2Pool(pool)) return v2Result
  if (isV3Pool(pool)) return v3Result

  throw new Error(`Unsupported pool: protocolVersion ${pool.protocolVersion}, type ${pool.type}`)
}

function useV3PoolOnchainData(pool: Pool) {
  const { vaultAddress } = getVaultConfig(pool)
  const chainId = getChainId(pool.chain)

  const v3Query = useReadContracts({
    query: {
      enabled: isV3Pool(pool),
    },
    allowFailure: false,
    contracts: [
      {
        chainId,
        abi: vaultExtensionAbi_V3,
        address: vaultAddress,
        functionName: 'getPoolTokenInfo',
        args: [pool.address as Address],
      },
      {
        chainId,
        abi: weightedPoolAbi_V3,
        address: pool.address as Address,
        functionName: 'totalSupply',
        args: [],
      },
    ],
  })

  const nestedPoolTokens = pool.poolTokens.filter(token => token.hasNestedPool)

  const v3QueryNestedPools = useReadContracts({
    query: {
      enabled: isV3Pool(pool) && pool.poolTokens.some(token => token.hasNestedPool),
    },
    allowFailure: false,
    contracts: [
      // first half of nestedPoolData will be token balances
      ...nestedPoolTokens.map(token => ({
        chainId,
        abi: vaultExtensionAbi_V3,
        address: vaultAddress,
        functionName: 'getPoolTokenInfo',
        args: [token.address as Address],
      })),
      // second half of nestedPoolData will be totalSupply
      ...nestedPoolTokens.map(token => ({
        chainId,
        abi: weightedPoolAbi_V3,
        address: token.address as Address,
        functionName: 'totalSupply',
        args: [],
      })),
    ],
  })

  return {
    ...v3Query,
    poolTokenBalances: v3Query.data?.[0][2],
    totalSupply: v3Query.data?.[1],
    nestedPoolData: v3QueryNestedPools.data,
  }
}

function useV2PoolOnchainData(pool: Pool) {
  const { vaultAddress } = getVaultConfig(pool)
  const chainId = getChainId(pool.chain)
  const isComposableStable = isComposableStablePool(pool)

  const v2Query = useReadContracts({
    query: {
      enabled: isV2Pool(pool),
    },
    allowFailure: false,
    contracts: [
      {
        chainId,
        abi: balancerV2VaultAbi,
        address: vaultAddress,
        functionName: 'getPoolTokens',
        args: [pool.id as Address],
      },
      {
        chainId,
        // composable stable pool has actual and total supply functions exposed
        abi: balancerV2ComposableStablePoolV5Abi,
        address: pool.address as Address,
        functionName: isComposableStable ? 'getActualSupply' : 'totalSupply',
      } as const,
    ],
  })
  return {
    ...v2Query,
    poolTokenBalances: v2Query.data?.[0][1],
    totalSupply: v2Query.data?.[1],
    nestedPoolData: undefined, // v2 pools that have nested pools are no longer supported?
  }
}

/*
  We need a custom useReadContracts for cow AMM pools because they are v1 pools
  There's no vault in V1 so we get the balances from the pool contract)
*/
function useCowPoolOnchainData(pool: Pool) {
  const chainId = getChainId(pool.chain)

  const balanceContracts = pool.poolTokens.map(token => {
    return {
      chainId,
      address: pool.address as Address,
      abi: cowAmmPoolAbi,
      functionName: 'getBalance',
      args: [token.address as Address],
    } as const
  })

  const cowQuery = useReadContracts({
    query: {
      enabled: isV1Pool(pool),
    },
    allowFailure: false,
    contracts: [
      ...balanceContracts,
      {
        chainId,
        abi: cowAmmPoolAbi,
        address: pool.address as Address,
        functionName: 'totalSupply',
      } as const,
    ],
  })

  return {
    ...cowQuery,
    totalSupply: cowQuery.data?.at(-1),
    poolTokenBalances: cowQuery.data?.slice(0, -1),
    nestedPoolData: undefined, // v1 pools don't have nested pools?
  }
}

type Params = {
  isLoading: boolean
  pool: Pool
  priceFor: (address: string, chain: GqlChain) => number
  poolTokenBalances: readonly bigint[] | undefined
  totalSupply: bigint | undefined
  nestedPoolData: any // TODO: how to type this?
}

function enrichPool({
  isLoading,
  pool,
  priceFor,
  poolTokenBalances,
  totalSupply,
  nestedPoolData,
}: Params) {
  if (isLoading || !poolTokenBalances) return pool

  const clone = cloneDeep(pool)

  const filteredTokens = clone.poolTokens.filter(token =>
    pool.displayTokens.find(displayToken => token.address === displayToken.address)
  )

  clone.poolTokens.forEach((token, index) => {
    if (!poolTokenBalances) return
    const poolTokenBalance = poolTokenBalances[index]
    if (!poolTokenBalance) return
    const tokenBalance = formatUnits(poolTokenBalance, token.decimals)
    token.balance = tokenBalance
    token.balanceUSD = bn(tokenBalance).times(priceFor(token.address, pool.chain)).toString()
  })

  clone.dynamicData.totalLiquidity = safeSum(
    filteredTokens.map(
      token => (priceFor(token.address, pool.chain) || 0) * parseFloat(token.balance)
    )
  )

  clone.dynamicData.totalShares = formatUnits(totalSupply || 0n, BPT_DECIMALS)

  if (nestedPoolData) {
    const nestedPoolTokens = clone.poolTokens.filter(poolToken => poolToken.hasNestedPool)
    const nestedPoolBalancesIndex = 0 // first half of nestedPoolData is token balances
    const totalSupplyIndex = nestedPoolData.length / 2 // second half of nestedPoolData is totalSupply

    nestedPoolTokens.forEach((poolToken, poolTokenIndex) => {
      if (!poolToken.nestedPool) return

      const totalSupply = nestedPoolData[totalSupplyIndex + poolTokenIndex]
      poolToken.nestedPool.totalShares = formatUnits(totalSupply || 0n, BPT_DECIMALS)

      poolToken.nestedPool.totalLiquidity = bn(poolToken.nestedPool.totalShares)
        .times(priceFor(poolToken.address, pool.chain))
        .toString()

      poolToken.nestedPool.nestedPercentage = bn(poolToken.balance)
        .div(poolToken.nestedPool.totalShares)
        .toString()

      poolToken.nestedPool.nestedShares = bn(poolToken.nestedPool.totalShares)
        .times(poolToken.nestedPool.nestedPercentage)
        .toString()

      poolToken.nestedPool.tokens.forEach((nestedPoolToken, nestedPoolTokenIndex) => {
        nestedPoolToken.balance = bn(
          formatUnits(
            nestedPoolData[nestedPoolBalancesIndex + poolTokenIndex][2][nestedPoolTokenIndex],
            nestedPoolToken.decimals
          )
        )
          .times(bn(poolToken.nestedPool?.nestedPercentage || 0))
          .toString()

        nestedPoolToken.balanceUSD = bn(nestedPoolToken.balance)
          .times(priceFor(nestedPoolToken.address, pool.chain))
          .toString()
      })
    })
  }

  return clone
}
