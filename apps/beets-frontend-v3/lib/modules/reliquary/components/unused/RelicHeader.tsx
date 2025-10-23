import { Badge, Box, Button, Flex, Heading, HStack, Text } from '@chakra-ui/react';
import { ReliquaryInvestModal } from '~/modules/reliquary/invest/ReliquaryInvestModal';
import { ReliquaryWithdrawModal } from '~/modules/reliquary/withdraw/ReliquaryWithdrawModal';
import React, { useEffect, useState } from 'react';
import AnimatedProgress from '~/components/animated-progress/AnimatedProgress';
import useReliquary from '~/modules/reliquary/lib/useReliquary';
import { relicGetMaturityProgress } from '~/modules/reliquary/lib/reliquary-helpers';
import { formatDistance } from 'date-fns';

export function RelicHeader() {
    const { maturityThresholds, selectedRelic, isLoading } = useReliquary();
    const { progressToNextLevel, isMaxMaturity, entryDate, levelUpDate } = relicGetMaturityProgress(
        selectedRelic,
        maturityThresholds,
    );
    const [levelUpCountdown, setLevelUpCountdown] = useState('');
    //TODO: fix this

    useEffect(() => {
        let interval: NodeJS.Timer;
        if (!isLoading) {
            interval = setInterval(() => {
                setLevelUpCountdown(formatDistance(levelUpDate, entryDate, { includeSeconds: true }));
            }, 1000);
        }

        return () => {
            clearInterval(interval);
        };
    }, [isLoading]);

    return (
        <Flex
            width="full"
            flexDirection={{ base: 'column', md: 'row' }}
            alignItems={{ base: 'flex-start', md: 'flex-end' }}
        >
            <Box width="full" flex="1">
                <Heading size="lg">My Relic: #{selectedRelic?.relicId}</Heading>
                <HStack
                    width={{ base: 'full', md: '50%' }}
                    pt="4"
                    position="relative"
                    spacing="0"
                    justifyContent="flex-start"
                >
                    <HStack
                        px="3"
                        py="0.5"
                        rounded="md"
                        backgroundColor="beets.light"
                        width={{ base: 'min-content' }}
                        whiteSpace="nowrap"
                    >
                        <Text fontWeight="semibold">Level {(selectedRelic?.level || 0) + 1}</Text>
                        {isMaxMaturity && (
                            <Badge bg="none" colorScheme="green" p="1">
                                MAX LEVEL
                            </Badge>
                        )}
                        {!isMaxMaturity && (
                            <Badge bg="none" colorScheme="green" p="1">
                                {levelUpCountdown}
                            </Badge>
                        )}
                    </HStack>
                    {!isMaxMaturity && (
                        <AnimatedProgress
                            value={progressToNextLevel}
                            width="100%"
                            borderTopRightRadius="lg"
                            borderBottomRightRadius="lg"
                            borderTopLeftRadius="none"
                            borderBottomLeftRadius="none"
                        />
                    )}

                    {/* <Box display='inline-block' width="max-content" p="1" bg="whiteAlpha.200" rounded="md">

                        {isMaxMaturity && <Text>MAX LEVEL</Text>}
                    </Box> */}
                </HStack>
            </Box>
            <Box width={{ base: 'full', md: 'fit-content' }} mt={{ base: '4', md: '0' }}>
                <HStack>
                    <ReliquaryInvestModal />
                    <ReliquaryWithdrawModal />
                </HStack>
            </Box>
        </Flex>
    );
}
