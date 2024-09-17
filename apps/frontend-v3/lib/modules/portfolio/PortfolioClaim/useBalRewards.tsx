import { getChainId } from '@/lib/config/app.config'
import networkConfigs from '@/lib/config/networks'
import { bn } from '@/lib/shared/utils/numbers'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { Address, formatUnits } from 'viem'
import { useReadContracts } from 'wagmi'
import { BPT_DECIMALS } from '../../pool/pool.constants'
import { getPoolsByGaugesMap } from '../../pool/pool.utils'
import { useTokens } from '../../tokens/TokensProvider'
import { AbiMap } from '../../web3/contracts/AbiMap'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { ClaimablePool } from '../../pool/actions/claim/ClaimProvider'
import { balancerV2GaugeV5Abi } from '../../web3/contracts/abi/generated'
import { WriteContractParameters } from 'wagmi/actions'
import { compact } from 'lodash'
import { onlyExplicitRefetch } from '@/lib/shared/utils/queries'

export interface BalTokenReward {
  balance: bigint
  decimals: number
  humanBalance: string
  gaugeAddress: string
  pool: ClaimablePool
  tokenAddress: Address
  fiatBalance: BigNumber
}

export type BalTokenRewardsResult = ReturnType<typeof useBalTokenRewards>

export function useBalTokenRewards(pools: ClaimablePool[]) {
  const { userAddress, isConnected } = useUserAccount()
  const { priceFor } = useTokens()

  // Get list of all reward tokens from provided pools
  const poolByGaugeMap = useMemo(() => {
    return getPoolsByGaugesMap(pools)
  }, [pools])

  const gaugeAddresses = Object.keys(poolByGaugeMap)

  function claimableTokensCall(
    gaugeAddress: Address | string
  ): WriteContractParameters<typeof balancerV2GaugeV5Abi, 'claimable_tokens'> | undefined {
    const pool = poolByGaugeMap[gaugeAddress]

    if (!pool) return undefined

    return {
      abi: AbiMap['balancer.gaugeV5'],
      address: gaugeAddress as Address,
      functionName: 'claimable_tokens',
      args: [(userAddress || '') as Address],
      chainId: getChainId(pool.chain),
    } as const
  }

  const contractCalls = compact(gaugeAddresses.map(claimableTokensCall))

  const {
    data: claimableTokensData,
    refetch,
    isLoading,
    status,
  } = useReadContracts({
    allowFailure: true,
    contracts: contractCalls,
    query: {
      enabled: isConnected && !!pools.length,
      // In chains like polygon, we don't want background refetches while waiting for min block confirmations
      ...onlyExplicitRefetch,
    },
  })

  const balRewardsData = useMemo(() => {
    if (!claimableTokensData) return []

    return claimableTokensData
      .map((data, i) => {
        if (data.status === 'failure') return // Discard failed requests

        const balance = data.result as bigint
        if (!balance || bn(balance).isZero()) return // Discard pool without claimable balance

        const contractCall = contractCalls[i]
        if (!contractCall) return
        const gaugeAddress = contractCall.address as Address
        const pool = poolByGaugeMap[gaugeAddress]
        if (!pool) return
        const balTokenAddress = networkConfigs[pool.chain].tokens.addresses.bal
        const tokenPrice = balTokenAddress ? priceFor(balTokenAddress, pool.chain) : 0
        const fiatBalance = tokenPrice
          ? bn(formatUnits(balance, BPT_DECIMALS)).multipliedBy(tokenPrice)
          : bn(0)

        return {
          gaugeAddress,
          pool,
          balance,
          decimals: BPT_DECIMALS,
          humanBalance: formatUnits(balance, BPT_DECIMALS) || '0',
          fiatBalance,
          tokenAddress: networkConfigs[pool.chain].tokens.addresses.bal,
        }
      })
      .filter(Boolean) as BalTokenReward[]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claimableTokensData])

  return {
    balRewardsData,
    refetchBalRewards: refetch,
    isLoadingBalRewards: isLoading,
    isLoadedBalRewards: status === 'success',
  }
}
