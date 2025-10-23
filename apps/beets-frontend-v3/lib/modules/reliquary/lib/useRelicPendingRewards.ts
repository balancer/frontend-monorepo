import { useQuery } from '@tanstack/react-query';
import { useReliquary } from '../ReliquaryProvider';

export function useRelicPendingRewards() {
    const { selectedRelic, getPendingRewardsForRelic } = useReliquary();

    return useQuery({
        queryKey: ['relicPendingRewards', selectedRelic?.relicId],
        queryFn: async () => {
            return getPendingRewardsForRelic(selectedRelic?.relicId || '0');
        },
        enabled: !!selectedRelic,
    });
}
