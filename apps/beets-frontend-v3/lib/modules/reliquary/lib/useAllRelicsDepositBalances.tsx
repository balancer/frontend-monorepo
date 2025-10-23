import { useReliquaryWithdraw } from '../withdraw/lib/useReliquaryWithdraw';
import { useQuery } from 'react-query';
import { useGetTokens } from '~/lib/global/useToken';
import { sum, sumBy } from 'lodash';
import { usePool } from '~/modules/pool/lib/usePool';
import useReliquary from './useReliquary';
import { parseUnits } from 'ethers/lib/utils.js';
import { BigNumber } from 'ethers';
import { formatFixed } from '@ethersproject/bignumber';

export function useAllRelicsDepositBalances() {
    const { poolService } = usePool();
    const { priceForAmount } = useGetTokens();
    const { selectedWithdrawTokenAddresses } = useReliquaryWithdraw();
    const { relicPositionsForFarmId, relicIds, isLoadingRelicPositions } = useReliquary();

    const query = useQuery(
        ['useAllRelicsDepositBalances', relicIds, selectedWithdrawTokenAddresses],
        async () => {
            const result = await Promise.all(
                relicPositionsForFarmId.map(async (relic) => {
                    const tokenAmounts = await poolService.exitGetProportionalWithdrawEstimate(
                        relic.amount || '0',
                        selectedWithdrawTokenAddresses,
                    );

                    const usdValue = sumBy(tokenAmounts, priceForAmount);

                    return {
                        ...relic,
                        tokenAmounts,
                        usdValue,
                    };
                }),
            );

            return result;
        },
        { enabled: relicPositionsForFarmId.length > 0 && !isLoadingRelicPositions },
    );

    let alllRelicsBptTotal = BigNumber.from(0);
    let allRelicsBeetsAmount = BigNumber.from(0);
    let allRelicsWftmAmount = BigNumber.from(0);

    const relics = (query.data || []).filter((relic) => relic.amount !== '0.0');

    for (const relic of relics) {
        alllRelicsBptTotal = alllRelicsBptTotal.add(parseUnits(relic.amount || '0', 18));

        allRelicsWftmAmount = allRelicsWftmAmount.add(parseUnits(relic.tokenAmounts[0]?.amount || '0', 18));
        allRelicsBeetsAmount = allRelicsBeetsAmount.add(parseUnits(relic.tokenAmounts[1]?.amount || '0', 18));
    }

    return {
        ...query,
        isLoading: query.isLoading || isLoadingRelicPositions,
        relics,
        allRelicsUsdValue: sum(relics.map((relic) => relic.usdValue)),
        alllRelicsBptTotal: formatFixed(alllRelicsBptTotal, 18),
        allRelicsBeetsAmount: formatFixed(allRelicsBeetsAmount, 18),
        allRelicsWftmAmount: formatFixed(allRelicsWftmAmount, 18),
    };
}
