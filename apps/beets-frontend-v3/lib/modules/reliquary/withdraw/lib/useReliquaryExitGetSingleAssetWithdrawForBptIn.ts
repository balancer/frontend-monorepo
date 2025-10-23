import { useReactiveVar } from '@apollo/client';
import { withdrawStateVar } from '~/modules/reliquary/withdraw/lib/useReliquaryWithdrawState';
import { useQuery } from '@tanstack/react-query';
import { usePoolUserBptBalance } from '~/modules/pool/lib/usePoolUserBptBalance';
import { usePool } from '@repo/lib/modules/pool/PoolProvider';

export function useReliquaryExitGetSingleAssetWithdrawForBptIn() {
    const { poolService } = usePool();
    const { singleAsset } = useReactiveVar(withdrawStateVar);
    const { userWalletBptBalance } = usePoolUserBptBalance();

    return useQuery({
        queryKey: ['exitGetSingleAssetWithdrawForBptIn', userWalletBptBalance, singleAsset?.address],
        queryFn: async () => {
            if (!singleAsset) {
                return {
                    tokenAmount: '0',
                    priceImpact: 0,
                };
            }

            return poolService.exitGetSingleAssetWithdrawForBptIn(userWalletBptBalance, singleAsset.address);
        },
        enabled: !!singleAsset,
    });
}
