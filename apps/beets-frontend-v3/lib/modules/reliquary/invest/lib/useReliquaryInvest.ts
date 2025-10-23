import { TokenAmountHumanReadable } from '~/lib/services/token/token-types';
import { useReliquaryInvestState } from '~/modules/reliquary/invest/lib/useReliquaryInvestState';
import { usePoolUserTokenBalancesInWallet } from '~/modules/pool/lib/usePoolUserTokenBalancesInWallet';
import { isEth, tokenGetAmountForAddress } from '~/lib/services/token/token-util';
import { GqlPoolToken } from '~/apollo/generated/graphql-codegen-generated';
import { sumBy } from 'lodash';
import { useGetTokens } from '~/lib/global/useToken';
import { oldBnum } from '~/lib/services/pool/lib/old-big-number';
import { usePool } from '~/modules/pool/lib/usePool';

export function useReliquaryInvest() {
    const { pool } = usePool();
    const { selectedOptions, inputAmounts } = useReliquaryInvestState();
    const { getUserBalanceForToken, userPoolTokenBalances } = usePoolUserTokenBalancesInWallet();
    const { priceForAmount } = useGetTokens();

    const selectedInvestTokens: GqlPoolToken[] = pool.investConfig.options.map((option) =>
        selectedOptions[`${option.poolTokenIndex}`]
            ? option.tokenOptions.find(
                  (tokenOption) => tokenOption.address === selectedOptions[`${option.poolTokenIndex}`],
              )!
            : option.tokenOptions[0],
    );

    const selectedInvestTokensWithAmounts = selectedInvestTokens.map((token) => ({
        ...token,
        amount: inputAmounts[token.address] || '0',
    }));

    const userInvestTokenBalances: TokenAmountHumanReadable[] = selectedInvestTokens.map((token) => ({
        address: token.address,
        amount: getUserBalanceForToken(token.address),
    }));

    const hasValidUserInput =
        !selectedInvestTokensWithAmounts.every((token) => parseFloat(token.amount) === 0) &&
        selectedInvestTokensWithAmounts.every((token) =>
            oldBnum(token.amount).lte(getUserBalanceForToken(token.address)),
        );

    const canInvestProportionally =
        pool.investConfig.options.filter(
            (option) =>
                option.tokenOptions.filter(
                    (tokenOption) =>
                        parseFloat(tokenGetAmountForAddress(tokenOption.address, userPoolTokenBalances)) > 0,
                ).length > 0,
        ).length === pool.investConfig.options.length;

    const totalInvestValue = sumBy(selectedInvestTokensWithAmounts, priceForAmount);
    const isInvestingWithEth = !!selectedInvestTokens.find((token) => isEth(token.address));

    return {
        selectedInvestTokens,
        selectedInvestTokensWithAmounts,
        userInvestTokenBalances,
        canInvestProportionally,
        totalInvestValue,
        hasValidUserInput,
        isInvestingWithEth,
    };
}
