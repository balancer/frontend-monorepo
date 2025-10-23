import { useSwiperSlide } from 'swiper/react'
import { HStack, Skeleton, VStack, Text, Tooltip, Stack, StackDivider } from '@chakra-ui/react'
import { useReliquary } from '../ReliquaryProvider'
import { numberFormatUSDValue } from '~/lib/util/number-formats'
import numeral from 'numeral'
import { InfoButton } from '~/components/info-button/InfoButton'
import TokenAvatar from '~/components/token/TokenAvatar'
import { useReliquaryGlobalStats } from '../lib/useReliquaryGlobalStats'
import { motion } from 'framer-motion'
import { useRelicDepositBalance } from '../lib/useRelicDepositBalance'

export default function RelicSlideInfo() {
  const { isActive } = useSwiperSlide()
  const {
    isLoadingRelicPositions,
    selectedRelicLevel,
    selectedRelic,
    weightedTotalBalance,
    beetsPerDay,
    isLoading,
    selectedRelicApr,
  } = useReliquary()
  const { relicBalanceUSD } = useRelicDepositBalance()
  const { data: globalStats, loading: isLoadingGlobalStats } = useReliquaryGlobalStats()
  const weightedRelicAmount =
    parseFloat(selectedRelic?.amount || '0') * (selectedRelicLevel?.allocationPoints || 0)
  const relicShare = globalStats && selectedRelic ? weightedRelicAmount / weightedTotalBalance : 0

  const dynamicDataAprItems = pool.dynamicData.aprItems.map(item => {
    if (item.title === 'BEETS reward APR' && item.type === 'STAKING_BOOST') {
      return {
        ...item,
        apr: parseFloat(selectedRelicApr),
      }
    } else {
      return item
    }
  })

  const [, maxTotal] = getTotalApr(dynamicDataAprItems)
  const relicYieldPerDay = (relicBalanceUSD * maxTotal) / 365

  const [_isLoadingRelicPositions, setIsLoadingRelicPositions] = useState(false)

  // hack to get around next.js hydration issues with swiper
  useEffect(() => {
    setIsLoadingRelicPositions(isLoadingRelicPositions)
  }, [isLoadingRelicPositions])

  return (
    <Stack
      divider={<StackDivider />}
      right={{ base: '0', lg: '-41.25%' }}
      height="full"
      top="0"
      rounded="md"
      position={{ base: 'relative', lg: 'absolute' }}
      spacing="4"
      width={{ base: '100%', lg: '60%' }}
      alignItems="flex-start"
      background="box.500"
      boxShadow="0px 0px 0px 1px #00000005,1px 1px 1px -0.5px #0000000F,3px 3px 3px -1.5px #0000000F,6px 6px 6px -3px #0000000F,12px 12px 12px -6px #0000000F,24px 24px 24px -12px #0000001A,-0.5px -1px 0px 0px #FFFFFF26"
      p="4"
      hidden={!isActive}
      as={motion.div}
      animate={{
        opacity: isActive ? 1 : 0,
        transform: `scale(${isActive ? '1' : '0.75'})`,
        transition: { delay: 0.1 },
      }}
    >
      <VStack spacing="0" h="50%" w="full" alignItems="flex-start">
        <InfoButton
          labelProps={{
            lineHeight: '1rem',
            fontWeight: 'semibold',
            fontSize: 'md',
            color: 'beets.base.50',
          }}
          label="Relic share"
          infoText={`The size of your relic relative to all value stored in relics. Your staked share represents the percent of liquidity incentives you are entitled to.`}
        />
        <VStack alignItems="flex-start">
          {isLoading || isLoadingGlobalStats ? (
            <Skeleton height="34px" width="140px" mt="4px" mb="4px" />
          ) : (
            <Text color="white" fontSize="1.75rem">
              {relicShare < 0.0001 ? '< 0.01%' : numeral(relicShare).format('0.00%')}
            </Text>
          )}
          {isLoading || isLoadingGlobalStats ? (
            <Skeleton height="16px" width="45px" />
          ) : (
            <Text fontSize="1rem" lineHeight="1rem">
              {numeral(weightedRelicAmount).format('0.00a')}
              {' / '}
              {numeral(weightedTotalBalance).format('0.00a')}{' '}
              <Text as="span" fontSize="md" color="beets.base.50">
                maBEETS
              </Text>
            </Text>
          )}
        </VStack>
      </VStack>
      <VStack spacing="0" h="50%" w="full" alignItems="flex-start">
        <InfoButton
          labelProps={{
            lineHeight: '1rem',
            fontWeight: 'semibold',
            fontSize: 'md',
            color: 'beets.base.50',
          }}
          label="My potential daily yield"
          infoText="The potential daily value is an approximation based on swap fees, bi-weekly vote incentives to be received, current token prices and your staked share. A number of external factors can influence this value from second to second."
        />
        {isLoading ? (
          <Skeleton height="34px" width="140px" mt="4px" mb="4px" />
        ) : (
          <Text color="white" fontSize="1.75rem">
            {numberFormatUSDValue(relicYieldPerDay)}
          </Text>
        )}
        {/* {beetsPerDay > 0 && (
                    <HStack spacing="1" mb="0.5">
                        <TokenAvatar height="20px" width="20px" address={networkConfig.beets.address} />
                        <Tooltip label={`BEETS emissions for reliquary are calculated per second.`}>
                            <Text fontSize="1rem" lineHeight="1rem">
                                {numeral(relicShare * beetsPerDay).format('0,0.000')} / day
                            </Text>
                        </Tooltip>
                    </HStack>
                )} */}
      </VStack>
    </Stack>
  )
}
