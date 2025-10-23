import { useQuery } from 'react-query';
import { useSlippage } from '~/lib/global/useSlippage';
import { reliquaryZapService } from '~/lib/services/staking/reliquary-zap.service';
import { useUserAccount } from '~/lib/user/useUserAccount';
import { useAllRelicsDepositBalances } from './useAllRelicsDepositBalances';

export function useAllRelicsWithdrawAndHarvestContractCallData() {
    const { userAddress } = useUserAccount();
    const { slippage } = useSlippage();
    const { relics, allRelicsBeetsAmount, allRelicsWftmAmount, alllRelicsBptTotal } = useAllRelicsDepositBalances();

    return useQuery(
        ['useAllRelicsWithdrawAndHarvestContractCallData', userAddress, slippage, relics.map((relic) => relic.relicId)],
        async () => {
            return reliquaryZapService.getReliquaryWithdrawManyAndHarvestContractCallData({
                userAddress: userAddress || '',
                relics,
                slippage,
                totalBptAmount: alllRelicsBptTotal,
                totalWftmAmount: allRelicsWftmAmount,
                totalBeetsAmount: allRelicsBeetsAmount,
            });
        },
        { enabled: !!userAddress },
    );
}
