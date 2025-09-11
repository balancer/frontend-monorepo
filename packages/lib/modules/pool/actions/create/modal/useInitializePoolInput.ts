import {
  type InputAmountWithSymbol,
  type ExtendedInitPoolInputV3,
} from '@repo/lib/modules/pool/actions/create/types'
import { parseUnits } from 'viem'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { getNetworkConfig, getGqlChain } from '@repo/lib/config/app.config'

export function useInitializePoolInput(chainId: number): ExtendedInitPoolInputV3 {
  const { poolTokens } = usePoolCreationForm()

  const chain = getGqlChain(chainId)
  const { tokens } = getNetworkConfig(chain)
  const nativeAsset = tokens.nativeAsset.address
  const wNativeAsset = tokens.addresses.wNativeAsset

  const amountsIn: InputAmountWithSymbol[] = poolTokens.map(token => {
    const address = token.address
    const decimals = token.data?.decimals
    const symbol = token.data?.symbol
    if (!address) throw new Error('token address missing for amountsIn of pool creation')
    if (!decimals) throw new Error('token decimals missing for amountsIn of pool creation')
    if (!symbol) throw new Error('token symbol missing for amountsIn of pool creation')
    const rawAmount = parseUnits(token.amount, decimals)
    return {
      address: address === nativeAsset ? wNativeAsset : address,
      decimals,
      rawAmount,
      symbol,
    }
  })

  const wethIsEth = poolTokens.some(token => token.address === nativeAsset)

  return {
    minBptAmountOut: 0n,
    chainId,
    amountsIn,
    wethIsEth,
  }
}
