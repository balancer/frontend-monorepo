import { useLst } from '../LstProvider'
import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'

export function LstStake() {
  const { amountAssets, setAmountAssets, chain, nativeAsset } = useLst()

  return (
    <TokenInput
      address={nativeAsset?.address || ''}
      chain={chain}
      onChange={e => setAmountAssets(e.currentTarget.value)}
      value={amountAssets}
    />
  )
}
