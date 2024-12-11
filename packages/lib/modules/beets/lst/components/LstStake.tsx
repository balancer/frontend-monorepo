import fantomNetworkConfig from '@repo/lib/config/networks/fantom'
import { useLst } from '../LstProvider'
import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'

export function LstStake() {
  const { amount, setAmount, chain } = useLst()

  return (
    <TokenInput
      address={fantomNetworkConfig.tokens.nativeAsset.address}
      chain={chain}
      onChange={e => setAmount(e.currentTarget.value)}
      value={amount}
    />
  )
}
