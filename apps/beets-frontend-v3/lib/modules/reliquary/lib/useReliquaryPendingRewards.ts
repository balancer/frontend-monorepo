import { useQuery } from 'react-query';
import { reliquaryService } from '~/lib/services/staking/reliquary.service';
import { useProvider } from 'wagmi';
import { useUserAccount } from '~/lib/user/useUserAccount';
import { networkConfig } from '~/lib/config/network-config';

export function useReliquaryPendingRewards() {
    const provider = useProvider();
    const { userAddress } = useUserAccount();

    return useQuery(
        ['reliquaryPendingRewards', networkConfig.reliquary.fbeets.farmId, userAddress],
        async () => {
            return reliquaryService.getPendingRewards({
                farmIds: [networkConfig.reliquary.fbeets.farmId.toString()],
                userAddress: userAddress || '',
                provider,
            });
        },
        { enabled: !!userAddress && !!networkConfig.fbeets.address },
    );
}
