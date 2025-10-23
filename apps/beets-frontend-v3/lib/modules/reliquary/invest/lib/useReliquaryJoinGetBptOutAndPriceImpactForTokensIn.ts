import { useQuery } from 'react-query';
import { useReactiveVar } from '@apollo/client';
import { investStateVar } from '~/modules/reliquary/invest/lib/useReliquaryInvestState';
import { replaceEthWithWeth, tokenAmountsGetArrayFromMap } from '~/lib/services/token/token-util';
import { useSlippage } from '~/lib/global/useSlippage';
import numeral from 'numeral';
import { useNetworkConfig } from '~/lib/global/useNetworkConfig';
import { usePool } from '~/modules/pool/lib/usePool';

export function useReliquaryJoinGetBptOutAndPriceImpactForTokensIn() {
    const networkConfig = useNetworkConfig();
    const { poolService, pool } = usePool();
    const { inputAmounts, selectedOptions } = useReactiveVar(investStateVar);
    const { slippage } = useSlippage();
    //map the input amounts to the token being invested
    const tokenAmountsIn = tokenAmountsGetArrayFromMap(inputAmounts).map(({ amount, address }) => {
        const poolTokenIndex = pool.tokens.find((token) => token.address === address)?.index || -1;
        const investOption = pool.investConfig.options.find((option) => option.poolTokenIndex === poolTokenIndex);

        return {
            amount,
            address: selectedOptions[`${poolTokenIndex}`] || investOption?.tokenOptions[0].address || address,
        };
    });

    const query = useQuery(
        ['joinGetBptOutAndPriceImpactForTokensIn', tokenAmountsIn, slippage],
        async () => {
            if (
                !tokenAmountsIn ||
                tokenAmountsIn.every((tokenAmount) => !tokenAmount.amount || parseFloat(tokenAmount.amount) === 0)
            ) {
                return { minBptReceived: '0', priceImpact: 0 };
            }

            const replacedWethTokenAmountsIn = tokenAmountsIn.map((token) => {
                return {
                    amount: token.amount,
                    address: replaceEthWithWeth(token.address),
                };
            });

            return poolService.joinGetBptOutAndPriceImpactForTokensIn(replacedWethTokenAmountsIn, slippage);
        },
        { enabled: tokenAmountsIn.length > 0, staleTime: 0, cacheTime: 0 },
    );

    const bptOutAndPriceImpact = query.data;
    const priceImpact = Math.abs(bptOutAndPriceImpact?.priceImpact || 0);
    const hasHighPriceImpact = priceImpact > networkConfig.priceImpact.invest.high;
    const hasMediumPriceImpact = !hasHighPriceImpact && priceImpact > networkConfig.priceImpact.invest.noticeable;

    const formattedPriceImpact = numeral(priceImpact > 0.000001 ? priceImpact : 0).format('0.00%');

    return {
        ...query,
        bptOutAndPriceImpact,
        hasHighPriceImpact,
        hasMediumPriceImpact,
        formattedPriceImpact,
    };
}
