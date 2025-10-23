import { useNetworkConfig } from '~/lib/global/useNetworkConfig';
import { useQuery } from '@tanstack/react-query';
import { snapshotService } from '~/lib/services/util/snapshot.service';
import { useUserAccount } from '~/lib/user/useUserAccount';
import { Address, useProvider } from 'wagmi';

export function useDelegation() {
    const { userAddress } = useUserAccount();
    const provider = useProvider();
    const networkConfig = useNetworkConfig();

    return useQuery({
        queryKey: ['getDelegation', userAddress],
        queryFn: async (): Promise<boolean> => {
            const delegationAddress = await snapshotService.getDelegation({
                userAddress: userAddress as Address,
                provider,
                id: networkConfig.snapshot.id,
            });
            return delegationAddress === networkConfig.snapshot.delegateAddress;
        },
        enabled: !!userAddress,
    });
}
