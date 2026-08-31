import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { TokenType, CreatePoolV3BaseInput, PoolType } from '@balancer/sdk'
import { zeroAddress } from 'viem'
import { PERCENTAGE_DECIMALS, DEFAULT_DECIMALS } from '../constants'
import { getNetworkConfig, getGqlChain } from '@repo/lib/config/app.config'
import { invertNumber, parseAmount } from '@repo/lib/shared/utils/numbers'
import { CreatePoolInput } from '../types'
import { calculateRotationComponents } from '../steps/details/gyro.helpers'

export function useCreatePoolInput(chainId: number): CreatePoolInput {
  const { poolCreationForm, autoRangeConfigForm, eclpConfigForm } = usePoolCreationForm()

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
    poolCreator,
  } = poolCreationForm.getValues()

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
    swapFeePercentage: parseAmount(swapFeePercentage, PERCENTAGE_DECIMALS),
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
      poolCreator,
      amplificationParameter: BigInt(amplificationParameter),
    }
  }

  if (poolType === PoolType.Weighted) {
    return {
      ...baseInput,
      poolType,
      poolCreator,
      tokens: baseInput.tokens.map((token, index) => ({
        ...token,
        weight: parseAmount(poolTokens[index]?.weight ?? '50', PERCENTAGE_DECIMALS),
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
    } = autoRangeConfigForm.getValues()

    // must invert params if tokens are not in order
    const minPrice = areTokensInOrder ? initialMinPrice : invertNumber(initialMaxPrice)
    const maxPrice = areTokensInOrder ? initialMaxPrice : invertNumber(initialMinPrice)
    const targetPrice = areTokensInOrder ? initialTargetPrice : invertNumber(initialTargetPrice)

    const priceParams = {
      initialMinPrice: parseAmount(minPrice, DEFAULT_DECIMALS),
      initialMaxPrice: parseAmount(maxPrice, DEFAULT_DECIMALS),
      initialTargetPrice: parseAmount(targetPrice, DEFAULT_DECIMALS),
      // hardcoded prices to not include rate until new AutoRange deployments.
      // without rate means boosted must be priced in terms of underlying
      tokenAPriceIncludesRate: false,
      tokenBPriceIncludesRate: false,
    }

    return {
      ...baseInput,
      poolType,
      priceParams,
      priceShiftDailyRate: parseAmount(priceShiftDailyRate, PERCENTAGE_DECIMALS),
      centerednessMargin: parseAmount(centerednessMargin, PERCENTAGE_DECIMALS),
    }
  }

  if (poolType === PoolType.GyroE) {
    const { alpha, beta, peakPrice, lambda } = eclpConfigForm.getValues()
    const { c, s } = calculateRotationComponents(peakPrice || '')

    // The SDK's normalizeEclpParamsAndTokens handles token sorting and param inversion
    const eclpParams = {
      alpha: parseAmount(alpha, DEFAULT_DECIMALS),
      beta: parseAmount(beta, DEFAULT_DECIMALS),
      s: parseAmount(s, DEFAULT_DECIMALS),
      c: parseAmount(c, DEFAULT_DECIMALS),
      lambda: parseAmount(lambda, DEFAULT_DECIMALS),
    }

    return { ...baseInput, poolType, eclpParams }
  }

  if (poolType === PoolType.CowAmm) {
    return { name, symbol, poolType, chainId, protocolVersion: 1, poolTokens }
  }

  throw new Error('Invalid pool type for useCreatePoolInput')
}
