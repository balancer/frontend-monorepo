import { useQuery } from '@tanstack/react-query';
import { useUserAccount } from '~/lib/user/useUserAccount';
import { getNetworkConfig } from '@repo/lib/config/app.config';
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql';
import { useReliquary } from '../ReliquaryProvider';

export function useReliquaryPendingRewards() {
    const { userAddress } = useUserAccount();
    const { getPendingRewards } = useReliquary();
    const networkConfig = getNetworkConfig(GqlChain.Sonic);

    return useQuery({
        queryKey: ['reliquaryPendingRewards', networkConfig.contracts.beets?.reliquary, userAddress],
        queryFn: async () => {
            // Note: farmId would need to be configured in network config
            return getPendingRewards(['0'], userAddress || '');
        },
        enabled: !!userAddress,
    });
}
