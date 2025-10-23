import { Box, HStack, Skeleton, Spacer, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import Card from '~/components/card/Card';
import TokenAvatar from '~/components/token/TokenAvatar';
import { numberFormatUSDValue } from '~/lib/util/number-formats';
import { tokenFormatAmount } from '~/lib/services/token/token-util';
import { sumBy } from 'lodash';
import { useGetTokens } from '~/lib/global/useToken';
import { useRelicPendingRewards } from '../../lib/useRelicPendingRewards';
import { BeetsSubmitTransactionButton } from '~/components/button/BeetsSubmitTransactionButton';
import { useRelicHarvestRewards } from '../../lib/useRelicHarvestRewards';

export default function RelicRewards() {
    const { priceForAmount } = useGetTokens();
    const { data: pendingRewards, isLoading: isLoadingPendingRewards } = useRelicPendingRewards();
    const pendingRewardsUsdValue = sumBy(pendingRewards, priceForAmount);
    const { harvest, ...harvestQuery } = useRelicHarvestRewards();

    return (
        <Card px="2" py="4" h="full">
            <VStack h="full" spacing="0" alignItems="flex-start">
                <Text lineHeight="1rem" fontWeight="semibold" fontSize="sm" color="beets.base.50">
                    Relic pending rewards
                </Text>
                {isLoadingPendingRewards ? (
                    <Skeleton h="34px" w="140px" mt="4px" mb="4px" />
                ) : (
                    <Text color="white" fontSize="1.75rem">
                        {numberFormatUSDValue(pendingRewardsUsdValue)}
                    </Text>
                )}
                <Box>
                    {pendingRewards?.map((reward, index) => (
                        <HStack key={index} spacing="1" mb={index === pendingRewards.length - 1 ? '0' : '0.5'}>
                            <TokenAvatar h="20px" w="20px" address={reward.address} />
                            <Skeleton isLoaded={!isLoadingPendingRewards}>
                                <Text fontSize="1rem" lineHeight="1rem">
                                    {tokenFormatAmount(reward.amount)}
                                </Text>
                            </Skeleton>
                        </HStack>
                    ))}
                </Box>
                <Spacer />
                <BeetsSubmitTransactionButton fullWidth w="full" variant="primary" {...harvestQuery} onClick={harvest}>
                    Claim now
                </BeetsSubmitTransactionButton>
            </VStack>
        </Card>
    );
}
