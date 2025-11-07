import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { TokenType, CreatePoolInput, CreatePoolV3BaseInput, PoolType } from '@balancer/sdk'
import { parseUnits, zeroAddress } from 'viem'
import { PERCENTAGE_DECIMALS } from '../constants'
import { getNetworkConfig, getGqlChain } from '@repo/lib/config/app.config'
import { invertNumber } from '@repo/lib/shared/utils/numbers'

export function useCreatePoolInput(chainId: number): CreatePoolInput {
  const { poolCreationForm, reClammConfigForm, eclpConfigForm } = usePoolCreationForm()
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
  } = poolCreationForm.watch()

  if (!poolTokens[0]?.address || !poolTokens[1]?.address) {
    throw new Error('Pool token address missing for pool creation')
  }

  const areTokensInOrder =
    poolTokens[0]?.address?.toLowerCase() < poolTokens[1]?.address?.toLowerCase()

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

    // must invert params if tokens are not in order
    const minPrice = areTokensInOrder ? initialMinPrice : invertNumber(initialMaxPrice)
    const maxPrice = areTokensInOrder ? initialMaxPrice : invertNumber(initialMinPrice)
    const targetPrice = areTokensInOrder ? initialTargetPrice : invertNumber(initialTargetPrice)

    const priceParams = {
      initialMinPrice: parseUnits(minPrice, 18),
      initialMaxPrice: parseUnits(maxPrice, 18),
      initialTargetPrice: parseUnits(targetPrice, 18),
      // hardcoded prices to not include rate until new reclamm deployments.
      // without rate means boosted must be priced in terms of underlying
      tokenAPriceIncludesRate: false,
      tokenBPriceIncludesRate: false,
    }

    return {
      ...baseInput,
      poolType,
      priceParams,
      priceShiftDailyRate: parseUnits(priceShiftDailyRate, PERCENTAGE_DECIMALS),
      centerednessMargin: parseUnits(centerednessMargin, PERCENTAGE_DECIMALS),
    }
  }

  if (poolType === PoolType.GyroE) {
    const { alpha, beta, s, c, lambda } = eclpConfigForm.watch()

    const eclpParams = {
      // must invert params if tokens are not in order
      alpha: parseUnits(areTokensInOrder ? alpha : invertNumber(beta), 18),
      beta: parseUnits(areTokensInOrder ? beta : invertNumber(alpha), 18),
      s: parseUnits(areTokensInOrder ? s : c, 18),
      c: parseUnits(areTokensInOrder ? c : s, 18),
      lambda: parseUnits(lambda, 18),
    }
    return { ...baseInput, poolType, eclpParams }
  }

  throw new Error('Invalid pool type for useCreatePoolInput')
}
