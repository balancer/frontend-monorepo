import { useLoops } from '../LoopsProvider'
import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'

export function LoopsDeposit() {
  const { amountAssets, setAmountAssets, chain, nativeAsset } = useLoops()

  return (
    <TokenInput
      address={nativeAsset?.address}
      chain={chain}
      onChange={e => setAmountAssets(e.currentTarget.value)}
      value={amountAssets}
    />
  )
}
