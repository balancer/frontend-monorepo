import { useEffect, useMemo } from 'react'
import { usePoolCreationForm } from './PoolCreationFormProvider'
import { useParams } from 'next/navigation'
import { useReadContracts, useReadContract } from 'wagmi'
import { formatUnits, Address, erc20Abi, parseAbi } from 'viem'
import { getChainId } from '@repo/lib/config/app.config'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { AddressProvider } from '@balancer/sdk'
import { vaultExtensionAbi_V3 } from '@balancer/sdk'
import { PERCENTAGE_DECIMALS } from './constants'
import { usePoolCreationFormSteps } from './usePoolCreationFormSteps'
import { PoolCreationToken, SupportedPoolTypes } from './types'
import { WeightedPoolStructure } from './constants'
import { isStablePool, isWeightedPool, isReClammPool } from './helpers'
import { reClammPoolAbi } from '@repo/lib/modules/web3/contracts/abi/generated'
import { CustomToken } from '@repo/lib/modules/tokens/token.types'

type PoolTokenInfo = [Address[], { rateProvider: Address; paysYieldFees: boolean }[]]
type PoolConfig = {
  staticSwapFeePercentage: bigint
  liquidityManagement: { disableUnbalancedLiquidity: boolean; enableDonation: boolean }
}
type HooksConfig = { hooksContract: Address }
type PoolRoleAccounts = { swapFeeManager: Address; pauseManager: Address }
type ReadContractResponse<T> = { result: T | undefined; status: 'success' | 'failure' }
type PoolDataResponse = [
  ReadContractResponse<string>,
  ReadContractResponse<string>,
  ReadContractResponse<PoolTokenInfo>,
  ReadContractResponse<PoolConfig>,
  ReadContractResponse<HooksConfig>,
  ReadContractResponse<PoolRoleAccounts>,
]
type TokenDataResponse = ReadContractResponse<string | number>[]
type PoolTokenDataObject = Record<
  Address,
  {
    address: Address
    [key: string]: string | number | undefined
  }
>

/**
 *  Must fetch data on chain because API does not capture pool until after initialization
 *  Reads to balancer vault always have tokens sorted by address (i.e. token weights, etc.)
 */
export function useHydratePoolCreationForm() {
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
  }) as { data: PoolDataResponse; isLoading: boolean }

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
      .sort((a, b) => a.address.localeCompare(b.address)) // Sort by address to ensure token details are in same order as token addresses
  }, [chainId, poolData])

  const { data: poolTokenDetails, isLoading: isLoadingPoolTokenDetails } = useReadContracts({
    query: { enabled: tokenContracts.length > 0 && shouldUsePathToInitialize },
    contracts: tokenContracts,
  }) as { data: TokenDataResponse; isLoading: boolean }

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

      if (
        !poolTokenInfo?.result ||
        !hooksConfig?.result ||
        !poolRoleAccounts?.result ||
        !poolConfig?.result
      ) {
        return
      }

      const [tokenAddresses, tokenConfigs] = poolTokenInfo.result
      const { hooksContract: poolHooksContract } = hooksConfig.result
      const { swapFeeManager, pauseManager } = poolRoleAccounts.result
      const { staticSwapFeePercentage, liquidityManagement } = poolConfig.result
      const { disableUnbalancedLiquidity, enableDonation } = liquidityManagement

      const tokenWeights = normalizedWeights
        ? normalizedWeights.map(weight => formatUnits(weight, PERCENTAGE_DECIMALS))
        : undefined

      // Group sorted token details by address (each token has 3 reads: name, symbol, decimals)
      const poolTokenData =
        poolTokenDetails?.reduce<PoolTokenDataObject>((acc, item, index) => {
          const address = tokenContracts[index].address
          const functionName = tokenFunctionNames[index % tokenFunctionNames.length]
          if (!acc[address]) acc[address] = { address }
          acc[address][functionName] = item.result
          return acc
        }, {}) ?? {}

      const poolTokens: PoolCreationToken[] = tokenAddresses.map((address, index) => ({
        address,
        rateProvider: tokenConfigs[index].rateProvider,
        paysYieldFees: tokenConfigs[index].paysYieldFees,
        amount: '',
        weight: tokenWeights ? tokenWeights[index] : undefined,
        data: poolTokenData[address]
          ? ({ ...poolTokenData[address], chain: params.network, chainId } as CustomToken)
          : undefined,
      }))

      const weightSet = new Set(tokenWeights ?? [])
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
          amplificationParameter: formatUnits(amplificationParameter, 3), // SC multiplies by 1e3 precision during creation of pool
        }),
        ...(isWeightedPoolType && { weightedPoolStructure }),
      })

      if (isReClammPoolType && reClammConfig) {
        reClammConfigForm.reset({
          initialMinPrice: formatUnits(reClammConfig.initialMinPrice, 18),
          initialTargetPrice: formatUnits(reClammConfig.initialTargetPrice, 18),
          initialMaxPrice: formatUnits(reClammConfig.initialMaxPrice, 18),
          priceShiftDailyRate: formatUnits(
            reClammConfig.initialDailyPriceShiftExponent,
            PERCENTAGE_DECIMALS
          ),
          centerednessMargin: formatUnits(
            reClammConfig.initialCenterednessMargin,
            PERCENTAGE_DECIMALS
          ),
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
