import { BuildSwapInputs, SimulateSwapInputs } from '../swap.types'

const baseKey = 'swap'

function simulateInputKey({
  swapAmount,
  swapType,
  tokenIn,
  tokenOut,
  chain,
  poolIds,
}: SimulateSwapInputs) {
  return `${swapAmount}:${swapType}:${tokenIn}:${tokenOut}:${chain}:${JSON.stringify(poolIds)}`
}

type BuildKeyParams = Pick<
  BuildSwapInputs,
  'account' | 'selectedChain' | 'slippagePercent' | 'simulateResponse'
>
function buildInputKey({
  account,
  selectedChain,
  slippagePercent,
  simulateResponse,
}: BuildKeyParams) {
  return `${account}:${selectedChain}:${slippagePercent}:${JSON.stringify(simulateResponse)}`
}

export const swapQueryKeys = {
  simulation: (inputs: SimulateSwapInputs) =>
    [baseKey, 'simulation', simulateInputKey(inputs)] as const,
  build: (inputs: BuildKeyParams) => [baseKey, 'build', buildInputKey(inputs)] as const,
}
