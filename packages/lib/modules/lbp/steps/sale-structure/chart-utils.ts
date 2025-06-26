import { LbpPrice } from '@repo/lib/modules/lbp/pool/usePriceInfo'
import { bn } from '@repo/lib/shared/utils/numbers'
import { addHours, isBefore } from 'date-fns'

export function interpolatePrices(
  startWeight: number,
  endWeight: number,
  startDate: Date,
  endDate: Date,
  launchTokenSeed: number,
  collateralTokenSeed: number,
  collateralTokenPrice: number
): LbpPrice[] {
  const startTimestamp = bn(startDate.getTime())
  const endTimestamp = bn(endDate.getTime())
  const slope = bn(endWeight).minus(startWeight).div(endTimestamp.minus(startTimestamp))
  const interpolateLaunchTokenWeight = (timestamp: BigNumber) =>
    bn(startWeight)
      .plus(slope.times(timestamp.minus(startTimestamp)))
      .toNumber()

  const interpolatePrice = (timestamp: BigNumber) => {
    const launchTokenWeight = interpolateLaunchTokenWeight(timestamp)
    const collateralTokenWeight = 100 - launchTokenWeight
    const spotPrice = bn(collateralTokenSeed)
      .div(collateralTokenWeight)
      .div(bn(launchTokenSeed).div(launchTokenWeight))

    return spotPrice.times(collateralTokenPrice).toNumber()
  }

  const data = []

  let currentPoint = startDate
  while (addHours(currentPoint, 1) < endDate) {
    const currentTimestamp = bn(currentPoint.getTime())
    data.push({ timestamp: currentPoint, projectTokenPrice: interpolatePrice(currentTimestamp) })
    currentPoint = addHours(currentPoint, 1)
  }

  data.push({ timestamp: endDate, projectTokenPrice: interpolatePrice(endTimestamp) })

  return data
}

export function range(values: number[]) {
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  }
}

export function dividePrices(
  prices: LbpPrice[],
  cutTime: Date | undefined
): { data: number[][]; dataAfterCutTime: number[][] } {
  const data: number[][] = []
  const dataAfterCutTime: number[][] = []

  prices.forEach(price => {
    if (cutTime && isBefore(price.timestamp, cutTime)) {
      data.push([price.timestamp.getTime(), price.projectTokenPrice])
    } else {
      dataAfterCutTime.push([price.timestamp.getTime(), price.projectTokenPrice])
    }
  })

  if (cutTime && data.length > 0 && dataAfterCutTime.length > 0) {
    const cutTimePrice = (data[data.length - 1][1] + dataAfterCutTime[0][1]) / 2
    data.push([cutTime.getTime(), cutTimePrice])
    dataAfterCutTime.unshift([cutTime.getTime(), cutTimePrice])
  }

  return { data, dataAfterCutTime }
}
