import { useLst } from '../LstProvider'
import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
export function LstUnstake() {
  const { amount, setAmount, chain, stakedAsset } = useLst()

  return (
    <TokenInput
      address={stakedAsset?.address || ''}
      chain={chain}
      onChange={e => setAmount(e.currentTarget.value)}
      value={amount}
    />
  )
}
