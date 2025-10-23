import React, { useEffect, useState } from 'react';
import { useUserAllowances } from '~/lib/util/useUserAllowances';
import { useReliquaryInvest } from '~/modules/reliquary/invest/lib/useReliquaryInvest';
import { Alert, AlertIcon, Box, VStack } from '@chakra-ui/react';
import { FadeInBox } from '~/components/animation/FadeInBox';
import { numberFormatUSDValue } from '~/lib/util/number-formats';
import { useNetworkConfig } from '~/lib/global/useNetworkConfig';
import { usePool } from '~/modules/pool/lib/usePool';
import { useHasBatchRelayerApproval } from '~/lib/util/useHasBatchRelayerApproval';
import { SubTransactionSubmittedContent } from '~/components/transaction/SubTransactionSubmittedContent';
import { transactionMessageFromError } from '~/lib/util/transaction-util';
import { useReliquaryDepositContractCallData } from '~/modules/reliquary/lib/useReliquaryDepositContractCallData';
import { useReliquaryZap } from '~/modules/reliquary/lib/useReliquaryZap';
import useReliquary from '~/modules/reliquary/lib/useReliquary';
import { useBatchRelayerHasApprovedForAll } from '~/modules/reliquary/lib/useBatchRelayerHasApprovedForAll';
import { ReliquaryTransactionStepsSubmit, TransactionStep } from '../../components/ReliquaryTransactionStepsSubmit';

interface Props {
    onInvestComplete(): void;
    onClose(): void;
}

export function ReliquaryInvestActions({ onInvestComplete, onClose }: Props) {
    const networkConfig = useNetworkConfig();
    const { pool } = usePool();
    const { selectedInvestTokensWithAmounts, totalInvestValue } = useReliquaryInvest();
    const allInvestTokens = pool.investConfig.options.map((option) => option.tokenOptions).flat();
    const {
        hasApprovalForAmount,
        isLoading: isLoadingUserAllowances,
        refetch: refetchUserAllowances,
    } = useUserAllowances(allInvestTokens, networkConfig.balancer.vault);
    const [steps, setSteps] = useState<TransactionStep[] | null>(null);
    const {
        data: hasBatchRelayerApproval,
        isLoading: isLoadingBatchRelayerApproval,
        refetch: refetchBatchRelayerApproval,
    } = useHasBatchRelayerApproval();

    const { createRelic, refetchRelicPositions } = useReliquary();
    const { reliquaryZap, ...reliquaryJoinQuery } = useReliquaryZap('DEPOSIT');
    const {
        data: batchRelayerHasApprovedForAll,
        isLoading: isLoadingBatchRelayerHasApprovedForAll,
        refetch: refetchBatchRelayerHasApprovedForAll,
    } = useBatchRelayerHasApprovedForAll();
    const { data: reliquaryContractCalls } = useReliquaryDepositContractCallData({
        investTokensWithAmounts: selectedInvestTokensWithAmounts,
        enabled: batchRelayerHasApprovedForAll,
    });

    const isLoading =
        isLoadingUserAllowances || isLoadingBatchRelayerApproval || isLoadingBatchRelayerHasApprovedForAll;

    useEffect(() => {
        refetchBatchRelayerApproval({});
        refetchBatchRelayerHasApprovedForAll({});
    }, []);

    useEffect(() => {
        if (!isLoading) {
            const tokensRequiringApproval = selectedInvestTokensWithAmounts.filter(
                (tokenWithAmount) =>
                    parseFloat(tokenWithAmount.amount) > 0 &&
                    !hasApprovalForAmount(tokenWithAmount.address, tokenWithAmount.amount),
            );

            const investStep: TransactionStep = {
                id: 'reliquary-invest',
                type: 'other',
                buttonText: `${createRelic ? 'Create and d' : 'D'}eposit`,
                tooltipText: 'Create and/or deposit into your relic',
            };

            const steps: TransactionStep[] = [
                ...tokensRequiringApproval.map((token) => ({
                    id: token.symbol,
                    type: 'tokenApproval' as const,
                    buttonText: `Approve ${token.symbol}`,
                    tooltipText: `Approve ${token.symbol} for depositing`,
                    token,
                })),
                investStep,
            ];

            if (!batchRelayerHasApprovedForAll) {
                steps.unshift({
                    id: 'batch-relayer-reliquary',
                    type: 'other',
                    buttonText: 'Approve relayer for transacting',
                    tooltipText: 'Transacting with all (future) relics requires you to approve the batch relayer.',
                });
            }

            if (!hasBatchRelayerApproval) {
                steps.unshift({
                    id: 'batch-relayer',
                    type: 'other',
                    buttonText: 'Approve relayer for creating',
                    tooltipText: 'Creating a relic requires you to approve the batch relayer.',
                });
            }

            setSteps(steps);
        }
    }, [isLoading]);

    return (
        <VStack width="full" spacing="4">
            {reliquaryJoinQuery.error && (
                <Box width="full" px="4">
                    <Alert width="full" status="error">
                        <AlertIcon />
                        {transactionMessageFromError(reliquaryJoinQuery.error)}
                    </Alert>
                </Box>
            )}
            {reliquaryJoinQuery.isConfirmed && (
                <Box width="full" px="4">
                    <FadeInBox isVisible={reliquaryJoinQuery.isConfirmed}>
                        <Alert status="success" borderRadius="md">
                            <AlertIcon />
                            {`You've successfully invested ${numberFormatUSDValue(totalInvestValue)} into a relic.`}
                        </Alert>
                    </FadeInBox>
                </Box>
            )}
            <Box
                px="4"
                width="full"
                pb={
                    reliquaryJoinQuery.isConfirmed || reliquaryJoinQuery.isFailed || reliquaryJoinQuery.isPending
                        ? '0'
                        : '4'
                }
            >
                <ReliquaryTransactionStepsSubmit
                    isLoading={
                        steps === null || isLoadingBatchRelayerApproval || isLoadingBatchRelayerHasApprovedForAll
                    }
                    loadingButtonText="Invest"
                    completeButtonText="Return to maBEETS"
                    onCompleteButtonClick={onClose}
                    steps={steps || []}
                    onSubmit={(id) => {
                        if (id === 'reliquary-invest' && reliquaryContractCalls) {
                            reliquaryZap(reliquaryContractCalls);
                        }
                    }}
                    onConfirmed={(id) => {
                        if (id !== 'reliquary-invest') {
                            refetchUserAllowances();
                        } else {
                            refetchRelicPositions();
                            onInvestComplete();
                        }
                    }}
                    queries={[{ ...reliquaryJoinQuery, id: 'reliquary-invest' }]}
                    showToS={createRelic}
                />
            </Box>
            <FadeInBox
                width="full"
                isVisible={
                    reliquaryJoinQuery.isConfirmed || reliquaryJoinQuery.isPending || reliquaryJoinQuery.isFailed
                }
            >
                <SubTransactionSubmittedContent query={reliquaryJoinQuery} />
            </FadeInBox>
        </VStack>
    );
}
