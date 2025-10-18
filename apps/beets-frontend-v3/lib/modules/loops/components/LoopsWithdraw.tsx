import { useLoops } from '../LoopsProvider'
import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'

export function LoopsWithdraw() {
  const { amountShares, setAmountShares, chain, loopedAsset } = useLoops()

  return (
    <TokenInput
      address={loopedAsset?.address}
      chain={chain}
      onChange={e => setAmountShares(e.currentTarget.value)}
      value={amountShares}
    />
  )
}
