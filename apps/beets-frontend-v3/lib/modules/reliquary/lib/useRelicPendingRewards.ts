import { useQuery } from 'react-query';
import useReliquary from '~/modules/reliquary/lib/useReliquary';
import { reliquaryService } from '~/lib/services/staking/reliquary.service';
import { useProvider } from 'wagmi';

export function useRelicPendingRewards() {
    const { selectedRelic } = useReliquary();
    const provider = useProvider();

    return useQuery(
        ['relicPendingRewards', selectedRelic?.relicId],
        async () => {
            return reliquaryService.getPendingRewardsForRelic({
                relicId: selectedRelic?.relicId || '0',
                provider,
            });
        },
        { enabled: !!selectedRelic },
    );
}
