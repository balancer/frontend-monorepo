import Card from '~/components/card/Card';
import { Badge, Button, Flex, Heading, HStack, Skeleton, Text, Tooltip, VStack } from '@chakra-ui/react';
import numeral from 'numeral';
import AprTooltip from '~/components/apr-tooltip/AprTooltip';
import { numberFormatUSDValue } from '~/lib/util/number-formats';
import { TokenAmountPill } from '~/components/token/TokenAmountPill';
import React, { useState } from 'react';
import { useAnimation } from 'framer-motion';
import useReliquary from '~/modules/reliquary/lib/useReliquary';
import { useReliquaryLevelUp } from '~/modules/reliquary/lib/useReliquaryLevelUp';
import { usePoolUserDepositBalance } from '~/modules/pool/lib/usePoolUserDepositBalance';
import { usePool } from '~/modules/pool/lib/usePool';
import { useNetworkConfig } from '~/lib/global/useNetworkConfig';
import { Box, Divider, Stack } from '@chakra-ui/layout';
import { PoolUserStakedStats } from '~/modules/pool/detail/components/stats/PoolUserStakedStats';
import { InfoButton } from '~/components/info-button/InfoButton';
import TokenAvatar from '~/components/token/TokenAvatar';
import { networkConfig } from '~/lib/config/network-config';
import { useRelicDepositBalance } from '~/modules/reliquary/lib/useRelicDepositBalance';
import RelicAchievements from './RelicAchievements';
import RelicMaturity from '../charts/RelicMaturity';
import { useRelicPendingRewards } from '~/modules/reliquary/lib/useRelicPendingRewards';
import { useGetTokens } from '~/lib/global/useToken';
import { sum, sumBy } from 'lodash';
import { tokenFormatAmount } from '~/lib/services/token/token-util';
import { useRelicHarvestRewards } from '~/modules/reliquary/lib/useRelicHarvestRewards';
import { BeetsSubmitTransactionButton } from '~/components/button/BeetsSubmitTransactionButton';
import { useReliquaryGlobalStats } from '~/modules/reliquary/lib/useReliquaryGlobalStats';
import { ReliquaryBatchRelayerApprovalButton } from '../ReliquaryBatchRelayerApprovalButton';
import { useBatchRelayerHasApprovedForAll } from '../../lib/useBatchRelayerHasApprovedForAll';

export function RelicStats() {
    const { data: relicTokenBalances, relicBalanceUSD } = useRelicDepositBalance();
    const { pool } = usePool();
    const {
        isLoading,
        selectedRelic,
        selectedRelicApr,
        selectedRelicId,
        beetsPerDay,
        selectedRelicLevel,
        weightedTotalBalance,
    } = useReliquary();
    const { data: batchRelayerHasApprovedForAll, refetch } = useBatchRelayerHasApprovedForAll();
    const config = useNetworkConfig();
    const { priceForAmount } = useGetTokens();
    const {
        data: pendingRewards = [],
        refetch: refetchPendingRewards,
        isLoading: isLoadingPendingRewards,
    } = useRelicPendingRewards();
    const pendingRewardsUsdValue = sumBy(pendingRewards, priceForAmount);
    const { harvest, ...harvestQuery } = useRelicHarvestRewards();
    const { data: globalStats, loading: isLoadingGlobalStats } = useReliquaryGlobalStats();
    const weightedRelicAmount = parseFloat(selectedRelic?.amount || '0') * (selectedRelicLevel?.allocationPoints || 0);
    const relicShare = globalStats && selectedRelic ? weightedRelicAmount / weightedTotalBalance : 0;
    const relicBeetsPerDay = beetsPerDay * relicShare;
    const relicYieldPerDay = priceForAmount({ address: config.beets.address, amount: `${relicBeetsPerDay}` });

    return (
        <>
            <VStack spacing="4">
                <Stack
                    width="full"
                    alignItems="flex-start"
                    height={{ base: undefined, lg: '400px' }}
                    direction={{ base: 'column', lg: 'row' }}
                >
                    <Card display="flex" p="4" width="full" height="full" justifyContent="space-between">
                        <VStack width="full" spacing="8" justifyContent="flex-start">
                            <VStack width="full" spacing="0" alignItems="flex-start">
                                <Heading lineHeight="1rem" fontWeight="semibold" size="sm" color="beets.base.50">
                                    Relic APR
                                </Heading>
                                <HStack>
                                    <div className="apr-stripes">{numeral(selectedRelicApr).format('0.00%')}</div>
                                    <AprTooltip onlySparkles items={pool.dynamicData.aprItems} />
                                </HStack>
                                <HStack
                                    px="3"
                                    py="0.5"
                                    rounded="md"
                                    backgroundColor="beets.light"
                                    width={{ base: 'min-content' }}
                                    whiteSpace="nowrap"
                                >
                                    <Text fontWeight="semibold">Maturity boost</Text>
                                    <Badge bg="none" colorScheme="green" p="1">
                                        {selectedRelicLevel?.allocationPoints}x
                                    </Badge>
                                </HStack>
                            </VStack>
                            <Box width="full">
                                <Divider />
                            </Box>
                            <HStack width="full" spacing="12" alignItems="flex-start">
                                <VStack spacing="0" alignItems="flex-start">
                                    <InfoButton
                                        labelProps={{
                                            lineHeight: '1rem',
                                            fontWeight: 'semibold',
                                            fontSize: 'sm',
                                        }}
                                        label="My pending rewards"
                                        infoText={`Your accumulated liquidity incentives for this relic. You can claim your rewards at any time.`}
                                    />
                                    {isLoadingPendingRewards ? (
                                        <Skeleton height="34px" width="140px" mt="4px" mb="4px" />
                                    ) : (
                                        <Text color="white" fontSize="1.75rem">
                                            {numberFormatUSDValue(pendingRewardsUsdValue)}
                                        </Text>
                                    )}
                                    <Box>
                                        {pendingRewards.map((reward, index) => (
                                            <HStack
                                                key={index}
                                                spacing="1"
                                                mb={index === pendingRewards.length - 1 ? '0' : '0.5'}
                                            >
                                                <TokenAvatar height="20px" width="20px" address={reward.address} />
                                                <Skeleton isLoaded={!isLoadingPendingRewards}>
                                                    <Text fontSize="1rem" lineHeight="1rem">
                                                        {tokenFormatAmount(reward.amount)}
                                                    </Text>
                                                </Skeleton>
                                            </HStack>
                                        ))}
                                    </Box>
                                </VStack>
                            </HStack>
                        </VStack>
                        {!batchRelayerHasApprovedForAll ? (
                            <Box w="full">
                                <ReliquaryBatchRelayerApprovalButton
                                    onConfirmed={() => {
                                        refetch();
                                    }}
                                />
                            </Box>
                        ) : (
                            <BeetsSubmitTransactionButton
                                mt="4"
                                width="full"
                                variant="primary"
                                {...harvestQuery}
                                onClick={harvest}
                                onConfirmed={() => {
                                    refetchPendingRewards();
                                }}
                            >
                                Claim now
                            </BeetsSubmitTransactionButton>
                        )}
                    </Card>
                    <Card p="4" height="full" width="full" display="flex">
                        <VStack spacing="8">
                            <HStack width="full" spacing="12" alignItems="flex-start">
                                <VStack spacing="0" alignItems="flex-start">
                                    <Text lineHeight="1rem" fontWeight="semibold" fontSize="md" color="beets.base.50">
                                        Relic liquidity
                                    </Text>
                                    <Text color="white" fontSize="1.75rem">
                                        {numberFormatUSDValue(relicBalanceUSD)}
                                    </Text>
                                </VStack>
                            </HStack>
                            <VStack width="full" spacing="3" alignItems="flex-start">
                                <Text lineHeight="1rem" fontWeight="semibold" fontSize="sm" color="beets.base.50">
                                    Token breakdown
                                </Text>
                                <HStack flexWrap="wrap">
                                    <TokenAmountPill
                                        key={`relic-token-${config.fbeets.address}`}
                                        address={config.fbeets.address}
                                        amount={selectedRelic?.amount || '0'}
                                    />
                                    <Text fontWeight="bold" fontSize="2xl">
                                        =
                                    </Text>
                                    <Box display={{ base: 'block', md: 'flex' }}>
                                        {relicTokenBalances &&
                                            relicTokenBalances.map((token) => (
                                                <TokenAmountPill
                                                    mt={{ base: '2', md: '0' }}
                                                    ml={{ base: '0', md: '1' }}
                                                    key={`relic-token-${token.address}`}
                                                    address={token.address}
                                                    amount={token.amount}
                                                />
                                            ))}
                                    </Box>
                                </HStack>
                            </VStack>
                        </VStack>
                        <VStack spacing="0" alignItems="flex-start" mt="5" px="2">
                            <InfoButton
                                labelProps={{
                                    lineHeight: '1rem',
                                    fontWeight: 'semibold',
                                    fontSize: 'sm',
                                    color: 'beets.base.50',
                                }}
                                label="Relic share"
                                infoText={`The size of your relic relative to all value stored in relics. Your staked share represents the percent of liquidity incentives you are entitled to.`}
                            />
                            <VStack spacing="none" alignItems="flex-start">
                                {isLoading || isLoadingGlobalStats ? (
                                    <Skeleton height="34px" width="140px" mt="4px" mb="4px" />
                                ) : (
                                    <Text color="white" fontSize="1.75rem">
                                        {relicShare < 0.0001 ? '< 0.01%' : numeral(relicShare).format('0.00%')}
                                    </Text>
                                )}
                                {isLoading || isLoadingGlobalStats ? (
                                    <Skeleton height="16px" width="45px" />
                                ) : (
                                    <Text fontSize="1rem" lineHeight="1rem">
                                        {numeral(weightedRelicAmount).format('0.00a')}
                                        {' / '}
                                        {numeral(weightedTotalBalance).format('0.00a')}{' '}
                                        <Text as="span" fontSize="md" color="beets.base.50">
                                            weighted fBEETS
                                        </Text>
                                    </Text>
                                )}
                            </VStack>
                        </VStack>

                        <VStack spacing="0" alignItems="flex-start" mt="8" px="2" flex="1">
                            <InfoButton
                                labelProps={{
                                    lineHeight: '1rem',
                                    fontWeight: 'semibold',
                                    fontSize: 'sm',
                                    color: 'beets.base.50',
                                }}
                                label="My potential daily yield"
                                infoText="The potential daily value is an approximation based on swap fees, current token prices and your staked share. A number of external factors can influence this value from second to second."
                            />
                            {isLoading ? (
                                <Skeleton height="34px" width="140px" mt="4px" mb="4px" />
                            ) : (
                                <Text color="white" fontSize="1.75rem">
                                    {numberFormatUSDValue(relicYieldPerDay)}
                                </Text>
                            )}
                            <Box>
                                {beetsPerDay > 0 && (
                                    <HStack spacing="1" mb="0.5">
                                        <TokenAvatar height="20px" width="20px" address={networkConfig.beets.address} />
                                        <Tooltip label={`BEETS emissions for reliquary are calculated per second.`}>
                                            <Text fontSize="1rem" lineHeight="1rem">
                                                {numeral(beetsPerDay).format('0,0')} / day
                                            </Text>
                                        </Tooltip>
                                    </HStack>
                                )}
                            </Box>
                        </VStack>
                    </Card>
                </Stack>
                <Stack
                    width="full"
                    alignItems="flex-start"
                    height={{ base: undefined, lg: '300px' }}
                    direction={{ base: 'column', lg: 'row' }}
                >
                    <RelicMaturity />
                </Stack>
            </VStack>
            <Flex width="full" alignItems="flex-start" flex={1} flexDirection="column">
                {/*pool.staking && (
                    <PoolUserStakedStats
                        poolAddress={pool.address}
                        staking={pool.staking}
                        totalApr={totalApr}
                        userPoolBalanceUSD={userPoolBalanceUSD}
                    />
                )*/}
                {/*<PoolDetailPossibleYieldText />*/}
            </Flex>
        </>
    );
}
