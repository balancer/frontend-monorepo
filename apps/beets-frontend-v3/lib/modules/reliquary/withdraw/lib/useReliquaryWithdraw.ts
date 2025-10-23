import { GqlPoolToken } from '~/apollo/generated/graphql-codegen-generated';
import { useReliquaryWithdrawState } from '~/modules/reliquary/withdraw/lib/useReliquaryWithdrawState';
import { usePool } from '~/modules/pool/lib/usePool';

export function useReliquaryWithdraw() {
    const { pool } = usePool();
    const { selectedOptions } = useReliquaryWithdrawState();

    const selectedWithdrawTokens: GqlPoolToken[] = pool.withdrawConfig.options.map((option) =>
        selectedOptions[`${option.poolTokenIndex}`]
            ? option.tokenOptions.find(
                  (tokenOption) => tokenOption.address === selectedOptions[`${option.poolTokenIndex}`],
              )!
            : option.tokenOptions[0],
    );

    const selectedWithdrawTokenAddresses = selectedWithdrawTokens.map((token) => token.address);

    return {
        selectedWithdrawTokens,
        selectedWithdrawTokenAddresses,
    };
}
