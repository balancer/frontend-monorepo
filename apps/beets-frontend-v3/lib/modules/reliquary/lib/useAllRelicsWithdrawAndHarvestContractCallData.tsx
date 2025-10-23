import { useQuery } from '@tanstack/react-query'
import { useSlippage } from '~/lib/global/useSlippage'
import { reliquaryZapService } from '~/lib/services/staking/reliquary-zap.service'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useAllRelicsDepositBalances } from './useAllRelicsDepositBalances'

export function useAllRelicsWithdrawAndHarvestContractCallData() {
  const { userAddress } = useUserAccount()
  const { slippage } = useSlippage()
  const { relics, allRelicsBeetsAmount, allRelicsWftmAmount, alllRelicsBptTotal } =
    useAllRelicsDepositBalances()

  return useQuery({
    queryKey: [
      'useAllRelicsWithdrawAndHarvestContractCallData',
      userAddress,
      slippage,
      relics.map(relic => relic.relicId),
    ],
    queryFn: async () => {
      return reliquaryZapService.getReliquaryWithdrawManyAndHarvestContractCallData({
        userAddress: userAddress || '',
        relics,
        slippage,
        totalBptAmount: alllRelicsBptTotal,
        totalWftmAmount: allRelicsWftmAmount,
        totalBeetsAmount: allRelicsBeetsAmount,
      })
    },
    enabled: !!userAddress,
  })
}
