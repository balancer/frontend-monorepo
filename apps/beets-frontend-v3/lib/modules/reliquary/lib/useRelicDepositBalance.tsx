import { useQuery } from 'react-query';
import { useGetTokens } from '~/lib/global/useToken';
import { sumBy } from 'lodash';
import { useReliquaryWithdraw } from '~/modules/reliquary/withdraw/lib/useReliquaryWithdraw';
import { usePool } from '~/modules/pool/lib/usePool';
import { createContext, ReactNode, useContext } from 'react';
import useReliquary from '~/modules/reliquary/lib/useReliquary';

export function _useRelicDepositBalance() {
    const { poolService } = usePool();
    const { priceForAmount } = useGetTokens();
    const { selectedWithdrawTokenAddresses } = useReliquaryWithdraw();
    const { selectedRelic } = useReliquary();

    const query = useQuery(
        ['relicDepositBalance', selectedRelic?.relicId, selectedRelic?.amount, selectedWithdrawTokenAddresses],
        async () => {
            const result = await poolService.exitGetProportionalWithdrawEstimate(
                selectedRelic?.amount || '0',
                selectedWithdrawTokenAddresses,
            );

            return result;
        },
        { enabled: !!selectedRelic && parseFloat(selectedRelic.amount) > 0 },
    );

    return {
        ...query,
        relicBalanceUSD: sumBy(query.data || [], priceForAmount),
    };
}

export const RelicDepositBalanceContext = createContext<ReturnType<typeof _useRelicDepositBalance> | null>(null);

export function RelicDepositBalanceProvider(props: { children: ReactNode }) {
    const value = _useRelicDepositBalance();

    return <RelicDepositBalanceContext.Provider value={value}>{props.children}</RelicDepositBalanceContext.Provider>;
}

export function useRelicDepositBalance() {
    return useContext(RelicDepositBalanceContext) as ReturnType<typeof _useRelicDepositBalance>;
}
