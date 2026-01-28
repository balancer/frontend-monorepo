import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { TokenType, CreatePoolV3BaseInput, PoolType } from '@balancer/sdk'
import { parseUnits, zeroAddress } from 'viem'
import { PERCENTAGE_DECIMALS, DEFAULT_DECIMALS } from '../constants'
import { getNetworkConfig, getGqlChain } from '@repo/lib/config/app.config'
import { invertNumber } from '@repo/lib/shared/utils/numbers'
import { CreatePoolInput } from '../types'

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
        weight: parseUnits(poolTokens[index].weight, PERCENTAGE_DECIMALS),
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
    } = reClammConfigForm.getValues()

    // must invert params if tokens are not in order
    const minPrice = areTokensInOrder ? initialMinPrice : invertNumber(initialMaxPrice)
    const maxPrice = areTokensInOrder ? initialMaxPrice : invertNumber(initialMinPrice)
    const targetPrice = areTokensInOrder ? initialTargetPrice : invertNumber(initialTargetPrice)

    const priceParams = {
      initialMinPrice: parseUnits(minPrice, DEFAULT_DECIMALS),
      initialMaxPrice: parseUnits(maxPrice, DEFAULT_DECIMALS),
      initialTargetPrice: parseUnits(targetPrice, DEFAULT_DECIMALS),
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
    const { alpha, beta, s, c, lambda } = eclpConfigForm.getValues()

    const eclpParams = {
      // must invert params if tokens are not in order
      alpha: parseUnits(areTokensInOrder ? alpha : invertNumber(beta), DEFAULT_DECIMALS),
      beta: parseUnits(areTokensInOrder ? beta : invertNumber(alpha), DEFAULT_DECIMALS),
      s: parseUnits(areTokensInOrder ? s : c, DEFAULT_DECIMALS),
      c: parseUnits(areTokensInOrder ? c : s, DEFAULT_DECIMALS),
      lambda: parseUnits(lambda, DEFAULT_DECIMALS),
    }
    return { ...baseInput, poolType, eclpParams }
  }

  if (poolType === PoolType.CowAmm) {
    return { name, symbol, poolType, chainId, protocolVersion: 1, poolTokens }
  }

  throw new Error('Invalid pool type for useCreatePoolInput')
}
