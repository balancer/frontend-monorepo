import { useQuery } from 'react-query';
import { reliquaryZapService } from '~/lib/services/staking/reliquary-zap.service';
import { useUserAccount } from '~/lib/user/useUserAccount';
import { useSlippage } from '~/lib/global/useSlippage';
import { useBalances } from '~/lib/util/useBalances';
import { useNetworkConfig } from '~/lib/global/useNetworkConfig';

export function useReliquaryFbeetsMigrateContractCallData(relicId: number | undefined, enabled: boolean) {
    const { userAddress } = useUserAccount();
    const { slippage } = useSlippage();
    const networkConfig = useNetworkConfig();
    const { data: balances } = useBalances(userAddress || null, [
        { symbol: 'fBEETS', address: networkConfig.fbeets.address, name: 'fBEETS', decimals: 18 },
    ]);
    const fbeetsBalance = balances.find((balance) => balance.address === networkConfig.fbeets.address)?.amount || '0';

    const query = useQuery(
        ['reliquaryFbeetsMigrateContractCallData', userAddress, balances, slippage, relicId],
        async () => {
            return reliquaryZapService.getFbeetsMigrateContractCallData({
                userAddress: userAddress || '',
                fbeetsAmount: fbeetsBalance,
                slippage,
                relicId: relicId !== -1 ? relicId : undefined,
            });
        },
        { enabled: enabled && !!userAddress },
    );

    return {
        ...query,
        fbeetsBalance,
    };
}
