import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { TokenType, CreatePoolInput, CreatePoolV3BaseInput, PoolType } from '@balancer/sdk'
import { parseUnits, zeroAddress } from 'viem'
import { PERCENTAGE_DECIMALS } from '../constants'
import { getNetworkConfig, getGqlChain } from '@repo/lib/config/app.config'

export function useCreatePoolInput(chainId: number): CreatePoolInput {
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
    reClammConfigForm,
  } = usePoolCreationForm()

  const chain = getGqlChain(chainId)
  const { tokens } = getNetworkConfig(chain)
  const nativeAsset = tokens.nativeAsset.address
  const wNativeAsset = tokens.addresses.wNativeAsset

  const baseInput: CreatePoolV3BaseInput = {
    chainId,
    protocolVersion: 3 as const,
    name,
    symbol,
    swapFeePercentage: parseUnits(swapFeePercentage, PERCENTAGE_DECIMALS),
    swapFeeManager: swapFeeManager ? swapFeeManager : zeroAddress,
    pauseManager: pauseManager ? pauseManager : zeroAddress,
    enableDonation,
    poolHooksContract: poolHooksContract ? poolHooksContract : zeroAddress,
    disableUnbalancedLiquidity,
    tokens: poolTokens.map(({ address, rateProvider, paysYieldFees }) => {
      const tokenAddress = address === nativeAsset ? wNativeAsset : address
      if (!tokenAddress) throw new Error('token address missing for pool creation')
      return {
        address: tokenAddress,
        tokenType: rateProvider === zeroAddress ? TokenType.STANDARD : TokenType.TOKEN_WITH_RATE,
        rateProvider: rateProvider ? rateProvider : zeroAddress,
        paysYieldFees,
      }
    }),
  }

  if (poolType === PoolType.Stable || poolType === PoolType.StableSurge) {
    return {
      ...baseInput,
      poolType,
      amplificationParameter: BigInt(amplificationParameter),
    }
  }

  if (poolType === PoolType.Weighted) {
    return {
      ...baseInput,
      poolType,
      tokens: baseInput.tokens.map((token, index) => ({
        ...token,
        weight: parseUnits(poolTokens[index].weight!, PERCENTAGE_DECIMALS),
      })),
    }
  }

  if (poolType === PoolType.ReClamm) {
    const {
      initialMinPrice,
      initialMaxPrice,
      initialTargetPrice,
      priceShiftDailyRate,
      centerednessMargin,
    } = reClammConfigForm.watch()

    return {
      ...baseInput,
      poolType,
      priceParams: {
        initialMinPrice: parseUnits(initialMinPrice, 18),
        initialMaxPrice: parseUnits(initialMaxPrice, 18),
        initialTargetPrice: parseUnits(initialTargetPrice, 18),
        // hardcoded prices to not include rate until new reclamm deployments.
        // without rate means boosted must be priced in terms of underlying
        tokenAPriceIncludesRate: false,
        tokenBPriceIncludesRate: false,
      },
      priceShiftDailyRate: parseUnits(priceShiftDailyRate, 16),
      centerednessMargin: parseUnits(centerednessMargin, 16),
    }
  }

  throw new Error('Invalid pool type for useCreatePoolInput')
}
