import { useLoops } from '../LoopsProvider'
import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'

export function LoopsDeposit() {
  const { amountDeposit, setAmountDeposit, chain, nativeAsset } = useLoops()

  return (
    <TokenInput
      address={nativeAsset?.address}
      chain={chain}
      onChange={e => setAmountDeposit(e.currentTarget.value)}
      value={amountDeposit}
    />
  )
}
