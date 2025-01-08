import { useLst } from '../LstProvider'
import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'

export function LstUnstake() {
  const { amountShares, setAmountShares, chain, stakedAsset } = useLst()

  return (
    <TokenInput
      address={stakedAsset?.address || ''}
      chain={chain}
      onChange={e => setAmountShares(e.currentTarget.value)}
      value={amountShares}
    />
  )
}
