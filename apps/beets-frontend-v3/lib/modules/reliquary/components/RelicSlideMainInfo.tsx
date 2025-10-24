import { Box, Button, VStack, Text, HStack, Badge, Stack, StackDivider } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import React from 'react'
import Countdown from 'react-countdown'
import { useSwiperSlide } from 'swiper/react'
import AnimatedProgress from '~/components/animated-progress/AnimatedProgress'
import TokenAvatar from '~/components/token/TokenAvatar'
import BeetsTooltip from '~/components/tooltip/BeetsTooltip'
import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'
import { tokenFormatAmount } from '~/lib/services/token/token-util'
import { numberFormatUSDValue } from '~/lib/util/number-formats'
import { relicGetMaturityProgress } from '../lib/reliquary-helpers'
import { useRelicDepositBalance } from '../lib/useRelicDepositBalance'
import { useReliquary } from '../ReliquaryProvider'

interface Props {
  isLoading?: boolean
}

export default function RelicSlideMainInfo({ isLoading }: Props) {
  const { isActive } = useSwiperSlide()
  const { relicPositions, selectedRelic, maturityThresholds } = useReliquary()
  const config = useNetworkConfig()
  const { relicBalanceUSD } = useRelicDepositBalance()

  const { progressToNextLevel, levelUpDate, isMaxMaturity } = relicGetMaturityProgress(
    selectedRelic,
    maturityThresholds
  )
  const hasNoRelics = relicPositions.length === 0

  return (
    <Box height="full" width="full">
      {isActive && !isLoading && (
        <Box height="full" position="relative">
          <VStack
            animate={{ opacity: 1, transform: 'scale(1)', transition: { delay: 0.1 } }}
            as={motion.div}
            exit={{ opacity: 0, transform: 'scale(0.75)' }}
            height="full"
            initial={{ opacity: 0, transform: 'scale(0.75)' }}
            overflow="hidden"
            position="relative"
          >
            <Stack
              background="box.500"
              boxShadow="0px 0px 0px 1px #00000005,1px 1px 1px -0.5px #0000000F,3px 3px 3px -1.5px #0000000F,6px 6px 6px -3px #0000000F,12px 12px 12px -6px #0000000F,24px 24px 24px -12px #0000001A,-0.5px -1px 0px 0px #FFFFFF26"
              divider={<StackDivider />}
              height="full"
              p="4"
              rounded="md"
              width={{ base: '100%', lg: '60%' }}
            >
              <VStack alignItems="flex-start" h="50%" spacing="0" w="full">
                <Box>
                  <Text color="beets.base.50" fontSize="md" fontWeight="semibold" lineHeight="1rem">
                    Relic liquidity
                  </Text>
                  <Text color="white" fontSize="1.75rem">
                    {numberFormatUSDValue(relicBalanceUSD)}
                  </Text>
                </Box>
                <HStack mb="0.5" spacing="1">
                  <TokenAvatar address={config.fbeets.address} height="20px" width="20px" />
                  <Text fontSize="1rem" lineHeight="1rem">
                    {tokenFormatAmount(selectedRelic?.amount || '0')}
                  </Text>
                </HStack>
              </VStack>
              <VStack h="50%" pt={{ base: '1', lg: undefined }} spacing="0" w="full">
                <VStack alignItems="flex-start" spacing="1" w="full">
                  <Text color="beets.base.50" fontSize="md" fontWeight="semibold" lineHeight="1rem">
                    Level up progress
                  </Text>
                  <VStack alignItems="flex-start" w="full">
                    {!isMaxMaturity ? (
                      <>
                        <HStack color="beets.green" spacing="1">
                          <Text>Next level in</Text>
                          <Countdown date={levelUpDate} />
                        </HStack>
                        <AnimatedProgress
                          color="black"
                          rounded="5"
                          value={progressToNextLevel}
                          w="full"
                        />
                      </>
                    ) : (
                      <BeetsTooltip label="You've achieved the max level, nice!" noImage>
                        <Box>
                          <Badge colorScheme="green">MAX LEVEL</Badge>
                        </Box>
                      </BeetsTooltip>
                    )}
                  </VStack>
                </VStack>
              </VStack>
            </Stack>
          </VStack>
        </Box>
      )}
    </Box>
  )
}
