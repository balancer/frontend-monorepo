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

const POOL_FUNCTION_NAMES = ['name', 'symbol'] as const
const TOKEN_FUNCTION_NAMES = ['name', 'symbol', 'decimals'] as const
const TOKEN_READS_PER_TOKEN = TOKEN_FUNCTION_NAMES.length

const VAULT_FUNCTION_NAMES = [
  'getPoolTokenInfo',
  'getPoolConfig',
  'getHooksConfig',
  'getPoolRoleAccounts',
] as const

type PoolTokenInfo = [Address[], { rateProvider: Address; paysYieldFees: boolean }[]]
type HooksConfig = { hooksContract: Address }
type PoolRoleAccounts = { swapFeeManager: Address; pauseManager: Address }
type ReadContractResponse<T> = { result: T | undefined; status: 'success' | 'failure' }
type TokenDataResponse = ReadContractResponse<string | number>[]

type PoolConfig = {
  staticSwapFeePercentage: bigint
  liquidityManagement: { disableUnbalancedLiquidity: boolean; enableDonation: boolean }
}

type PoolDataResponse = [
  ReadContractResponse<string>,
  ReadContractResponse<string>,
  ReadContractResponse<PoolTokenInfo>,
  ReadContractResponse<PoolConfig>,
  ReadContractResponse<HooksConfig>,
  ReadContractResponse<PoolRoleAccounts>,
]

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

  const poolDataReads = useMemo(() => {
    if (!poolAddressParam || !chainId) return []

    const poolContractReads = POOL_FUNCTION_NAMES.map(functionName => ({
      address: poolAddressParam,
      abi: erc20Abi,
      chainId,
      functionName,
    }))

    const vaultContractReads = VAULT_FUNCTION_NAMES.map(functionName => ({
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

  const tokenAddresses = useMemo(() => {
    const addresses = (poolTokenInfo?.result?.[0] ?? []) as Address[]
    return addresses ? [...addresses] : []
  }, [poolTokenInfo])

  const tokenConfigs = useMemo(
    () =>
      (
        (poolTokenInfo?.result?.[1] ?? []) as {
          rateProvider: Address
          paysYieldFees: boolean
        }[]
      ).map(config => ({ ...config })),
    [poolTokenInfo]
  )

  const tokenContracts = useMemo(() => {
    if (!chainId || tokenAddresses.length === 0) return []

    const contracts = TOKEN_FUNCTION_NAMES.flatMap(functionName =>
      tokenAddresses.map(address => ({
        address,
        abi: erc20Abi,
        chainId,
        functionName,
      }))
    )

    // IMPORTANT: token contract reads must be sorted by token address!
    return contracts.sort((a, b) => a.address.localeCompare(b.address))
  }, [chainId, tokenAddresses])

  const { data: poolTokenDetails, isLoading: isLoadingPoolTokenDetails } = useReadContracts({
    query: { enabled: tokenContracts.length > 0 && shouldHydratePoolCreationForm },
    contracts: tokenContracts,
  }) as { data: TokenDataResponse; isLoading: boolean }

  // group contract read results by token address
  const tokenData = useMemo(() => {
    if (!poolTokenDetails || tokenAddresses.length === 0 || !chainId || !networkParam) return []

    const groupedReads: TokenDataResponse[] = []

    for (let i = 0; i < poolTokenDetails.length; i += TOKEN_READS_PER_TOKEN) {
      groupedReads.push(poolTokenDetails.slice(i, i + TOKEN_READS_PER_TOKEN))
    }

    return groupedReads.flatMap((tokenReadResults, index) => {
      const address = tokenAddresses[index]
      if (!address) return []

      return [
        {
          address,
          name: tokenReadResults[0]?.result as string,
          symbol: tokenReadResults[1]?.result as string,
          decimals: tokenReadResults[2]?.result as number,
          chainId,
          chain: networkParam,
        },
      ]
    })
  }, [poolTokenDetails, tokenAddresses, chainId, networkParam])

  const { data: normalizedWeights, isLoading: isLoadingWeights } = useReadContract({
    address: poolAddressParam,
    abi: balancerV3WeightedPoolAbi,
    functionName: 'getNormalizedWeights',
    chainId,
    query: { enabled: isWeightedPoolType && shouldHydratePoolCreationForm },
  })

  const tokenWeights = useMemo(() => {
    if (!normalizedWeights) return undefined

    return normalizedWeights.map(weight => formatUnits(weight, PERCENTAGE_DECIMALS))
  }, [normalizedWeights])

  const poolTokens: PoolCreationToken[] | undefined = useMemo(() => {
    if (
      tokenAddresses.length === 0 ||
      tokenConfigs.length !== tokenAddresses.length ||
      tokenData.length < tokenAddresses.length
    ) {
      return undefined
    }

    const tokens: PoolCreationToken[] = []

    for (let idx = 0; idx < tokenAddresses.length; idx += 1) {
      const address = tokenAddresses[idx]
      const config = tokenConfigs[idx]
      const data = tokenData.find(token => token.address.toLowerCase() === address.toLowerCase())

      if (!config || !data) {
        return undefined
      }

      tokens.push({
        address,
        rateProvider: config.rateProvider,
        paysYieldFees: config.paysYieldFees,
        amount: '',
        weight: tokenWeights ? tokenWeights[idx] : undefined,
        data,
      })
    }

    return tokens
  }, [tokenAddresses, tokenConfigs, tokenData, tokenWeights])

  const { data: amplificationParameterRes, isLoading: isLoadingAmplificationParameter } =
    useReadContract({
      address: poolAddressParam,
      abi: balancerV3StablePoolAbi,
      functionName: 'getAmplificationParameter',
      chainId,
      query: { enabled: isStablePoolType && shouldHydratePoolCreationForm },
    })

  const { data: reClammConfig, isLoading: isLoadingReClammConfig } = useReadContract({
    address: poolAddressParam,
    abi: reClammPoolAbi,
    functionName: 'getReClammPoolImmutableData',
    chainId,
    query: { enabled: isReClammPoolType && shouldHydratePoolCreationForm },
  })

  const poolFormData = (() => {
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
      !name?.result ||
      !symbol?.result ||
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
  })()

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
