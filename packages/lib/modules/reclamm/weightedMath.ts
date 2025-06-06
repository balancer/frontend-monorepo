export function calculateOutGivenIn(params: {
  balances: number[]
  weights: number[]
  swapAmountIn: number
  tokenInIndex: number
  tokenOutIndex: number
}) {
  if (!params.swapAmountIn) return 0

  if (params.tokenInIndex === params.tokenOutIndex) {
    return 0
  }

  const invariant = calculateInvariant({
    balances: params.balances,
    weights: params.weights,
  })

  const newBalances = [...params.balances]
  newBalances[params.tokenInIndex] = params.balances[params.tokenInIndex] + params.swapAmountIn

  const denominator = newBalances.reduce((acc, balance, index) => {
    if (index === params.tokenOutIndex) {
      return acc
    }
    return acc * Math.pow(balance, params.weights[index])
  }, 1)

  return (
    params.balances[params.tokenOutIndex] -
    Math.pow(invariant / denominator, 1 / params.weights[params.tokenOutIndex])
  )
}

export function calculateInvariant(params: { balances: number[]; weights: number[] }) {
  return params.balances.reduce((acc, balance, index) => {
    return acc * Math.pow(balance, params.weights[index])
  }, 1)
}
