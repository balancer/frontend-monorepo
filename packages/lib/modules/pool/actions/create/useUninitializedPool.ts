import { useMemo } from 'react'
import { Address } from 'viem'
import { erc20Abi } from 'viem'
import { AddressProvider } from '@balancer/sdk'
import { vaultExtensionAbi_V3 } from '@balancer/sdk'
import { useReadContracts, useReadContract } from 'wagmi'
import {
  reClammPoolAbi,
  balancerV3WeightedPoolAbi,
  balancerV3StablePoolAbi,
  gyroEclpPoolAbi,
} from '@repo/lib/modules/web3/contracts/abi/generated'
import { usePoolCreationForm } from './PoolCreationFormProvider'
import { getCreatePathParams } from './getCreatePathParams'
import { useParams } from 'next/navigation'
import { getChainId } from '@repo/lib/config/app.config'
import { isStablePool, isWeightedPool, isReClammPool, isGyroEllipticPool } from './helpers'
import { formatUnits } from 'viem'
import { PERCENTAGE_DECIMALS, WeightedPoolStructure } from './constants'
import { PoolCreationToken } from './types'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { calculatePeakPrice } from './steps/details/gyro.helpers'

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

/**
 *  This hook translates on chain data into pool creation form data
 *  - must fetch data on chain because API does not capture pool until after initialization
 *  - reads to balancer vault always have tokens sorted by address (i.e. token weights, etc.)
 */
export function useUninitializedPool() {
  const { poolAddress } = usePoolCreationForm()
  const { slug } = useParams()
  const params = getCreatePathParams(slug as string[] | undefined)
  const networkParam = params.network
  const poolAddressParam = params.poolAddress
  const poolTypeParam = params.poolType

  const chainId = networkParam ? getChainId(networkParam) : undefined
  const isStablePoolType = poolTypeParam && isStablePool(poolTypeParam)
  const isWeightedPoolType = poolTypeParam && isWeightedPool(poolTypeParam)
  const isReClammPoolType = poolTypeParam && isReClammPool(poolTypeParam)
  const isGyroEclpType = poolTypeParam && isGyroEllipticPool(poolTypeParam)

  const areAllParamsDefined = !!networkParam && !!poolTypeParam && !!poolAddressParam
  // only trigger form hydration if no poolAddress in local storage
  const shouldHydratePoolCreationForm = !poolAddress && areAllParamsDefined

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
    query: { enabled: poolDataReads.length > 0 && shouldHydratePoolCreationForm },
    contracts: poolDataReads,
  }) as { data: PoolDataResponse; isLoading: boolean }

  const [name, symbol, poolTokenInfo, poolConfig, hooksConfig, poolRoleAccounts] = poolData ?? []

  const tokenAddresses = (poolTokenInfo?.result?.[0] ?? []) as Address[]
  const tokenFunctionNames = ['name', 'symbol', 'decimals']

  const tokenContracts = useMemo(() => {
    if (!poolData || !chainId) return []

    if (!tokenAddresses) return []

    return (
      tokenFunctionNames
        .flatMap((functionName: string) =>
          tokenAddresses.map((address: Address) => ({
            address,
            abi: erc20Abi,
            chainId,
            functionName,
          }))
        )
        // IMPORTANT: token contract reads must be sorted by token address!
        .sort((a, b) => a.address.localeCompare(b.address))
    )
  }, [chainId, poolData])

  const { data: poolTokenDetails, isLoading: isLoadingPoolTokenDetails } = useReadContracts({
    query: { enabled: tokenContracts.length > 0 && shouldHydratePoolCreationForm },
    contracts: tokenContracts,
  }) as { data: TokenDataResponse; isLoading: boolean }

  // group contract read results by token address
  const tokenData = useMemo(() => {
    if (!poolTokenDetails || !tokenAddresses || !chainId || !networkParam) return []

    const data = []

    for (let i = 0; i < tokenContracts.length; i += tokenFunctionNames.length) {
      data.push(poolTokenDetails.slice(i, i + tokenFunctionNames.length))
    }

    return data.map((tokenReadResults, index) => {
      return {
        address: tokenAddresses[index],
        name: tokenReadResults[0]?.result as string,
        symbol: tokenReadResults[1]?.result as string,
        decimals: tokenReadResults[2]?.result as number,
        chainId,
        chain: networkParam,
      }
    })
  }, [poolTokenDetails])

  const { data: normalizedWeights, isLoading: isLoadingWeights } = useReadContract({
    address: poolAddressParam,
    abi: balancerV3WeightedPoolAbi,
    functionName: 'getNormalizedWeights',
    chainId,
    query: { enabled: isWeightedPoolType && shouldHydratePoolCreationForm },
  })

  const tokenWeights = normalizedWeights
    ? normalizedWeights.map(weight => formatUnits(weight, PERCENTAGE_DECIMALS))
    : undefined

  const poolTokens: PoolCreationToken[] | undefined = useMemo(() => {
    if (!tokenAddresses || !tokenData) return undefined

    const tokenConfigs = (poolTokenInfo?.result?.[1] ?? []) as {
      rateProvider: Address
      paysYieldFees: boolean
    }[]

    return tokenAddresses.map((address, idx) => ({
      address,
      rateProvider: tokenConfigs[idx].rateProvider,
      paysYieldFees: tokenConfigs[idx].paysYieldFees,
      amount: '',
      weight: tokenWeights ? tokenWeights[idx] : undefined,
      data: tokenData.find(token => token.address.toLowerCase() === address.toLowerCase()),
    }))
  }, [tokenAddresses, poolTokenInfo, normalizedWeights, tokenData])

  const { data: amplificationParameterRes, isLoading: isLoadingAmplificationParameter } =
    useReadContract({
      address: poolAddressParam,
      abi: balancerV3StablePoolAbi,
      functionName: 'getAmplificationParameter',
      chainId,
      query: { enabled: isStablePoolType && shouldHydratePoolCreationForm },
    })

  const poolFormData = useMemo(() => {
    const network = networkParam
    const poolType = poolTypeParam
    const staticSwapFeePercentage = poolConfig?.result?.staticSwapFeePercentage
    const swapFeeManager = poolRoleAccounts?.result?.swapFeeManager
    const pauseManager = poolRoleAccounts?.result?.pauseManager
    const { liquidityManagement } = poolConfig?.result || {}
    const disableUnbalancedLiquidity = liquidityManagement?.disableUnbalancedLiquidity
    const enableDonation = liquidityManagement?.enableDonation
    const poolHooksContract = hooksConfig?.result?.hooksContract

    const weightSet = new Set(tokenWeights ?? [])
    const isFiftyFiftyWeights = weightSet.size === 1 && weightSet.has('50')
    const isEightyTwentyWeights = weightSet.has('80') && weightSet.has('20')
    const weightedPoolStructure = isFiftyFiftyWeights
      ? WeightedPoolStructure.FiftyFifty
      : isEightyTwentyWeights
        ? WeightedPoolStructure.EightyTwenty
        : WeightedPoolStructure.Custom

    const amplificationParameter = amplificationParameterRes
      ? formatUnits(amplificationParameterRes[0], 3) // SC multiplies by 1e3 precision during creation of pool
      : undefined

    const hasRequiredWeightedInfo = !isWeightedPoolType || !!normalizedWeights
    const hasRequiredStableInfo = !isStablePoolType || !!amplificationParameter
    const hasRequiredReClammInfo = !isReClammPoolType || !!reClammConfig

    if (
      !network ||
      !staticSwapFeePercentage ||
      !swapFeeManager ||
      !poolType ||
      !poolTokens ||
      !pauseManager ||
      !name.result ||
      !symbol.result ||
      disableUnbalancedLiquidity === undefined ||
      enableDonation === undefined ||
      !poolHooksContract ||
      !hasRequiredWeightedInfo ||
      !hasRequiredStableInfo ||
      !hasRequiredReClammInfo
    ) {
      return undefined
    }

    return {
      protocol: PROJECT_CONFIG.projectId,
      network,
      poolType,
      name: name.result,
      symbol: symbol.result,
      poolTokens,
      swapFeePercentage: formatUnits(staticSwapFeePercentage, PERCENTAGE_DECIMALS),
      swapFeeManager,
      pauseManager,
      poolHooksContract,
      disableUnbalancedLiquidity,
      enableDonation,
      amplificationParameter,
      weightedPoolStructure,
    }
  }, [networkParam, poolTypeParam, poolData, poolTokenDetails])

  const { data: reClammConfig, isLoading: isLoadingReClammConfig } = useReadContract({
    address: poolAddressParam,
    abi: reClammPoolAbi,
    functionName: 'getReClammPoolImmutableData',
    chainId,
    query: { enabled: isReClammPoolType && shouldHydratePoolCreationForm },
  })

  const reClammFormData = useMemo(() => {
    if (!reClammConfig || !isReClammPoolType) return undefined

    const {
      initialMinPrice,
      initialTargetPrice,
      initialMaxPrice,
      initialDailyPriceShiftExponent,
      initialCenterednessMargin,
    } = reClammConfig

    return {
      initialMinPrice: formatUnits(initialMinPrice, 18),
      initialTargetPrice: formatUnits(initialTargetPrice, 18),
      initialMaxPrice: formatUnits(initialMaxPrice, 18),
      priceShiftDailyRate: formatUnits(initialDailyPriceShiftExponent, PERCENTAGE_DECIMALS),
      centerednessMargin: formatUnits(initialCenterednessMargin, PERCENTAGE_DECIMALS),
    }
  }, [reClammConfig, isReClammPoolType])

  const { data: eclpParams, isLoading: isLoadingEclpParams } = useReadContract({
    address: poolAddressParam,
    abi: gyroEclpPoolAbi,
    functionName: 'getECLPParams',
    chainId,
    query: { enabled: isGyroEclpType && shouldHydratePoolCreationForm },
  })

  const eclpFormData = useMemo(() => {
    if (!eclpParams || !isGyroEclpType) return undefined
    const alpha = formatUnits(eclpParams[0].alpha, 18)
    const beta = formatUnits(eclpParams[0].beta, 18)
    const c = formatUnits(eclpParams[0].c, 18)
    const s = formatUnits(eclpParams[0].s, 18)
    const lambda = formatUnits(eclpParams[0].lambda, 18)

    return {
      alpha,
      beta,
      c,
      s,
      lambda,
      peakPrice: calculatePeakPrice({ c, s }),
    }
  }, [eclpParams, isGyroEclpType])

  const isLoadingPool =
    isLoadingPoolData ||
    isLoadingPoolTokenDetails ||
    isLoadingAmplificationParameter ||
    isLoadingWeights ||
    isLoadingReClammConfig ||
    isLoadingEclpParams

  return {
    poolFormData,
    reClammFormData,
    eclpFormData,
    isLoadingPool,
    shouldHydratePoolCreationForm,
    areAllParamsDefined,
    poolAddressParam,
  }
}
