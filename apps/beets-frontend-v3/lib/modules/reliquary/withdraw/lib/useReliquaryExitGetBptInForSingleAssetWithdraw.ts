import { useReactiveVar } from '@apollo/client';
import { withdrawStateVar } from '~/modules/reliquary/withdraw/lib/useReliquaryWithdrawState';
import { useQuery } from 'react-query';
import numeral from 'numeral';
import { useNetworkConfig } from '~/lib/global/useNetworkConfig';
import { usePool } from '~/modules/pool/lib/usePool';

export function useReliquaryExitGetBptInForSingleAssetWithdraw() {
    const networkConfig = useNetworkConfig();
    const { poolService } = usePool();
    const { singleAsset } = useReactiveVar(withdrawStateVar);

    const query = useQuery(
        ['exitGetBptInForSingleAssetWithdraw', singleAsset],
        async () => {
            if (!singleAsset || singleAsset.amount === '' || parseFloat(singleAsset.amount) === 0) {
                return {
                    bptIn: '0',
                    priceImpact: 0,
                };
            }

            return poolService.exitGetBptInForSingleAssetWithdraw(singleAsset);
        },
        { enabled: !!singleAsset },
    );

    const bptOutAndPriceImpact = query.data;
    const priceImpact = Math.abs(bptOutAndPriceImpact?.priceImpact || 0);
    const hasHighPriceImpact = priceImpact > networkConfig.priceImpact.withdraw.high;
    const hasMediumPriceImpact = !hasHighPriceImpact && priceImpact > networkConfig.priceImpact.withdraw.noticeable;

    const formattedPriceImpact = numeral(priceImpact > 0.000001 ? priceImpact : 0).format('0.00%');

    return { ...query, hasHighPriceImpact, hasMediumPriceImpact, formattedPriceImpact };
}
