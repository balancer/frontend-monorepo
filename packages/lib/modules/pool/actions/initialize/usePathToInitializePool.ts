import { useEffect, useMemo } from 'react'
import { usePoolCreationForm } from '../create/PoolCreationFormProvider'
import { useParams } from 'next/navigation'
import { useReadContracts, useReadContract } from 'wagmi'
import { formatUnits, Address, erc20Abi, parseAbi } from 'viem'
import { getChainId } from '@repo/lib/config/app.config'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { AddressProvider } from '@balancer/sdk'
import { vaultExtensionAbi_V3 } from '@balancer/sdk'
import { PERCENTAGE_DECIMALS } from '../create/constants'
import { usePoolCreationFormSteps } from '../create/usePoolCreationFormSteps'
import { PoolCreationToken, SupportedPoolTypes } from '../create/types'
import { WeightedPoolStructure } from '../create/constants'
import { isStablePool, isWeightedPool, isReClammPool } from '../create/helpers'
import { reClammPoolAbi } from '@repo/lib/modules/web3/contracts/abi/generated'

type HooksConfig = { hooksContract: Address }
type PoolRoleAccounts = { swapFeeManager: Address; pauseManager: Address }
type PoolTokenInfo = [Address[], { rateProvider: Address; paysYieldFees: boolean }[]]
type PoolConfig = {
  staticSwapFeePercentage: bigint
  liquidityManagement: {
    disableUnbalancedLiquidity: boolean
    enableDonation: boolean
  }
}
type TokenData = {
  address: Address
  [key: string]: string | number | bigint | Address | undefined
}

/**
 *  Use path to fetch pool data to set up local storage for pool initialization
 */
export function usePathToInitializePool() {
  const { poolCreationForm, poolAddress, setPoolAddress, reClammConfigForm } = usePoolCreationForm()
  const { lastStep } = usePoolCreationFormSteps()
  const params = useParams()

  const networkParam = params.network as GqlChain | undefined
  const poolAddressParam = params.poolAddress as Address | undefined
  const poolTypeParam = params.poolType as SupportedPoolTypes | undefined

  const chainId = networkParam ? getChainId(networkParam) : undefined
  const isStablePoolType = poolTypeParam && isStablePool(poolTypeParam)
  const isWeightedPoolType = poolTypeParam && isWeightedPool(poolTypeParam)
  const isReClammPoolType = poolTypeParam && isReClammPool(poolTypeParam)

  const shouldUsePathToInitialize = !poolAddress && !!poolAddressParam

  const poolFunctionNames = ['name', 'symbol']
  const vaultFunctionNames = [
    'getPoolTokenInfo',
    'getPoolConfig',
    'getHooksConfig',
    'getPoolRoleAccounts',
  ]

  const poolDataReads = useMemo(() => {
    if (!poolAddressParam || !chainId) return []

    const poolContractReads = poolFunctionNames.map(functionName => ({
      address: poolAddressParam,
      abi: erc20Abi,
      chainId,
      functionName,
    }))
    const vaultContractReads = vaultFunctionNames.map(functionName => ({
      address: AddressProvider.Vault(chainId),
      chainId,
      abi: vaultExtensionAbi_V3,
      functionName,
      args: [poolAddressParam],
    }))

    return [...poolContractReads, ...vaultContractReads]
  }, [poolAddressParam, chainId])

  const { data: poolData, isLoading: isLoadingPoolData } = useReadContracts({
    query: { enabled: poolDataReads.length > 0 && shouldUsePathToInitialize },
    contracts: poolDataReads,
  })

  const tokenFunctionNames = ['name', 'symbol', 'decimals']

  const tokenContracts = useMemo(() => {
    if (!poolData || !chainId) return []

    const tokenAddresses = (poolData[2].result as unknown as any[])[0] as Address[]

    return tokenFunctionNames
      .flatMap((functionName: string) =>
        tokenAddresses.map((address: Address) => ({
          address,
          abi: erc20Abi,
          chainId,
          functionName,
        }))
      )
      .sort((a, b) => a.address.localeCompare(b.address))
  }, [chainId, poolData])

  const { data: poolTokenDetails, isLoading: isLoadingPoolTokenDetails } = useReadContracts({
    query: { enabled: tokenContracts.length > 0 && shouldUsePathToInitialize },
    contracts: tokenContracts,
  })

  const { data: amplificationParameter, isLoading: isLoadingAmplificationParameter } =
    useReadContract({
      address: poolAddressParam,
      abi: parseAbi(['function getAmplificationParameter() view returns (uint256)']),
      functionName: 'getAmplificationParameter',
      chainId,
      query: { enabled: isStablePoolType && shouldUsePathToInitialize },
    })
  const { data: normalizedWeights, isLoading: isLoadingWeights } = useReadContract({
    address: poolAddressParam,
    abi: parseAbi(['function getNormalizedWeights() view returns (uint256[])']),
    functionName: 'getNormalizedWeights',
    chainId,
    query: { enabled: isWeightedPoolType && shouldUsePathToInitialize },
  })
  const { data: reClammConfig, isLoading: isLoadingReClamm } = useReadContract({
    address: poolAddressParam,
    abi: reClammPoolAbi,
    functionName: 'getReClammPoolImmutableData',
    chainId,
    query: { enabled: isReClammPoolType && shouldUsePathToInitialize },
  })

  const isLoadingPool =
    isLoadingPoolData ||
    isLoadingPoolTokenDetails ||
    isLoadingAmplificationParameter ||
    isLoadingWeights ||
    isLoadingReClamm

  useEffect(() => {
    const hasRequiredWeightedInfo = !isWeightedPoolType || !!normalizedWeights
    const hasRequiredStableInfo = !isStablePoolType || !!amplificationParameter
    const hasRequiredData =
      !!poolData && !!poolTokenDetails && hasRequiredWeightedInfo && hasRequiredStableInfo

    if (!isLoadingPool && hasRequiredData && shouldUsePathToInitialize) {
      const [name, symbol, poolTokenInfo, poolConfig, hooksConfig, poolRoleAccounts] =
        poolData ?? []
      const [tokenAddresses, tokenConfigs] = poolTokenInfo.result as unknown as PoolTokenInfo
      const { hooksContract: poolHooksContract } = hooksConfig.result as unknown as HooksConfig
      const { swapFeeManager, pauseManager } =
        poolRoleAccounts.result as unknown as PoolRoleAccounts
      const { staticSwapFeePercentage, liquidityManagement } =
        poolConfig.result as unknown as PoolConfig
      const { disableUnbalancedLiquidity, enableDonation } = liquidityManagement

      // Group token details by address (each token has 3 reads: name, symbol, decimals)
      const poolTokenData =
        poolTokenDetails?.reduce<Record<Address, TokenData>>((acc, item, index) => {
          const address = tokenContracts[index].address
          const functionName = tokenFunctionNames[index % tokenFunctionNames.length]
          if (!acc[address]) acc[address] = { address }
          acc[address][functionName] = item.result
          return acc
        }, {}) ?? {}

      const formattedWeights = normalizedWeights
        ? normalizedWeights.map(weight => formatUnits(weight, PERCENTAGE_DECIMALS))
        : undefined

      const poolTokens: PoolCreationToken[] = tokenAddresses.map((address, index) => ({
        address,
        rateProvider: tokenConfigs[index].rateProvider,
        paysYieldFees: tokenConfigs[index].paysYieldFees,
        amount: '',
        weight: formattedWeights ? formattedWeights[index] : undefined,
        data: poolTokenData[address]
          ? ({ ...poolTokenData[address], chain: params.network, chainId } as any)
          : undefined,
      }))

      const weightSet = new Set(formattedWeights ?? [])
      const isFiftyFiftyWeights = weightSet.size === 1 && weightSet.has('50')
      const isEightyTwentyWeights = weightSet.has('80') && weightSet.has('20')
      const weightedPoolStructure = isFiftyFiftyWeights
        ? WeightedPoolStructure.FiftyFifty
        : isEightyTwentyWeights
          ? WeightedPoolStructure.EightyTwenty
          : WeightedPoolStructure.Custom

      const swapFeePercentage = formatUnits(staticSwapFeePercentage, PERCENTAGE_DECIMALS)

      poolCreationForm.reset({
        network: networkParam,
        poolType: poolTypeParam,
        poolTokens,
        name: name?.result as string,
        symbol: symbol?.result as string,
        swapFeeManager,
        pauseManager,
        swapFeePercentage,
        poolHooksContract,
        disableUnbalancedLiquidity,
        enableDonation,
        ...(amplificationParameter && {
          amplificationParameter: formatUnits(amplificationParameter, 3),
        }), // SC multiplies by 1e3 precision during creation of pool
        ...(isWeightedPoolType && { weightedPoolStructure }),
      })

      if (isReClammPoolType && reClammConfig) {
        reClammConfigForm.reset({
          initialMinPrice: formatUnits(reClammConfig.initialMinPrice, 18),
          initialTargetPrice: formatUnits(reClammConfig.initialTargetPrice, 18),
          initialMaxPrice: formatUnits(reClammConfig.initialMaxPrice, 18),
          priceShiftDailyRate: formatUnits(reClammConfig.initialDailyPriceShiftExponent, 16),
          centerednessMargin: formatUnits(reClammConfig.initialCenterednessMargin, 16),
        })
      }

      setPoolAddress(poolAddressParam)
      lastStep()
    }
  }, [
    params.network,
    params.poolType,
    params.poolAddress,
    poolData,
    poolTokenDetails,
    isLoadingPool,
  ])

  return { isLoadingPool }
}
