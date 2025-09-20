import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { bn, invertNumber } from '@repo/lib/shared/utils/numbers'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'

export function useInvertReClammPriceParams() {
  const { usdValueForTokenAddress } = useTokens()
  const { reClammConfigForm, updatePoolTokens, poolTokens, network } = usePoolCreationForm()
  const { initialTargetPrice, initialMinPrice, initialMaxPrice } = reClammConfigForm.watch()

  let targetPrice = bn(initialTargetPrice)

  if (!initialTargetPrice) {
    // handles if user inverts when custom target price selected with no input value
    const priceTokenA = +usdValueForTokenAddress(poolTokens[0]?.address || '', network, '1')
    const priceTokenB = +usdValueForTokenAddress(poolTokens[1]?.address || '', network, '1')
    targetPrice = bn(priceTokenA).div(priceTokenB)
  }

  const invertPriceParams = () => {
    reClammConfigForm.setValue('initialMinPrice', invertNumber(initialMaxPrice))
    reClammConfigForm.setValue('initialMaxPrice', invertNumber(initialMinPrice))
    reClammConfigForm.setValue('initialTargetPrice', invertNumber(targetPrice))
    updatePoolTokens([...poolTokens].reverse())
  }

  return { invertPriceParams }
}
