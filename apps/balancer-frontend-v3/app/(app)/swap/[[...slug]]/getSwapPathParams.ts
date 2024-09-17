import { PathParams } from '@/lib/modules/swap/SwapProvider'
import { isHash } from 'viem'

export function getSwapPathParams(slug?: string[]): PathParams {
  const [chain, ...rest] = slug ?? []

  if (!rest?.length) return { chain }
  const maybeTxHash = rest[0]
  const urlTxHash = isHash(maybeTxHash) ? maybeTxHash : undefined
  if (urlTxHash) {
    return { chain, urlTxHash }
  }
  const [tokenIn, tokenOut, amountIn, amountOut] = rest ?? []
  return { chain, tokenIn, tokenOut, amountIn, amountOut }
}
