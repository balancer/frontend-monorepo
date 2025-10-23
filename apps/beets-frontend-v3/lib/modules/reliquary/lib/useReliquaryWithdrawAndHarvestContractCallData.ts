import { useQuery } from 'react-query';
import { reliquaryZapService } from '~/lib/services/staking/reliquary-zap.service';
import { useUserAccount } from '~/lib/user/useUserAccount';
import { useSlippage } from '~/lib/global/useSlippage';
import { AmountHumanReadable } from '~/lib/services/token/token-types';
import { GqlPoolTokenBase } from '~/apollo/generated/graphql-codegen-generated';

export function useReliquaryWithdrawAndHarvestContractCallData({
    relicId,
    bptAmount,
    poolTokens,
    poolTotalShares,
}: {
    relicId?: number;
    bptAmount: AmountHumanReadable;
    poolTokens: GqlPoolTokenBase[];
    poolTotalShares: AmountHumanReadable;
}) {
    const { userAddress } = useUserAccount();
    const { slippage } = useSlippage();

    return useQuery(
        ['reliquaryWithdrawAndHarvestContractCallData', userAddress, slippage, relicId, bptAmount],
        async () => {
            return reliquaryZapService.getReliquaryWithdrawAndHarvestContractCallData({
                userAddress: userAddress || '',
                relicId: relicId || 0,
                bptAmount,
                slippage,
                poolTokens,
                poolTotalShares,
            });
        },
        { enabled: !!userAddress && typeof relicId === 'number' && parseFloat(bptAmount) !== 0 },
    );
}
