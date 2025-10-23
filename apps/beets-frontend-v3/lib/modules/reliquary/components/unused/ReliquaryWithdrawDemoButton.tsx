import { Button, HStack } from '@chakra-ui/react';
import { useReliquaryFbeetsMigrateContractCallData } from '~/modules/reliquary/lib/useReliquaryFbeetsMigrateContractCallData';
import { useReliquaryZap } from '~/modules/reliquary/lib/useReliquaryZap';
import { useReliquaryWithdrawAndHarvestContractCallData } from '~/modules/reliquary/lib/useReliquaryWithdrawAndHarvestContractCallData';
import useReliquary from '~/modules/reliquary/lib/useReliquary';
import { usePool } from '~/modules/pool/lib/usePool';
import { useBatchRelayerRelicApprove } from '~/modules/reliquary/lib/useBatchRelayerRelicApprove';
import { useBatchRelayerHasRelicApproval } from '~/modules/reliquary/lib/useBatchRelayerHasRelicApproval';

export function ReliquaryWithdrawDemoButton() {
    const { pool } = usePool();
    const { relicPositions } = useReliquary();
    const relicId = relicPositions.length > 0 ? parseInt(relicPositions[0].relicId) : undefined;
    const { data: batchRelayerHasRelicApproval } = useBatchRelayerHasRelicApproval(relicId);
    const { approve } = useBatchRelayerRelicApprove();
    const { data: contractCalls } = useReliquaryWithdrawAndHarvestContractCallData({
        relicId,
        bptAmount: '0.1',
        poolTotalShares: pool.dynamicData.totalShares,
        poolTokens: pool.tokens,
    });
    const { reliquaryZap } = useReliquaryZap('WITHDRAW');

    return (
        <HStack pb="4">
            <Button
                onClick={() => {
                    approve(relicId || 0);
                }}
                disabled={!relicId || batchRelayerHasRelicApproval}
            >
                {batchRelayerHasRelicApproval
                    ? 'Batch relayer has approval for relic'
                    : 'Approve Batch Relayer for relic'}
            </Button>
            <Button
                onClick={() => {
                    reliquaryZap(contractCalls || []);
                }}
            >
                Withdraw BEETS/FTM from relic
            </Button>
        </HStack>
    );
}
