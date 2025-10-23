import { useReactiveVar } from '@apollo/client';
import { withdrawStateVar } from '~/modules/reliquary/withdraw/lib/useReliquaryWithdrawState';
import { useQuery } from 'react-query';
import { oldBnumScaleAmount, oldBnumToHumanReadable } from '~/lib/services/pool/lib/old-big-number';
import { useReliquaryWithdraw } from '~/modules/reliquary/withdraw/lib/useReliquaryWithdraw';
import { usePool } from '~/modules/pool/lib/usePool';
import useReliquary from '~/modules/reliquary/lib/useReliquary';

export function useReliquaryExitGetProportionalWithdrawEstimate() {
    const { poolService, pool } = usePool();
    const { proportionalPercent } = useReactiveVar(withdrawStateVar);
    const { selectedRelic } = useReliquary();
    const bptIn = oldBnumToHumanReadable(
        oldBnumScaleAmount(selectedRelic?.amount || '').times(proportionalPercent / 100),
    );
    const { selectedWithdrawTokenAddresses } = useReliquaryWithdraw();

    return useQuery(
        ['exitGetProportionalWithdrawEstimate', pool.id, bptIn, selectedWithdrawTokenAddresses],
        async () => {
            const result = await poolService.exitGetProportionalWithdrawEstimate(bptIn, selectedWithdrawTokenAddresses);

            return result;
        },
        {},
    );
}
