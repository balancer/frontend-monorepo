import { useNetworkConfig } from '~/lib/global/useNetworkConfig';
import { useMultiCall } from '~/lib/util/useMultiCall';
import ReliquaryAbi from '~/lib/abi/Reliquary.json';
import { isSameAddress } from '@balancer-labs/sdk';

export function useBatchRelayerHasRelicApproval(relicId?: number) {
    const networkConfig = useNetworkConfig();

    const { data, ...rest } = useMultiCall({
        abi: ReliquaryAbi,
        enabled: typeof relicId === 'number',
        calls: [
            {
                address: networkConfig.reliquary.address,
                functionName: 'getApproved',
                args: [relicId],
            },
        ],
    });

    return {
        ...rest,
        data: (data ? isSameAddress(data[0] as string, networkConfig.balancer.batchRelayer) : undefined) as
            | boolean
            | undefined,
    };
}
