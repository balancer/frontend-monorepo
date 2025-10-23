import { useQuery } from 'react-query';
import { reliquaryZapService } from '~/lib/services/staking/reliquary-zap.service';
import { useUserAccount } from '~/lib/user/useUserAccount';
import { useSlippage } from '~/lib/global/useSlippage';
import { useBalances } from '~/lib/util/useBalances';
import { useNetworkConfig } from '~/lib/global/useNetworkConfig';
import { AmountHumanReadable } from '~/lib/services/token/token-types';
import { GqlPoolToken } from '~/apollo/generated/graphql-codegen-generated';
import { useMemo } from 'react';
import { keyBy } from 'lodash';
import useReliquary from './useReliquary';

export function useReliquaryDepositContractCallData({
    investTokensWithAmounts,
    enabled = true,
}: {
    investTokensWithAmounts: (GqlPoolToken & { amount: string })[];
    enabled?: boolean;
}) {
    const { userAddress } = useUserAccount();
    const { slippage } = useSlippage();
    const networkConfig = useNetworkConfig();
    const { selectedRelicId, createRelic } = useReliquary();

    const investTokensWithAmountsMap = useMemo(
        () => keyBy(investTokensWithAmounts, 'address'),
        [investTokensWithAmounts],
    );

    const investData = useMemo(() => {
        let beetsAmount = '0';
        let ftmAmount = '0';
        let isNativeFtm = false;

        if (enabled) {
            beetsAmount = investTokensWithAmountsMap[networkConfig.beets.address].amount;
            ftmAmount = investTokensWithAmountsMap[networkConfig.sftmx.address].amount;
            /* if (investTokensWithAmountsMap[networkConfig.eth.address.toLowerCase()]?.address) {
                ftmAmount = investTokensWithAmountsMap[networkConfig.eth.address.toLowerCase()].amount;
            } else {
                ftmAmount = investTokensWithAmountsMap[networkConfig.wethAddress].amount;
                isNativeFtm = false;
            } */
        }

        return {
            beetsAmount,
            ftmAmount,
            isNativeFtm,
        };
    }, [enabled, investTokensWithAmountsMap]);

    const query = useQuery(
        ['reliquaryDepositContractCallData', userAddress, slippage, investData],
        async () => {
            console.log('reliquaryDepositContractCallData', {
                userAddress: userAddress || '',
                slippage,
                beetsAmount: investData.beetsAmount,
                ftmAmount: investData.ftmAmount,
                isNativeFtm: investData.isNativeFtm,
                relicId: createRelic ? undefined : parseInt(selectedRelicId || ''),
            });

            return reliquaryZapService.getReliquaryDepositContractCallData({
                userAddress: userAddress || '',
                slippage,
                beetsAmount: investData.beetsAmount,
                ftmAmount: investData.ftmAmount,
                isNativeFtm: investData.isNativeFtm,
                relicId: createRelic ? undefined : parseInt(selectedRelicId || ''),
            });
        },
        { enabled: !!userAddress && enabled },
    );

    return {
        ...query,
    };
}
