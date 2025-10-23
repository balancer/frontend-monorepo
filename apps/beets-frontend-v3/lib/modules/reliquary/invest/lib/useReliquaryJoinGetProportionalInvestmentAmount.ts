import { useQuery } from '@tanstack/react-query'
import { sumBy } from 'lodash'
import { isEth, replaceWethWithEth } from '~/lib/services/token/token-util'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useReliquaryInvest } from './useReliquaryInvest'

export function useReliquaryJoinGetProportionalInvestmentAmount() {
  const { poolService } = usePool()
  const { userInvestTokenBalances } = useReliquaryInvest()
  const { userAddress } = useUserAccount()
  const { priceForAmount } = useGetTokens()

  const query = useQuery({
    queryKey: ['joinGetProportionalInvestmentAmount', userInvestTokenBalances, userAddress],
    queryFn: async () => {
      const hasEth = !!userInvestTokenBalances.find(token => isEth(token.address))

      if (!poolService.joinGetMaxProportionalForUserBalances) {
        return {}
      }

      const result =
        await poolService.joinGetMaxProportionalForUserBalances(userInvestTokenBalances)

      return {
        tokenProportionalAmounts: Object.fromEntries(
          result.map(item => [
            hasEth ? replaceWethWithEth(item.address) : item.address,
            item.amount,
          ])
        ),
        totalValueProportionalAmounts: sumBy(result, priceForAmount),
      }
    },
    enabled: true,
    gcTime: 0,
  })

  return {
    ...query,
    tokenProportionalAmounts: query.data?.tokenProportionalAmounts,
    totalValueProportionalAmounts: query.data?.totalValueProportionalAmounts,
  }
}
