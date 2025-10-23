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
import { PoolType } from '@balancer/sdk'

export function usePathToInitializePool() {
  const { poolCreationForm, poolAddress, setPoolAddress } = usePoolCreationForm()
  const { name, symbol } = poolCreationForm.watch() // these will be undefined if user did not create the pool
  const { lastStep } = usePoolCreationFormSteps()
  const params = useParams()
  const networkParam = params.network as GqlChain
  const poolAddressParam = params.poolAddress as Address
  const poolTypeParam = params.poolType as SupportedPoolTypes
  const isStablePool = poolTypeParam === PoolType.Stable || poolTypeParam === PoolType.StableSurge
  const isWeightedPool = poolTypeParam === PoolType.Weighted

  const shouldUsePathToInitialize = !name && !symbol && !poolAddress && !!poolAddressParam

  const chainId = params.network ? getChainId(params.network as GqlChain) : undefined

  const poolFunctionNames = ['name', 'symbol']
  const vaultFunctionNames = [
    'getPoolTokenInfo',
    'getPoolConfig',
    'getHooksConfig',
    'getPoolRoleAccounts',
  ]

  const poolDataContracts = useMemo(() => {
    if (!params.poolAddress || !chainId) return []

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
    query: { enabled: poolDataContracts.length > 0 && shouldUsePathToInitialize },
    contracts: poolDataContracts,
  })

  const tokenFunctionNames = ['name', 'symbol', 'decimals']

  const tokenContracts = useMemo(() => {
    if (!poolData) return []

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
    query: {
      enabled: tokenContracts.length > 0,
    },
    contracts: tokenContracts,
  })

  const { data: amplificationParameter } = useReadContract({
    address: poolAddressParam,
    abi: parseAbi(['function getAmplificationParameter() view returns (uint256)']),
    functionName: 'getAmplificationParameter',
    chainId,
    query: { enabled: isStablePool && shouldUsePathToInitialize },
  })

  const { data: normalizedWeights } = useReadContract({
    address: poolAddressParam,
    abi: parseAbi(['function getNormalizedWeights() view returns (uint256[])']),
    functionName: 'getNormalizedWeights',
    chainId,
    query: { enabled: isWeightedPool && shouldUsePathToInitialize },
  })

  const isLoadingPool = isLoadingPoolData || isLoadingPoolTokenDetails

  useEffect(() => {
    const hasRequiredWeightedInfo = !isWeightedPool || !!normalizedWeights
    const hasRequiredStableInfo = !isStablePool || !!amplificationParameter
    const hasRequiredData =
      !!poolData && !!poolTokenDetails && hasRequiredWeightedInfo && hasRequiredStableInfo
    const shouldPopulateFormData = !poolAddress && !!poolAddressParam && !name && !symbol

    console.log('shouldPopulateFormData', shouldPopulateFormData)

    // Update local storage with values read on chain
    if (!isLoadingPool && hasRequiredData && shouldPopulateFormData) {
      const [name, symbol, poolTokenInfo, poolConfig, hooksConfig, poolRoleAccounts] =
        poolData ?? []

      const [tokenAddresses, tokenConfigs] = poolTokenInfo.result as unknown as [
        Address[],
        { rateProvider: Address; paysYieldFees: boolean }[],
      ]

      const { staticSwapFeePercentage, liquidityManagement } = poolConfig.result as unknown as {
        staticSwapFeePercentage: bigint
        liquidityManagement: {
          disableUnbalancedLiquidity: boolean
          enableDonation: boolean
        }
      }

      const poolTokenData =
        poolTokenDetails?.reduce(
          (acc, item, index) => {
            const address = tokenContracts[index].address
            const functionName = tokenFunctionNames[index % tokenFunctionNames.length]
            if (!acc[address]) acc[address] = { address }
            acc[address][functionName] = item.result
            return acc
          },
          {} as Record<Address, any>
        ) ?? {}

      const poolTokens: PoolCreationToken[] = tokenAddresses.map((address, index) => ({
        address,
        rateProvider: tokenConfigs[index].rateProvider,
        paysYieldFees: tokenConfigs[index].paysYieldFees,
        amount: '',
        weight: normalizedWeights
          ? formatUnits(normalizedWeights?.[index] as bigint, PERCENTAGE_DECIMALS)
          : undefined,
        data: { ...poolTokenData[address], chain: params.network, chainId },
      }))

      const { swapFeeManager, pauseManager } = poolRoleAccounts.result as unknown as {
        swapFeeManager: Address
        pauseManager: Address
      }
      const swapFeePercentage = formatUnits(staticSwapFeePercentage, PERCENTAGE_DECIMALS)
      const { disableUnbalancedLiquidity, enableDonation } = liquidityManagement
      const poolHooksContract = (hooksConfig.result as unknown as { hooksContract: Address })
        .hooksContract

      poolCreationForm.setValue('network', networkParam)
      // weightedPoolStructure
      poolCreationForm.setValue('poolType', poolTypeParam)
      poolCreationForm.setValue('poolTokens', poolTokens)
      poolCreationForm.setValue('name', name?.result as string)
      poolCreationForm.setValue('symbol', symbol?.result as string)
      poolCreationForm.setValue('swapFeeManager', swapFeeManager)
      poolCreationForm.setValue('pauseManager', pauseManager)
      poolCreationForm.setValue('swapFeePercentage', swapFeePercentage)
      if (amplificationParameter) {
        poolCreationForm.setValue('amplificationParameter', formatUnits(amplificationParameter, 3)) // SC multiplies by 1e3 precision during creation of pool
      }
      poolCreationForm.setValue('poolHooksContract', poolHooksContract)
      poolCreationForm.setValue('disableUnbalancedLiquidity', disableUnbalancedLiquidity)
      poolCreationForm.setValue('enableDonation', enableDonation)
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
