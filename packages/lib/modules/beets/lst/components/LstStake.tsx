import { useLst } from '../LstProvider'
import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'

export function LstStake() {
  const { amount, setAmount, chain, nativeAsset } = useLst()

  return (
    <TokenInput
      address={nativeAsset?.address || ''}
      chain={chain}
      onChange={e => setAmount(e.currentTarget.value)}
      value={amount}
    />
  )
}
