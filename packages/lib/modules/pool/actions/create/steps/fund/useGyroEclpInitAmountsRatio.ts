import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { usePoolSpotPriceWithoutRate } from '../details/usePoolSpotPriceWithoutRate'
import { isGyroEllipticPool } from '../../helpers'
import { useWatch } from 'react-hook-form'

export function useGyroEclpInitAmountsRatio() {
  const { spotPriceWithoutRate, rateTokenA, rateTokenB, isRateLoading } =
    usePoolSpotPriceWithoutRate()
  const { eclpConfigForm, poolCreationForm } = usePoolCreationForm()
  const [poolType] = useWatch({ control: poolCreationForm.control, name: ['poolType'] })
  const eclpParams = useWatch({ control: eclpConfigForm.control })

  const alpha = Number(eclpParams.alpha)
  const beta = Number(eclpParams.beta)
  const c = Number(eclpParams.c)
  const s = Number(eclpParams.s)
  const lambda = Number(eclpParams.lambda)
  const rateA = Number(rateTokenA)
  const rateB = Number(rateTokenB)

  const isValidEclpParams = !!(alpha && beta && c && s && lambda)

  const hasRequiredData =
    isGyroEllipticPool(poolType) &&
    isValidEclpParams &&
    !isRateLoading &&
    !!rateA &&
    !!rateB &&
    !!spotPriceWithoutRate

  if (!hasRequiredData) return undefined

  const rHint = 1000
  const tauAlpha = getTau(alpha, c, s, lambda)
  const tauBeta = getTau(beta, c, s, lambda)
  const tauSpotPrice = getTau(spotPriceWithoutRate.toNumber(), c, s, lambda)

  const amountTokenA =
    rateA *
    rHint *
    (c * lambda * tauBeta[0] +
      s * tauBeta[1] -
      (c * lambda * tauSpotPrice[0] + s * tauSpotPrice[1]))

  const amountTokenB =
    rateB *
    rHint *
    (-s * lambda * tauAlpha[0] +
      c * tauAlpha[1] -
      (-s * lambda * tauSpotPrice[0] + c * tauSpotPrice[1]))

  return amountTokenA / amountTokenB // the ratio for calculating token init amounts
}

function getTau(price: number, c: number, s: number, lambda: number) {
  const dSq = c * c + s * s
  const d = Math.sqrt(dSq)
  const dPrice =
    1 /
    Math.sqrt(
      Math.pow(c / d + (price * s) / d, 2) / (lambda * lambda) +
        Math.pow((price * c) / d - s / d, 2)
    )
  return [(price * c - s) * dPrice, ((c + s * price) * dPrice) / lambda]
}
