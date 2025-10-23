import { useSwiperSlide } from 'swiper/react';
import { useEffect, useState } from 'react';
import { Badge, Box, Heading, HStack, VStack, Flex, Stack, Button } from '@chakra-ui/react';
import useReliquary from '../lib/useReliquary';
import { AnimatePresence, motion } from 'framer-motion';
import { ReliquaryFarmPosition } from '~/lib/services/staking/reliquary.service';
import { relicGetMaturityProgress } from '../lib/reliquary-helpers';
import RelicLevelUpButton from './RelicLevelUpButton';
import RelicSlideApr from './RelicSlideApr';
import RelicSlideInfo from './RelicSlideInfo';
import RelicSlideMainInfo from './RelicSlideMainInfo';
import Image from 'next/image';
import RelicLevel1 from '~/assets/images/reliquary/1.png';
import RelicLevel2 from '~/assets/images/reliquary/2.png';
import RelicLevel3 from '~/assets/images/reliquary/3.png';
import RelicLevel4 from '~/assets/images/reliquary/4.png';
import RelicLevel5 from '~/assets/images/reliquary/5.png';
import RelicLevel6 from '~/assets/images/reliquary/6.png';
import RelicLevel7 from '~/assets/images/reliquary/7.png';
import RelicLevel8 from '~/assets/images/reliquary/8.png';
import RelicLevel9 from '~/assets/images/reliquary/9.png';
import RelicLevel10 from '~/assets/images/reliquary/10.png';
import RelicLevel11 from '~/assets/images/reliquary/11.png';
import RelicBurnButton from './RelicBurnButton';

export interface RelicSlideProps {
    relic: ReliquaryFarmPosition;
    openInvestModal: () => void;
    openWithdrawModal: () => void;
}

export default function RelicSlide({ relic, openInvestModal, openWithdrawModal }: RelicSlideProps) {
    const { isActive } = useSwiperSlide();

    const { maturityThresholds, isLoadingRelicPositions, setSelectedRelicId, relicPositions } = useReliquary();
    const { canUpgrade } = relicGetMaturityProgress(relic, maturityThresholds);
    const [_isLoadingRelicPositions, setIsLoadingRelicPositions] = useState(false);

    const relicLevelNames = [
        'The Initiate',
        'The Neophyte',
        'The Wanderer',
        'The Rebel',
        'The Skeptic',
        'The Apprentice',
        'The Journeyman',
        'The Savant',
        'The Creator',
        'The Scholar',
        'The Awakened',
    ];

    // hack to get around next.js hydration issues with swiper
    useEffect(() => {
        setIsLoadingRelicPositions(isLoadingRelicPositions);
    }, [isLoadingRelicPositions]);

    const hasNoRelics = relicPositions.length === 0;

    const isRelicAmountZero = relic.amount === '0.0';

    if (isActive) {
        setSelectedRelicId(relic.relicId);
    }

    function getImage(level: number) {
        switch (level) {
            case 1:
                return RelicLevel1;
            case 2:
                return RelicLevel2;
            case 3:
                return RelicLevel3;
            case 4:
                return RelicLevel4;
            case 5:
                return RelicLevel5;
            case 6:
                return RelicLevel6;
            case 7:
                return RelicLevel7;
            case 8:
                return RelicLevel8;
            case 9:
                return RelicLevel9;
            case 10:
                return RelicLevel10;
            case 11:
                return RelicLevel11;
            default:
                return RelicLevel1;
        }
    }

    function getContainerOpacity() {
        if (hasNoRelics) {
            return 0.25;
        }
        if (isActive) {
            return 1;
        } else {
            return 0.35;
        }
    }

    function getUnderglowClass() {
        if (isActive) return '';
        if (isActive) {
            return 'relic-glow';
        }
        return '';
    }

    return (
        <AnimatePresence>
            <VStack
                filter="auto"
                blur={hasNoRelics ? '10px' : '0'}
                as={motion.div}
                animate={{
                    opacity: getContainerOpacity(),
                    transform: isActive ? 'scale(1)' : 'scale(0.5)',
                    transition: { type: 'spring', mass: 0.1 },
                }}
                rounded="lg"
                spacing="8"
                zIndex={isActive ? 1 : -1}
            >
                <Flex justifyContent="center" width={{ base: '100%', lg: '50%' }} rounded="lg">
                    <HStack
                        spacing="4"
                        width="full"
                        alignItems="start"
                        justifyContent={{ base: 'space-between', xl: undefined }}
                    >
                        <Badge rounded="md" colorScheme="green" p="2">
                            <Heading textAlign="center" size="sm">
                                {isRelicAmountZero
                                    ? 'Empty relic - no level'
                                    : `Level ${relic?.level + 1} - ${relicLevelNames[relic.level]}`}
                            </Heading>
                        </Badge>
                        <Badge p="2" rounded="md" colorScheme="purple">
                            <Heading size="sm">Relic #{relic?.relicId}</Heading>
                        </Badge>
                    </HStack>
                </Flex>
                <Flex position="relative" className={getUnderglowClass()} as={motion.div}>
                    {canUpgrade && isActive && !isRelicAmountZero && (
                        <Flex
                            animate={{ opacity: 1 }}
                            initial={{ opacity: 0 }}
                            exit={{ opacity: 0 }}
                            alignItems="center"
                            justifyContent="center"
                            rounded="lg"
                            width="full"
                            height="full"
                            position="absolute"
                            bg="blackAlpha.500"
                            as={motion.div}
                            zIndex={2}
                        >
                            <RelicLevelUpButton />
                        </Flex>
                    )}

                    {isActive && isRelicAmountZero && (
                        <Flex
                            animate={{ opacity: 1 }}
                            initial={{ opacity: 0 }}
                            exit={{ opacity: 0 }}
                            alignItems="center"
                            justifyContent="center"
                            rounded="lg"
                            width="full"
                            height="full"
                            position="absolute"
                            bg="blackAlpha.500"
                            as={motion.div}
                            zIndex={2}
                        >
                            <HStack w="full" spacing="2" justifyContent="center">
                                <Button variant="primary" size="md" rounded="lg" onClick={openInvestModal} w="100px">
                                    Deposit
                                </Button>
                                <RelicBurnButton size="md" rounded="lg" w="100px" />
                            </HStack>
                        </Flex>
                    )}

                    <Box
                        filter="auto"
                        blur={isActive && canUpgrade && !_isLoadingRelicPositions ? '10px' : '0px'}
                        style={{ marginTop: '0 !important' }}
                        rounded="lg"
                        overflow="hidden"
                    >
                        <Image
                            style={{ cursor: 'pointer' }}
                            src={getImage(relic?.level + 1)}
                            width="400px"
                            height="400px"
                            alt="reliquary"
                            placeholder="blur"
                        />
                    </Box>
                </Flex>

                <Stack direction={{ base: 'column', lg: 'row' }} position="relative" height="310px" width="full">
                    {isActive && !isRelicAmountZero && (
                        <>
                            <RelicSlideMainInfo
                                openInvestModal={openInvestModal}
                                openWithdrawModal={openWithdrawModal}
                                isLoading={_isLoadingRelicPositions}
                            />
                            <RelicSlideApr />
                            <RelicSlideInfo />
                        </>
                    )}
                    {isActive && isRelicAmountZero && (
                        <VStack alignItems="center" justifyContent="center" w="full">
                            <Heading>No stats available for empty relics</Heading>
                        </VStack>
                    )}
                </Stack>
            </VStack>
        </AnimatePresence>
    );
}
