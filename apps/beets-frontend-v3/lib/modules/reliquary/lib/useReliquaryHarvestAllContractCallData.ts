import { useQuery } from '@tanstack/react-query';
import { reliquaryZapService } from '~/lib/services/staking/reliquary-zap.service';
import { useUserAccount } from '~/lib/user/useUserAccount';

export function useReliquaryHarvestAllContractCallData(relicIds: number[]) {
    const { userAddress } = useUserAccount();

    return useQuery({
        queryKey: ['reliquaryHarvestAllContractCallData', relicIds, userAddress],
        queryFn: async () => {
            return reliquaryZapService.getReliquaryHarvestAllContractCallData({
                relicIds,
                recipient: userAddress || '',
            });
        },
        enabled: !!userAddress && relicIds.length !== 0,
    });
}
