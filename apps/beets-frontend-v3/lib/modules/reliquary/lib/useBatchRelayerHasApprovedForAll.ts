import { useNetworkConfig } from '~/lib/global/useNetworkConfig';
import { useMultiCall } from '~/lib/util/useMultiCall';
import ReliquaryAbi from '~/lib/abi/Reliquary.json';
import { useUserAccount } from '~/lib/user/useUserAccount';

export function useBatchRelayerHasApprovedForAll() {
    const networkConfig = useNetworkConfig();
    const { userAddress } = useUserAccount();

    const { data, ...rest } = useMultiCall({
        abi: ReliquaryAbi,
        enabled: true,
        calls: [
            {
                address: networkConfig.reliquary.address,
                functionName: 'isApprovedForAll',
                args: [userAddress, networkConfig.balancer.batchRelayer],
            },
        ],
    });

    return {
        ...rest,
        data: (data ? data[0] : undefined) as boolean | undefined,
    };
}
