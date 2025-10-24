import {
  Badge,
  Box,
  Button,
  HStack,
  Portal,
  Skeleton,
  Stack,
  StackDivider,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { BarChart } from 'react-feather'
import { useSwiperSlide } from 'swiper/react'
import AprTooltip from '~/components/apr-tooltip/AprTooltip'
import { BeetsSubmitTransactionButton } from '~/components/button/BeetsSubmitTransactionButton'
import { InfoButton } from '~/components/info-button/InfoButton'
import TokenAvatar from '~/components/token/TokenAvatar'
import BeetsTooltip from '~/components/tooltip/BeetsTooltip'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { getTotalApr } from '@repo/lib/modules/pool/pool.utils'
import { useBatchRelayerHasApprovedForAll } from '../lib/useBatchRelayerHasApprovedForAll'
import { useRelicHarvestRewards } from '../lib/useRelicHarvestRewards'
import { useRelicPendingRewards } from '../lib/useRelicPendingRewards'
import { useReliquary } from '../ReliquaryProvider'
import RelicMaturityModal from './RelicMaturityModal'
import { ReliquaryBatchRelayerApprovalButton } from './ReliquaryBatchRelayerApprovalButton'
import { useGetHHRewards } from '~/modules/reliquary/lib/useGetHHRewards'
import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'

export default function RelicSlideApr() {
  const { pool } = usePool()
  const { isActive } = useSwiperSlide()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { selectedRelicLevel, selectedRelicApr } = useReliquary()
  const { data, isLoading } = useGetHHRewards()
  const { harvest, ...harvestQuery } = useRelicHarvestRewards()

  const {
    data: pendingRewards = [],
    refetch: refetchPendingRewards,
    isLoading: isLoadingPendingRewards,
  } = useRelicPendingRewards()

  // // hack to get around next.js hydration issues with swiper
  // useEffect(() => {
  //   setIsLoadingRelicPositions(isLoadingRelicPositions)
  // }, [isLoadingRelicPositions])

  const { data: batchRelayerHasApprovedForAll, refetch } = useBatchRelayerHasApprovedForAll()
  const { priceFor } = useTokens()
  const config = useNetworkConfig()
  // Calculate USD value of pending rewards
  const pendingRewardsUsdValue = pendingRewards.reduce((sum: number, reward: any) => {
    const price = priceFor(reward.address, config.chain)
    return sum + parseFloat(reward.amount) * price
  }, 0)

  const baseApr = pool.dynamicData.aprItems.find(
    item => item.title === 'BEETS reward APR' && item.type === 'MABEETS_EMISSIONS'
  )

  // show selected relic (beets) apr in tooltip
  const dynamicDataAprItems = pool.dynamicData.aprItems.map(item => {
    if (item.title === 'BEETS reward APR' && item.type === 'STAKING_BOOST') {
      return {
        ...item,
        title: 'BEETS reward APR2',
        apr: parseFloat(selectedRelicApr) - (baseApr?.apr || 0),
      }
    } else if (item.title === 'Voting APR Boost' && item.type === 'STAKING_BOOST') {
      return {
        ...item,
        apr: item.apr * ((selectedRelicLevel?.allocationPoints || 0) / 100),
      }
    } else {
      return item
    }
  })

  const [, maxTotal] = getTotalApr(dynamicDataAprItems)
  const maxTotalFormatted = fNum('apr', maxTotal.toString())

  return (
    <>
      <Stack
        alignItems="flex-start"
        animate={{
          opacity: isActive ? 1 : 0,
          transform: `scale(${isActive ? '1' : '0.75'})`,
          transition: { delay: 0.1 },
        }}
        as={motion.div}
        background="box.500"
        boxShadow="0px 0px 0px 1px #00000005,1px 1px 1px -0.5px #0000000F,3px 3px 3px -1.5px #0000000F,6px 6px 6px -3px #0000000F,12px 12px 12px -6px #0000000F,24px 24px 24px -12px #0000001A,-0.5px -1px 0px 0px #FFFFFF26"
        divider={<StackDivider />}
        height="full"
        hidden={!isActive}
        left={{ base: '0', lg: '-42.5%' }}
        p="4"
        position={{ base: 'relative', lg: 'absolute' }}
        rounded="md"
        spacing="4"
        top="0"
        width={{ base: '100%', lg: '60%' }}
        // minHeight="310px"
        // justifyContent="stretch"
      >
        <VStack alignItems="flex-start" h="50%" height="50%" spacing="0" w="full">
          <Text color="beets.base.50" fontSize="md" fontWeight="semibold" lineHeight="1rem">
            Relic APR
          </Text>
          <HStack>
            <div className="apr-stripes">{maxTotalFormatted}</div>
            <AprTooltip apr={maxTotalFormatted} items={dynamicDataAprItems} onlySparkles />
          </HStack>
          <HStack>
            <HStack
              backgroundColor="beets.light"
              px="3"
              py="0.5"
              rounded="md"
              whiteSpace="nowrap"
              width={{ base: 'min-content' }}
            >
              <Text fontWeight="semibold">Maturity boost</Text>
              <Badge bg="none" colorScheme="green" p="1">
                {selectedRelicLevel?.allocationPoints}x
              </Badge>
            </HStack>
            <BeetsTooltip label="Click here to see the maturity curve." noImage>
              <Button height="full" onClick={onOpen} p="1.5">
                <BarChart height="18px" />
              </Button>
            </BeetsTooltip>
          </HStack>
        </VStack>
        {!pendingRewardsUsdValue && (
          <Box height="50%" position="relative" width="full">
            {isLoading && <Skeleton h="100%" rounded="md" w="100%" />}
            {!isLoading && data && (
              <>
                <VStack alignItems="flex-start" height="full" spacing="0" width="full">
                  <Text color="beets.base.50" fontSize="md" fontWeight="semibold" lineHeight="1rem">
                    Hidden Hand incentives
                  </Text>
                  <Text color="white" fontSize="1.75rem">
                    {fNum('fiat', data.totalValue)}
                  </Text>
                </VStack>
                <Button
                  bottom="0"
                  left="0"
                  onClick={() => window.open('https://hiddenhand.finance/rewards', '_blank')}
                  position="absolute"
                  variant="primary"
                  w="full"
                >
                  Claim incentives on Hidden Hand
                </Button>
              </>
            )}
          </Box>
        )}
        {pendingRewardsUsdValue && (
          <VStack
            alignItems="flex-start"
            flexGrow="1"
            height="50%"
            pt={{ base: '1', lg: undefined }}
            w="full"
          >
            <HStack alignItems="flex-start" flexGrow="1" spacing="12" width="full">
              <VStack alignItems="flex-start" spacing="0">
                <InfoButton
                  infoText={`Your accumulated liquidity incentives for this relic. At any time you can claim your rewards as long as the amount is more than $0.01`}
                  label="My pending rewards"
                  labelProps={{
                    lineHeight: '1rem',
                    fontWeight: 'semibold',
                    fontSize: 'sm',
                  }}
                />
                {isLoadingPendingRewards ? (
                  <Skeleton height="34px" mb="4px" mt="4px" width="140px" />
                ) : (
                  <Text color="white" fontSize="1.75rem">
                    {fNum('fiat', pendingRewardsUsdValue)}
                  </Text>
                )}
                <Box>
                  {pendingRewards.map((reward: any, index: number) => (
                    <HStack
                      key={index}
                      mb={index === pendingRewards.length - 1 ? '0' : '0.5'}
                      spacing="1"
                    >
                      <TokenAvatar address={reward.address} height="20px" width="20px" />
                      <Skeleton isLoaded={!isLoadingPendingRewards}>
                        <Text fontSize="1rem" lineHeight="1rem">
                          {fNum('token', reward.amount)}
                        </Text>
                      </Skeleton>
                    </HStack>
                  ))}
                </Box>
              </VStack>
            </HStack>
            {!batchRelayerHasApprovedForAll ? (
              <BeetsTooltip label="To claim your pending rewards, you first need to approve the batch relayer.">
                <Box w="full">
                  <ReliquaryBatchRelayerApprovalButton
                    onConfirmed={() => {
                      refetch()
                    }}
                  />
                </Box>
              </BeetsTooltip>
            ) : (
              <BeetsSubmitTransactionButton
                fullWidth
                variant="primary"
                width="full"
                {...harvestQuery}
                disabled={pendingRewardsUsdValue < 0.01}
                onClick={harvest}
                onConfirmed={() => {
                  refetchPendingRewards()
                }}
              >
                Claim now
              </BeetsSubmitTransactionButton>
            )}
          </VStack>
        )}
      </Stack>
      <Portal>
        <RelicMaturityModal isOpen={isOpen} onClose={onClose} />
      </Portal>
    </>
  )
}
