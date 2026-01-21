import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { formatUnits } from 'viem'
import { useWatch } from 'react-hook-form'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export type SelectedPoolToken = {
  address: string
  symbol: string
  chain: GqlChain
  userBalanceUsd: string
  userBalanceHuman: string
  hasZeroBalance: boolean
}

export function usePoolTokensInWallet() {
  const { poolCreationForm } = usePoolCreationForm()
  const poolTokens = useWatch({ control: poolCreationForm.control, name: 'poolTokens' })
  const { usdValueForTokenAddress } = useTokens()
  const { balanceFor } = useTokenBalances()

  const selectedPoolTokens = poolTokens
    .map(token => {
      const { data, address } = token
      if (!data || !address) return null

      const userBalanceRaw = balanceFor(address)
      const { decimals, chain, symbol } = data

      const userBalanceHuman = userBalanceRaw ? formatUnits(userBalanceRaw.amount, decimals) : '0'
      const userBalanceUsd = usdValueForTokenAddress(
        address,
        chain,
        userBalanceHuman,
        token.usdPrice
      )

      const hasZeroBalance = !userBalanceRaw || userBalanceRaw.amount === 0n

      return {
        address: address as string,
        symbol,
        chain,
        userBalanceUsd,
        userBalanceHuman,
        hasZeroBalance,
      } as SelectedPoolToken
    })
    .filter((token): token is SelectedPoolToken => token !== null)

  const hasMultipleTokensSelected = selectedPoolTokens.length >= 2
  const tokensWithBalance = selectedPoolTokens.filter(token => !token.hasZeroBalance)
  const hasNoTokensWithBalance = hasMultipleTokensSelected && tokensWithBalance.length === 0

  return {
    selectedPoolTokens,
    hasNoTokensWithBalance,
    tokensWithBalance,
  }
}
