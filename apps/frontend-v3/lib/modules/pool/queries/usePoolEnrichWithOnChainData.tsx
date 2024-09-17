import { cloneDeep } from 'lodash'
import { Address, formatUnits } from 'viem'
import { useReadContracts } from 'wagmi'
import { useTokens } from '../../tokens/TokensProvider'
import { balancerV3VaultAbi } from '../../web3/contracts/abi/balancerV3Abi'
import { weightedPoolV3Abi } from '../../web3/contracts/abi/weightedPoolV3Abi'
import { Pool } from '../PoolProvider'
import { BPT_DECIMALS } from '../pool.constants'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { bn, safeSum } from '@/lib/shared/utils/numbers'
import { getVaultConfig, isCowAmmPool, isV1Pool, isV2Pool, isV3Pool } from '../pool.helpers'
import { getChainId } from '@/lib/config/app.config'
import {
  balancerV2ComposableStablePoolV5Abi,
  balancerV2VaultAbi,
} from '../../web3/contracts/abi/generated'
import { isComposableStablePool } from '../pool.utils'
import { cowAmmPoolAbi } from '../../web3/contracts/abi/cowAmmAbi'

export function usePoolEnrichWithOnChainData(pool: Pool) {
  const { priceFor } = useTokens()
  const { isLoading, poolTokenBalances, totalSupply, refetch } = usePoolOnchainData(pool)
  const clone = enrichPool({ isLoading, pool, priceFor, poolTokenBalances, totalSupply })

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
        abi: balancerV3VaultAbi,
        address: vaultAddress,
        functionName: 'getPoolTokenInfo',
        args: [pool.address as Address],
      },
      {
        chainId,
        abi: weightedPoolV3Abi,
        address: pool.address as Address,
        functionName: 'totalSupply',
        args: [],
      },
    ],
  })

  return {
    ...v3Query,
    poolTokenBalances: v3Query.data?.[0][2],
    totalSupply: v3Query.data?.[1],
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
  }
}

type Params = {
  isLoading: boolean
  pool: Pool
  priceFor: (address: string, chain: GqlChain) => number
  poolTokenBalances: readonly bigint[] | undefined
  totalSupply: bigint | undefined
}
function enrichPool({ isLoading, pool, priceFor, poolTokenBalances, totalSupply }: Params) {
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
  return clone
}
