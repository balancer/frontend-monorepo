import { Alert, AlertIcon, Box, SkeletonText } from '@chakra-ui/react';
import { formatDistanceToNowStrict } from 'date-fns';
import React, { useEffect } from 'react';
import { numberFormatUSDValue } from '~/lib/util/number-formats';
import { useReliquaryDepositImpact } from '../../lib/useReliquaryDepositImpact';
import { useReliquaryJoinGetBptOutAndPriceImpactForTokensIn } from '../lib/useReliquaryJoinGetBptOutAndPriceImpactForTokensIn';

interface Props {
    bptIn?: string;
    totalInvestValue?: number;
    relicId?: string;
}

export function ReliquaryInvestDepositImpact({ bptIn, totalInvestValue = 0, relicId }: Props) {
    const { bptOutAndPriceImpact } = useReliquaryJoinGetBptOutAndPriceImpactForTokensIn();

    const {
        data: depositImpact,
        isFetching,
        refetch,
    } = useReliquaryDepositImpact(parseFloat(bptIn || bptOutAndPriceImpact?.minBptReceived || ''), relicId);

    useEffect(() => {
        if (relicId) {
            refetch();
        }
    }, [relicId]);

    return depositImpact !== undefined && !depositImpact.staysMax ? (
        <Box w="full">
            <Alert status="warning" mb="4">
                <AlertIcon alignSelf="center" />
                {!isFetching ? (
                    `Investing ${numberFormatUSDValue(
                        totalInvestValue,
                    )} into this relic will affect its maturity. It will take an additional ${formatDistanceToNowStrict(
                        new Date(Date.now() + depositImpact.depositImpactTimeInMilliseconds),
                    )} to reach maximum maturity.`
                ) : (
                    <Box w="full">
                        <SkeletonText
                            my="2"
                            startColor="beets.green"
                            endColor="beets.highlight"
                            noOfLines={3}
                            spacing="4"
                            skeletonHeight="2"
                        />
                    </Box>
                )}
            </Alert>
        </Box>
    ) : null;
}
