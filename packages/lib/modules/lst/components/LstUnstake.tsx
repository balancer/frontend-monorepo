import { TokenInput } from '../../tokens/TokenInput/TokenInput'
import fantomNetworkConfig from '@repo/lib/config/networks/fantom'
import { useLst } from '../LstProvider'

export function LstUnstake() {
  const { amount, setAmount, chain } = useLst()

  return (
    <TokenInput
      address={fantomNetworkConfig.tokens.stakedAsset?.address}
      chain={chain}
      onChange={e => setAmount(e.currentTarget.value)}
      value={amount}
    />
  )
}
