import { useNetworkConfig } from '~/lib/global/useNetworkConfig';

import { useQuery } from 'react-query';
import { ReliquaryService } from '~/lib/services/staking/reliquary.service';
import { useRef } from 'react';
import { useProvider } from 'wagmi';

export function useReliquaryDepositImpact(amount: number, relicId?: string) {
    const networkConfig = useNetworkConfig();
    const provider = useProvider();
    const reliquaryService = useRef(
        new ReliquaryService(networkConfig.reliquary.address, networkConfig.chainId, networkConfig.beets.address),
    ).current;
    const depositImpactQuery = useQuery(
        'relicDepositImpact',
        async () => {
            if (Number.isNaN(amount) || !relicId) {
                return;
            }
            return await reliquaryService.getDepositImpact({
                relicId,
                provider,
                amount,
            });
        },
        {
            enabled: !!relicId && !Number.isNaN(amount),
        },
    );

    return depositImpactQuery;
}
