import { useReactiveVar } from '@apollo/client';
import { withdrawStateVar } from '~/modules/reliquary/withdraw/lib/useReliquaryWithdrawState';
import { useQuery } from 'react-query';
import { usePoolUserBptBalance } from '~/modules/pool/lib/usePoolUserBptBalance';
import { usePool } from '~/modules/pool/lib/usePool';

export function useReliquaryExitGetSingleAssetWithdrawForBptIn() {
    const { poolService } = usePool();
    const { singleAsset } = useReactiveVar(withdrawStateVar);
    const { userWalletBptBalance } = usePoolUserBptBalance();

    return useQuery(
        ['exitGetSingleAssetWithdrawForBptIn', userWalletBptBalance, singleAsset?.address],
        async () => {
            if (!singleAsset) {
                return {
                    tokenAmount: '0',
                    priceImpact: 0,
                };
            }

            return poolService.exitGetSingleAssetWithdrawForBptIn(userWalletBptBalance, singleAsset.address);
        },
        { enabled: !!singleAsset },
    );
}
