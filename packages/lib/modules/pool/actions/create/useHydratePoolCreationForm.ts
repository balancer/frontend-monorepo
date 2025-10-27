import { useEffect } from 'react'
import { usePoolCreationForm } from './PoolCreationFormProvider'
import { formatUnits, Address } from 'viem'
import { PERCENTAGE_DECIMALS } from './constants'
import { usePoolCreationFormSteps } from './usePoolCreationFormSteps'
import { PoolCreationToken } from './types'
import { WeightedPoolStructure } from './constants'
import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { getChainId } from '@repo/lib/config/app.config'
import { getCreatePathParams } from './getCreatePathParams'
import { isStablePool, isWeightedPool, isReClammPool } from './helpers'
import { erc20Abi } from 'viem'
import { AddressProvider } from '@balancer/sdk'
import { vaultExtensionAbi_V3 } from '@balancer/sdk'
import { useReadContracts, useReadContract } from 'wagmi'
import {
  reClammPoolAbi,
  balancerV3WeightedPoolAbi,
  balancerV3StablePoolAbi,
} from '@repo/lib/modules/web3/contracts/abi/generated'
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

/**
 *  Must fetch data on chain because API does not capture pool until after initialization
 *  Reads to balancer vault always have tokens sorted by address (i.e. token weights, etc.)
 */
export function useHydratePoolCreationForm() {
  const { poolCreationForm, setPoolAddress, reClammConfigForm } = usePoolCreationForm()
  const { lastStep } = usePoolCreationFormSteps()

  const { slug } = useParams()
  const params = getCreatePathParams(slug as string[] | undefined)
  const networkParam = params.network
  const poolAddressParam = params.poolAddress
  const poolTypeParam = params.poolType

  const chainId = networkParam ? getChainId(networkParam) : undefined
  const isStablePoolType = poolTypeParam && isStablePool(poolTypeParam)
  const isWeightedPoolType = poolTypeParam && isWeightedPool(poolTypeParam)
  const isReClammPoolType = poolTypeParam && isReClammPool(poolTypeParam)

  const { poolAddress } = usePoolCreationForm()

  const shouldHydratePoolCreationForm =
    !poolAddress && !!poolAddressParam && !!networkParam && !!poolTypeParam

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
    query: { enabled: tokenContracts.length > 0 && shouldHydratePoolCreationForm },
    contracts: tokenContracts,
  }) as { data: TokenDataResponse; isLoading: boolean }

  // Group sorted token details by address (each token has name, symbol, and decimals)
  const poolTokenData =
    poolTokenDetails?.reduce<
      Record<
        Address,
        {
          address: Address
          [key: string]: string | number | undefined
        }
      >
    >((acc, item, index) => {
      const address = tokenContracts[index].address
      const functionName = tokenFunctionNames[index % tokenFunctionNames.length]
      if (!acc[address]) acc[address] = { address }
      acc[address][functionName] = item.result
      return acc
    }, {}) ?? {}

  const { data: amplificationParameterResponse, isLoading: isLoadingAmplificationParameter } =
    useReadContract({
      address: poolAddressParam,
      abi: balancerV3StablePoolAbi,
      functionName: 'getAmplificationParameter',
      chainId,
      query: { enabled: isStablePoolType && shouldHydratePoolCreationForm },
    })

  const { data: normalizedWeights, isLoading: isLoadingWeights } = useReadContract({
    address: poolAddressParam,
    abi: balancerV3WeightedPoolAbi,
    functionName: 'getNormalizedWeights',
    chainId,
    query: { enabled: isWeightedPoolType && shouldHydratePoolCreationForm },
  })

  const { data: reClammConfig, isLoading: isLoadingReClamm } = useReadContract({
    address: poolAddressParam,
    abi: reClammPoolAbi,
    functionName: 'getReClammPoolImmutableData',
    chainId,
    query: { enabled: isReClammPoolType && shouldHydratePoolCreationForm },
  })

  const isLoadingPool =
    isLoadingPoolData ||
    isLoadingPoolTokenDetails ||
    isLoadingAmplificationParameter ||
    isLoadingWeights ||
    isLoadingReClamm

  useEffect(() => {
    const hasRequiredWeightedInfo = !isWeightedPoolType || !!normalizedWeights
    const hasRequiredStableInfo = !isStablePoolType || !!amplificationParameterResponse
    const hasRequiredData =
      !!poolData && !!poolTokenDetails && hasRequiredWeightedInfo && hasRequiredStableInfo

    if (!isLoadingPool && hasRequiredData && shouldHydratePoolCreationForm) {
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
      const amplificationParameter =
        amplificationParameterResponse && amplificationParameterResponse[0]

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
        ...(isStablePoolType &&
          amplificationParameter && {
            amplificationParameter: formatUnits(amplificationParameter, 3), // SC multiplies by 1e3 precision during creation of pool
          }),
        ...(isWeightedPoolType && normalizedWeights && { weightedPoolStructure }),
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
  }, [networkParam, poolTypeParam, poolAddressParam, poolData, poolTokenDetails, isLoadingPool])

  return { isLoadingPool }
}
