import { TokenInput } from '../../tokens/TokenInput/TokenInput'
import { useLst } from '../LstProvider'

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
