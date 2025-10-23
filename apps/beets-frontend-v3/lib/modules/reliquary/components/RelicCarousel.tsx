import { Swiper, SwiperSlide } from 'swiper/react';
import { useEffect, useState } from 'react';
import { Pagination } from 'swiper';
import { Box, BoxProps, Heading, VStack, Flex, useBreakpointValue } from '@chakra-ui/react';
import useReliquary from '../lib/useReliquary';
import { ReliquaryInvestModal } from '~/modules/reliquary/invest/ReliquaryInvestModal';
import RelicSlide from './RelicSlide';
import { ReliquaryWithdrawModal } from '~/modules/reliquary/withdraw/ReliquaryWithdrawModal';

interface Props extends BoxProps {
    loading?: boolean;
}

export function RelicCarousel({ loading, ...rest }: Props) {
    const { relicPositionsForFarmId: relicPositions, isLoadingRelicPositions, selectedRelic } = useReliquary();
    // hack to get around next.js hydration issues with swiper
    const [_isLoadingRelicPositions, setIsLoadingRelicPositions] = useState(false);

    const [isInvestModalVisible, setIsInvestModalVisible] = useState(false);
    const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);

    const isMobile = useBreakpointValue({ base: true, lg: false });
    const hasNoRelics = relicPositions.length === 0;

    // hack to get around next.js hydration issues with swiper
    useEffect(() => {
        setIsLoadingRelicPositions(isLoadingRelicPositions);
    }, [isLoadingRelicPositions]);
    return (
        <Box position="relative" minH="300px">
            {hasNoRelics && !_isLoadingRelicPositions && (
                <Flex justifyContent="center" zIndex={2} width="full" alignItems="center" height="300px">
                    <VStack spacing="4" alignItems="center" height="full" justifyContent="center">
                        <Heading size="md">Get started by minting your own relic</Heading>
                        <Box>
                            <ReliquaryInvestModal
                                createRelic
                                activatorProps={{ size: 'lg', width: '200px', mx: 'auto' }}
                            />
                        </Box>
                    </VStack>
                </Flex>
            )}
            <Box
                sx={{
                    '.swiper-pagination': {
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        bottom: isMobile ? 350 : -5,
                    },
                    '.swiper': {
                        paddingBottom: '6',
                        overflow: 'visible',
                    },
                    '.swiper-slide': {
                        transition: 'transform 300ms',
                    },
                    '.swiper-slide-next': {
                        transform: 'scale(1)',
                        opacity: '1',
                        zIndex: -1,
                    },
                    '.swiper-slide-active': {
                        transform: 'scale(1)',
                        opacity: '1',
                        zIndex: 1,
                    },
                }}
                {...rest}
                position="relative"
            >
                <Swiper
                    slidesPerView={1}
                    spaceBetween={isMobile ? 10 : -300}
                    centeredSlides
                    breakpoints={{
                        1024: { slidesPerView: 3 },
                    }}
                    pagination={{
                        clickable: true,
                    }}
                    allowTouchMove={isMobile}
                    modules={[Pagination]}
                    onClick={(swiper) => swiper.slideTo(swiper.clickedIndex)}
                >
                    {relicPositions.map((relic) => (
                        <SwiperSlide key={`relic-carousel-${relic.relicId}`}>
                            <RelicSlide
                                openInvestModal={() => setIsInvestModalVisible(true)}
                                openWithdrawModal={() => setIsWithdrawModalVisible(true)}
                                relic={relic}
                            />
                        </SwiperSlide>
                    ))}
                    {/* {!relicPositions.length && (
                        <SwiperSlide key={`dummy-slide`}>
                            <RelicSlide
                                openInvestModal={() => setIsInvestModalVisible(true)}
                                openWithdrawModal={() => setIsWithdrawModalVisible(true)}
                                relic={relicPositions[0]}
                            />
                        </SwiperSlide>
                    )} */}
                </Swiper>
            </Box>
            <ReliquaryInvestModal
                onClose={() => setIsInvestModalVisible(false)}
                isVisible={isInvestModalVisible}
                noActivator
            />
            <ReliquaryWithdrawModal
                onClose={() => setIsWithdrawModalVisible(false)}
                isVisible={isWithdrawModalVisible}
                noActivator
            />
        </Box>
    );
}
