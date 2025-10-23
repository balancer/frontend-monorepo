import { Swiper, SwiperSlide } from 'swiper/react'
import { useEffect, useState } from 'react'
import { Pagination } from 'swiper/modules'
import { Box, BoxProps, Heading, VStack, Flex, useBreakpointValue } from '@chakra-ui/react'
import { useReliquary } from '../ReliquaryProvider'
//import { ReliquaryInvestModal } from '../invest/ReliquaryInvestModal'
import RelicSlide from './RelicSlide'
//import { ReliquaryWithdrawModal } from '../withdraw/ReliquaryWithdrawModal'

interface Props extends BoxProps {
  loading?: boolean
}

export function RelicCarousel({ loading, ...rest }: Props) {
  const {
    relicPositionsForFarmId: relicPositions,
    isLoadingRelicPositions,
    selectedRelic,
  } = useReliquary()
  // hack to get around next.js hydration issues with swiper
  const [_isLoadingRelicPositions, setIsLoadingRelicPositions] = useState(false)

  const [isInvestModalVisible, setIsInvestModalVisible] = useState(false)
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false)

  const isMobile = useBreakpointValue({ base: true, lg: false })
  const hasNoRelics = relicPositions.length === 0

  // hack to get around next.js hydration issues with swiper
  useEffect(() => {
    setIsLoadingRelicPositions(isLoadingRelicPositions)
  }, [isLoadingRelicPositions])
  return (
    <Box minH="300px" position="relative">
      {hasNoRelics && !_isLoadingRelicPositions && (
        <Flex alignItems="center" height="300px" justifyContent="center" width="full" zIndex={2}>
          <VStack alignItems="center" height="full" justifyContent="center" spacing="4">
            <Heading size="md">Get started by minting your own relic</Heading>
            <Box>
              {/* <ReliquaryInvestModal
                activatorProps={{ size: 'lg', width: '200px', mx: 'auto' }}
                createRelic
              /> */}
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
          allowTouchMove={isMobile}
          breakpoints={{
            1024: { slidesPerView: 3 },
          }}
          centeredSlides
          modules={[Pagination]}
          onClick={swiper => swiper.slideTo(swiper.clickedIndex)}
          pagination={{
            clickable: true,
          }}
          slidesPerView={1}
          spaceBetween={isMobile ? 10 : -300}
        >
          {relicPositions.map(relic => (
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
      {/* <ReliquaryInvestModal
        isVisible={isInvestModalVisible}
        noActivator
        onClose={() => setIsInvestModalVisible(false)}
      />
      <ReliquaryWithdrawModal
        isVisible={isWithdrawModalVisible}
        noActivator
        onClose={() => setIsWithdrawModalVisible(false)}
      /> */}
    </Box>
  )
}
