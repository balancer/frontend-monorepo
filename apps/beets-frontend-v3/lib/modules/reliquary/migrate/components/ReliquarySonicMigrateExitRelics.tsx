import { Box, Button, Divider, Flex, Heading, Skeleton, StackDivider, Text, VStack } from '@chakra-ui/react';
import { BeetsBox } from '~/components/box/BeetsBox';
import TokenRow from '~/components/token/TokenRow';
import { useNetworkConfig } from '~/lib/global/useNetworkConfig';
import { numberFormatUSDValue } from '~/lib/util/number-formats';
import { useAllRelicsDepositBalances } from '../../lib/useAllRelicsDepositBalances';
import useReliquary from '../../lib/useReliquary';
import { useAllRelicsWithdrawAndHarvestContractCallData } from '../../lib/useAllRelicsWithdrawAndHarvestContractCallData';
import { ReliquaryTransactionStepsSubmit, TransactionStep } from '../../components/ReliquaryTransactionStepsSubmit';
import { useReliquaryZap } from '../../lib/useReliquaryZap';
import { useEffect, useState } from 'react';
import { useUserTokenBalances } from '~/lib/user/useUserTokenBalances';
import { useHasBatchRelayerApproval } from '~/lib/util/useHasBatchRelayerApproval';
import { useBatchRelayerHasApprovedForAll } from '../../lib/useBatchRelayerHasApprovedForAll';

export function ReliquarySonicMigrateExitRelics() {
    const networkConfig = useNetworkConfig();
    const [success, setSuccess] = useState(false);
    const { refetchRelicPositions } = useReliquary();
    const {
        relics: relicsToFilter,
        allRelicsUsdValue,
        allRelicsBeetsAmount,
        allRelicsWftmAmount,
        alllRelicsBptTotal,
        isLoading,
        refetch: refetchRelicBalances,
    } = useAllRelicsDepositBalances();
    const { refetch: refetchUserBalances } = useUserTokenBalances();
    const {
        data: hasBatchRelayerApproval,
        isLoading: isLoadingBatchRelayerApproval,
        refetch: refetchBatchRelayerApproval,
    } = useHasBatchRelayerApproval();
    const [steps, setSteps] = useState<TransactionStep[]>([]);

    const {
        data: batchRelayerHasApprovedForAll,
        isLoading: isLoadingBatchRelayerApprovalForAll,
        refetch: refetchBatchRelayerHasApprovedForAll,
    } = useBatchRelayerHasApprovedForAll();

    const relics = relicsToFilter.filter((relic) => relic.amount !== '0.0');
    const relicNumbersString = relics.map((relic, idx) => `${idx !== 0 ? ', #' : '#'}${relic.relicId}`);

    const { data: contractCallData, isLoading: isLoadingReliquaryContractCallData } =
        useAllRelicsWithdrawAndHarvestContractCallData();
    const { reliquaryZap, ...reliquaryZapQuery } = useReliquaryZap('WITHDRAW');

    useEffect(() => {
        if (!isLoading && !isLoadingBatchRelayerApprovalForAll && !isLoadingBatchRelayerApproval) {
            setSteps([
                ...(!batchRelayerHasApprovedForAll && !isLoadingBatchRelayerApprovalForAll
                    ? [
                          {
                              id: 'batch-relayer-reliquary',
                              type: 'other' as const,
                              buttonText: 'Approve relayer for reliquary',
                              tooltipText:
                                  'Approve the batch relayer to deposit, withdraw & claim rewards for all relics',
                          },
                      ]
                    : []),
                ...(!hasBatchRelayerApproval && !isLoadingBatchRelayerApproval
                    ? [
                          {
                              id: 'batch-relayer',
                              type: 'other' as const,
                              buttonText: 'Approve relayer for vault',
                              tooltipText: 'Approve the batch relayer to exit the vault.',
                          },
                      ]
                    : []),

                { id: 'exit', tooltipText: '', type: 'other', buttonText: 'Exit relics' },
            ]);
        }
    }, [isLoading, isLoadingBatchRelayerApproval, isLoadingBatchRelayerApprovalForAll]);

    const hasRelics = !isLoading && relics.length > 0;

    return (
        <Box>
            <Heading size="md">1. Exit Your Relics</Heading>
            {isLoading ? <Skeleton width="full" height="200px" /> : null}
            {success && <Text>You've successfully exited all of your relics!. Move on to step #2.</Text>}
            {!hasRelics && !success && <Text mb="4">You've already exited all relics for this wallet.</Text>}
            {hasRelics && !success && (
                <>
                    <Text mb="4">
                        Withdraw your BEETS and wFTM from your maBEETS relic(s). In this wallet, you have{' '}
                        {relics.length} relic(s) with a total value of {numberFormatUSDValue(allRelicsUsdValue)}.
                    </Text>

                    <BeetsBox mb="6">
                        <Flex p="2">
                            <Text fontSize="lg" fontWeight="semibold" flex="1">
                                Relic IDs
                            </Text>
                            <Skeleton isLoaded={!isLoading}>
                                <Text fontSize="lg" fontWeight="semibold">
                                    {relicNumbersString}
                                </Text>
                            </Skeleton>
                        </Flex>
                        <Divider borderColor="whiteAlpha.200" />
                        <Flex p="2">
                            <Text fontSize="lg" fontWeight="semibold" flex="1">
                                Total value
                            </Text>
                            <Skeleton isLoaded={!isLoading}>
                                <Text fontSize="lg" fontWeight="semibold">
                                    {numberFormatUSDValue(allRelicsUsdValue)}
                                </Text>
                            </Skeleton>
                        </Flex>
                        <Divider borderColor="whiteAlpha.200" />

                        <Text fontSize="lg" fontWeight="semibold" p="2">
                            Tokens breakdown
                        </Text>
                        <VStack width="full" divider={<StackDivider borderColor="whiteAlpha.200" />}>
                            <Box width="full" p="2">
                                <TokenRow address={networkConfig.wethAddress} amount={allRelicsWftmAmount} />
                            </Box>
                            <Box width="full" p="2">
                                <TokenRow address={networkConfig.beets.address} amount={allRelicsBeetsAmount} />
                            </Box>
                        </VStack>
                    </BeetsBox>

                    <ReliquaryTransactionStepsSubmit
                        isLoading={isLoadingReliquaryContractCallData}
                        loadingButtonText=""
                        completeButtonText="Successfully exited relics"
                        onCompleteButtonClick={() => {}}
                        onSubmit={() => {
                            if (contractCallData) {
                                reliquaryZap(contractCallData);
                            }
                        }}
                        onConfirmed={async (id) => {
                            if (id === 'batch-relayer') {
                                refetchBatchRelayerApproval();
                            }

                            if (id === 'batch-relayer-reliquary') {
                                refetchBatchRelayerHasApprovedForAll();
                            }

                            if (id === 'exit') {
                                setSuccess(true);
                                refetchRelicPositions();
                                refetchRelicBalances();
                                refetchUserBalances();
                            }
                        }}
                        steps={steps || []}
                        queries={[{ ...reliquaryZapQuery, id: 'exit' }]}
                    />
                </>
            )}
        </Box>
    );
}
