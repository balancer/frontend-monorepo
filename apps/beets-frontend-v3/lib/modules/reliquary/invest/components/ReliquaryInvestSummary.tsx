import { Box, BoxProps, Heading, HStack, VStack } from '@chakra-ui/react';
import AprTooltip from '~/components/apr-tooltip/AprTooltip';
import { numberFormatUSDValue } from '~/lib/util/number-formats';
import { useReliquaryInvest } from '~/modules/reliquary/invest/lib/useReliquaryInvest';
import { usePool } from '~/modules/pool/lib/usePool';
import React from 'react';

interface Props extends BoxProps {}

export function ReliquaryInvestSummary({ ...rest }: Props) {
    const { pool, totalApr } = usePool();
    const { totalInvestValue } = useReliquaryInvest();
    const weeklyYield = (totalInvestValue * totalApr) / 52;

    return (
        <VStack spacing="4" width="full" p="4" rounded="md">
            <HStack spacing="8">
                <Box>
                    <Heading size="sm" textAlign="center">
                        Your investment total is
                    </Heading>
                    <Heading color="beets.green" textAlign="center">
                        {numberFormatUSDValue(totalInvestValue)}
                    </Heading>
                </Box>
                <Box>
                    <Heading size="sm" textAlign="center">
                        Potential weekly yield
                    </Heading>
                    <HStack justifyContent="center">
                        <Heading color="beets.highlight" textAlign="center">
                            {numberFormatUSDValue(weeklyYield)}
                        </Heading>
                        <AprTooltip items={pool.dynamicData.aprItems} onlySparkles={true} sparklesSize="sm" />
                    </HStack>
                </Box>
            </HStack>
        </VStack>
    );
}
