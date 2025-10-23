import { AmountHumanReadable } from '~/lib/services/token/token-types';
import { useProvider } from 'wagmi';
import { useQuery } from 'react-query';
import { freshBeetsService } from '~/lib/services/staking/fresh-beets.service';
import { useUserAccount } from '~/lib/user/useUserAccount';
import { useNetworkConfig } from '~/lib/global/useNetworkConfig';
import { useUserBalances } from '~/lib/user/useUserBalances';
import { keyBy } from 'lodash';

export function useLegacyFBeetsBalance() {
    const { userAddress } = useUserAccount();
    const provider = useProvider();
    const networkConfig = useNetworkConfig();
    const {
        userBalances: legacyBalances = [],
        isLoading: isLoadingLegacyBalances,
        refetch: refetchLegacyFbeetsBalance,
    } = useUserBalances([networkConfig.fbeets.address]);

    const userBalancesMap = keyBy(legacyBalances, 'address');
    const legacyFbeetsBalance = userBalancesMap[networkConfig.fbeets.address]?.amount || '0';

    const {
        data: stakedBalance = '0',
        isLoading: isLoadingStakedBalance,
        refetch: refetchStakedBalance,
    } = useQuery(
        ['legacyFbeetsBalances', userAddress || ''],
        async (): Promise<AmountHumanReadable> => {
            if (!userAddress) {
                return '0';
            }

            const stakedBalance = freshBeetsService.getUserStakedBalance({
                userAddress,
                farmId: networkConfig.fbeets.farmId,
                provider,
                fBeetsRatio: '1',
            });

            return stakedBalance;
        },
        { enabled: !!networkConfig.fbeets.address },
    );

    return {
        staked: stakedBalance,
        unstaked: legacyFbeetsBalance,
        isLoading: isLoadingStakedBalance || isLoadingLegacyBalances,
        total: parseFloat(stakedBalance || '0') + parseFloat(legacyFbeetsBalance || '0'),
        refetchLegacyFbeetsBalance,
        refetchStakedBalance,
    };
}
