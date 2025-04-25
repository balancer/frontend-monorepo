import * as WeightedMath from './weightedMath'

const timeFix = 12464900 // Using the same constant as the Contract. The full value is 12464935.015039.

export function calculatePoolCenteredness(params: {
  balanceA: number
  balanceB: number
  virtualBalanceA: number
  virtualBalanceB: number
}) {
  if (params.balanceA === 0 || params.balanceB === 0) return 0
  if (isAboveCenter(params)) {
    return (params.balanceB * params.virtualBalanceA) / (params.balanceA * params.virtualBalanceB)
  }
  return (params.balanceA * params.virtualBalanceB) / (params.balanceB * params.virtualBalanceA)
}

export function isAboveCenter(params: {
  balanceA: number
  balanceB: number
  virtualBalanceA: number
  virtualBalanceB: number
}) {
  if (params.balanceB === 0) return true
  return params.balanceA / params.balanceB > params.virtualBalanceA / params.virtualBalanceB
}

export function calculateLowerMargin(params: {
  margin: number
  invariant: number
  virtualBalanceA: number
  virtualBalanceB: number
}) {
  const marginPercentage = params.margin / 100
  const b = params.virtualBalanceA + marginPercentage * params.virtualBalanceA
  const c =
    marginPercentage *
    (Math.pow(params.virtualBalanceA, 2) -
      (params.invariant * params.virtualBalanceA) / params.virtualBalanceB)
  return params.virtualBalanceA + (-b + Math.sqrt(Math.pow(b, 2) - 4 * c)) / 2
}

export function calculateUpperMargin(params: {
  margin: number
  invariant: number
  virtualBalanceA: number
  virtualBalanceB: number
}) {
  const marginPercentage = params.margin / 100
  const b = (params.virtualBalanceA + marginPercentage * params.virtualBalanceA) / marginPercentage
  const c =
    (Math.pow(params.virtualBalanceA, 2) -
      (params.virtualBalanceA * params.invariant) / params.virtualBalanceB) /
    marginPercentage

  return params.virtualBalanceA + (-b + Math.sqrt(Math.pow(b, 2) - 4 * c)) / 2
}

export function calculateOutGivenIn(params: {
  swapAmountIn: number
  swapTokenIn: string
  balanceA: number
  balanceB: number
  virtualBalanceA: number
  virtualBalanceB: number
}) {
  if (!params.swapAmountIn) return 0

  const balances = [
    params.balanceA + params.virtualBalanceA,
    params.balanceB + params.virtualBalanceB,
  ]

  if (params.swapTokenIn === 'Token A') {
    return WeightedMath.calculateOutGivenIn({
      balances: balances,
      weights: [0.5, 0.5],
      swapAmountIn: params.swapAmountIn,
      tokenInIndex: 0,
      tokenOutIndex: 1,
    })
  } else {
    return WeightedMath.calculateOutGivenIn({
      balances: balances,
      weights: [0.5, 0.5],
      swapAmountIn: params.swapAmountIn,
      tokenInIndex: 1,
      tokenOutIndex: 0,
    })
  }
}

export function calculateBalancesAfterSwapIn(params: {
  swapAmountIn: number
  swapTokenIn: string
  balanceA: number
  balanceB: number
  virtualBalanceA: number
  virtualBalanceB: number
}) {
  const invariant = calculateInvariant({
    balanceA: params.balanceA,
    balanceB: params.balanceB,
    virtualBalanceA: params.virtualBalanceA,
    virtualBalanceB: params.virtualBalanceB,
  })

  const amountIn = Number(params.swapAmountIn)
  const amountOut = calculateOutGivenIn({
    balanceA: params.balanceA,
    balanceB: params.balanceB,
    virtualBalanceA: params.virtualBalanceA,
    virtualBalanceB: params.virtualBalanceB,
    swapAmountIn: amountIn,
    swapTokenIn: params.swapTokenIn,
  })

  let newBalanceA: number
  let newBalanceB: number
  if (params.swapTokenIn === 'Token A') {
    newBalanceA = params.balanceA + amountIn
    newBalanceB = params.balanceB - amountOut

    if (newBalanceB < 0) {
      newBalanceB = 0
      newBalanceA = invariant / params.virtualBalanceB - params.virtualBalanceA
    }
  } else {
    newBalanceA = params.balanceA - amountOut
    newBalanceB = params.balanceB + amountIn

    if (newBalanceA < 0) {
      newBalanceA = 0
      newBalanceB = invariant / params.virtualBalanceA - params.virtualBalanceB
    }
  }

  return { newBalanceA, newBalanceB }
}

export function calculateInvariant(params: {
  balanceA: number
  balanceB: number
  virtualBalanceA: number
  virtualBalanceB: number
}) {
  return (params.balanceA + params.virtualBalanceA) * (params.balanceB + params.virtualBalanceB)
}

export const recalculateVirtualBalances = (params: {
  balanceA: number
  balanceB: number
  oldVirtualBalanceA: number
  oldVirtualBalanceB: number
  currentPriceRatio: number
  poolParams: {
    margin: number
    priceShiftDailyRate: number
  }
  updateQ0Params: {
    startTime: number
    endTime: number
    startPriceRatio: number
    targetPriceRatio: number
  }
  simulationParams: {
    simulationSeconds: number
    simulationSecondsPerBlock: number
    secondsSinceLastInteraction: number
  }
}): {
  newVirtualBalances: {
    virtualBalanceA: number
    virtualBalanceB: number
  }
  newPriceRatio: number
} => {
  const fixedSecondsSinceLastInteraction =
    params.simulationParams.secondsSinceLastInteraction -
    (params.simulationParams.secondsSinceLastInteraction %
      params.simulationParams.simulationSecondsPerBlock)

  if (fixedSecondsSinceLastInteraction <= 0.01) {
    return {
      newVirtualBalances: {
        virtualBalanceA: params.oldVirtualBalanceA,
        virtualBalanceB: params.oldVirtualBalanceB,
      },
      newPriceRatio: params.currentPriceRatio,
    }
  }

  const poolCenteredness = calculatePoolCenteredness({
    balanceA: params.balanceA,
    balanceB: params.balanceB,
    virtualBalanceA: params.oldVirtualBalanceA,
    virtualBalanceB: params.oldVirtualBalanceB,
  })

  let newVirtualBalanceA = params.oldVirtualBalanceA
  let newVirtualBalanceB = params.oldVirtualBalanceB
  let newPriceRatio = params.currentPriceRatio

  const isPoolAboveCenter = isAboveCenter({
    balanceA: params.balanceA,
    balanceB: params.balanceB,
    virtualBalanceA: params.oldVirtualBalanceA,
    virtualBalanceB: params.oldVirtualBalanceB,
  })

  const isPriceRatioUpdating =
    params.simulationParams.simulationSeconds >= params.updateQ0Params.startTime &&
    (params.simulationParams.simulationSeconds <= params.updateQ0Params.endTime ||
      params.simulationParams.simulationSeconds - fixedSecondsSinceLastInteraction <=
        params.updateQ0Params.endTime)

  // Price ratio update logic
  if (isPriceRatioUpdating) {
    // Q0 is updating.
    newPriceRatio =
      params.updateQ0Params.startPriceRatio *
      Math.pow(
        params.updateQ0Params.targetPriceRatio / params.updateQ0Params.startPriceRatio,
        Math.min(
          params.updateQ0Params.endTime - params.updateQ0Params.startTime,
          params.simulationParams.simulationSeconds - params.updateQ0Params.startTime
        ) /
          (params.updateQ0Params.endTime - params.updateQ0Params.startTime)
      )

    if (isPoolAboveCenter) {
      const a = Math.sqrt(newPriceRatio) - 1
      const b = -params.balanceA * (1 + poolCenteredness)
      const c = -params.balanceA * params.balanceA * poolCenteredness

      newVirtualBalanceA = (-b + Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / (2 * a)
      newVirtualBalanceB =
        (params.balanceB * newVirtualBalanceA) / (params.balanceA * poolCenteredness)
    } else {
      const a = Math.sqrt(newPriceRatio) - 1
      const b = -params.balanceB * (1 + poolCenteredness)
      const c = -params.balanceB * params.balanceB * poolCenteredness

      newVirtualBalanceB = (-b + Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / (2 * a)
      newVirtualBalanceA =
        (params.balanceA * newVirtualBalanceB) / (params.balanceB * poolCenteredness)
    }
  }

  if (poolCenteredness <= params.poolParams.margin / 100) {
    const tau = params.poolParams.priceShiftDailyRate / timeFix

    if (isPoolAboveCenter) {
      newVirtualBalanceB = newVirtualBalanceB * Math.pow(1 - tau, fixedSecondsSinceLastInteraction)
      newVirtualBalanceA =
        (params.balanceA * (newVirtualBalanceB + params.balanceB)) /
        (newVirtualBalanceB * (Math.sqrt(newPriceRatio) - 1) - params.balanceB)
    } else {
      newVirtualBalanceA = newVirtualBalanceA * Math.pow(1 - tau, fixedSecondsSinceLastInteraction)
      newVirtualBalanceB =
        (params.balanceB * (newVirtualBalanceA + params.balanceA)) /
        (newVirtualBalanceA * (Math.sqrt(newPriceRatio) - 1) - params.balanceA)
    }
  }

  return {
    newVirtualBalances: {
      virtualBalanceA: newVirtualBalanceA,
      virtualBalanceB: newVirtualBalanceB,
    },
    newPriceRatio: newPriceRatio,
  }
}
