import { Box, HStack, Text } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { RelicNFT } from '~/modules/reliquary/components/unused/RelicNFT';
import { RelicStats } from '~/modules/reliquary/components/unused/RelicStats';
import { RelicHeader } from '~/modules/reliquary/components/unused/RelicHeader';
import { motion } from 'framer-motion';
import useReliquary from '../../lib/useReliquary';
import { relicGetMaturityProgress } from '../../lib/reliquary-helpers';
import { useToast } from '~/components/toast/BeetsToast';
import { PoolProvider, usePool } from '~/modules/pool/lib/usePool';
import RelicLevelUpButton from '../RelicLevelUpButton';

export function Relic() {
    const { selectedRelic, maturityThresholds } = useReliquary();
    const { pool } = usePool();
    const { canUpgrade, canUpgradeTo } = relicGetMaturityProgress(selectedRelic, maturityThresholds);

    const { showToast, removeToast } = useToast();

    useEffect(() => {
        if (canUpgrade && selectedRelic) {
            showToast({
                id: 'relic-level-up',
                content: (
                    <HStack spacing="4">
                        <Text>You can upgrade your relic to {canUpgradeTo}</Text>
                        <PoolProvider pool={pool}>
                            <RelicLevelUpButton />
                        </PoolProvider>
                    </HStack>
                ),
            });
        }
        if (!canUpgrade) {
            removeToast('relic-level-up');
        }
    }, [canUpgrade]);

    return (
        <Box as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} width="full" mt="4" position="relative">
            <RelicHeader />
            <HStack
                flexDirection={{ base: 'column-reverse', md: 'row' }}
                position="relative"
                width="full"
                alignItems="flex-start"
                spacing="0"
                height="full"
            >
                <Box width={{ base: 'full', md: '50%' }} mt={{ base: '0', md: '8' }}>
                    <RelicStats />
                </Box>
                <HStack
                    position={{ base: 'relative', md: 'sticky' }}
                    top={{ base: '0px', md: '50px' }}
                    flex={1}
                    alignItems="center"
                    justifyContent="center"
                >
                    <Box position="relative" mt={{ base: '0', md: '12' }}>
                        <RelicNFT />
                    </Box>
                </HStack>
            </HStack>
        </Box>
    );
}
