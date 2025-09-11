import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { TokenType, CreatePoolInput } from '@balancer/sdk'
import { validatePoolType } from '../validatePoolCreationForm'
import { parseUnits, zeroAddress } from 'viem'
import { PERCENTAGE_DECIMALS } from '../constants'
import { getNetworkConfig, getGqlChain } from '@repo/lib/config/app.config'

export function useCreatePoolInput(chainId: number) {
  const {
    poolType,
    symbol,
    name,
    swapFeePercentage,
    swapFeeManager,
    poolHooksContract,
    enableDonation,
    disableUnbalancedLiquidity,
    poolTokens,
    pauseManager,
    amplificationParameter,
  } = usePoolCreationForm()

  const isWeightedPool = validatePoolType.isWeightedPool(poolType)
  const isStablePool = validatePoolType.isStablePool(poolType)

  const chain = getGqlChain(chainId)
  const { tokens } = getNetworkConfig(chain)
  const nativeAsset = tokens.nativeAsset.address
  const wNativeAsset = tokens.addresses.wNativeAsset

  const createPoolInput = {
    chainId,
    protocolVersion: 3 as const,
    poolType,
    name,
    symbol,
    swapFeePercentage: parseUnits(swapFeePercentage, PERCENTAGE_DECIMALS),
    swapFeeManager,
    pauseManager,
    enableDonation,
    poolHooksContract,
    disableUnbalancedLiquidity,
    ...(isStablePool && { amplificationParameter: BigInt(amplificationParameter) }),
    tokens: poolTokens.map(({ address, rateProvider, weight, paysYieldFees }) => {
      return {
        address: address === nativeAsset ? wNativeAsset : address,
        tokenType: rateProvider === zeroAddress ? TokenType.STANDARD : TokenType.TOKEN_WITH_RATE,
        rateProvider,
        paysYieldFees,
        ...(isWeightedPool && weight ? { weight: parseUnits(weight, PERCENTAGE_DECIMALS) } : {}),
      }
    }),
  } as CreatePoolInput // TODO: solve type complaint for inputs allowing empty strings ""

  return createPoolInput
}
