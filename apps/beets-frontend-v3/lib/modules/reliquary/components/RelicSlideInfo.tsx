import { useSwiperSlide } from 'swiper/react'
import { Skeleton, VStack, Text, Stack, StackDivider } from '@chakra-ui/react'
import { useReliquary } from '../ReliquaryProvider'
import { fNum, fNumCustom } from '@repo/lib/shared/utils/numbers'
import { InfoButton } from '~/components/info-button/InfoButton'
import { useReliquaryGlobalStats } from '../hooks/useReliquaryGlobalStats'
import { motion } from 'framer-motion'
import { useRelicDepositBalance } from '../lib/useRelicDepositBalance'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { getTotalApr } from '@repo/lib/modules/pool/pool.utils'

export default function RelicSlideInfo() {
  const { isActive } = useSwiperSlide()
  const { pool } = usePool()
  const { selectedRelicLevel, selectedRelic, weightedTotalBalance, isLoading, selectedRelicApr } =
    useReliquary()
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
  const relicYieldPerDay = (relicBalanceUSD * maxTotal.toNumber()) / 365

  return (
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
      p="4"
      position={{ base: 'relative', lg: 'absolute' }}
      right={{ base: '0', lg: '-41.25%' }}
      rounded="md"
      spacing="4"
      top="0"
      width={{ base: '100%', lg: '60%' }}
    >
      <VStack alignItems="flex-start" h="50%" spacing="0" w="full">
        <InfoButton
          infoText={`The size of your relic relative to all value stored in relics. Your staked share represents the percent of liquidity incentives you are entitled to.`}
          label="Relic share"
          labelProps={{
            lineHeight: '1rem',
            fontWeight: 'semibold',
            fontSize: 'md',
            color: 'beets.base.50',
          }}
        />
        <VStack alignItems="flex-start">
          {isLoading || isLoadingGlobalStats ? (
            <Skeleton height="34px" mb="4px" mt="4px" width="140px" />
          ) : (
            <Text color="white" fontSize="1.75rem">
              {relicShare < 0.0001 ? '< 0.01%' : fNumCustom(relicShare, '0.00%')}
            </Text>
          )}
          {isLoading || isLoadingGlobalStats ? (
            <Skeleton height="16px" width="45px" />
          ) : (
            <Text fontSize="1rem" lineHeight="1rem">
              {fNumCustom(weightedRelicAmount, '0.00a')}
              {' / '}
              {fNumCustom(weightedTotalBalance, '0.00a')}{' '}
              <Text as="span" color="beets.base.50" fontSize="md">
                maBEETS
              </Text>
            </Text>
          )}
        </VStack>
      </VStack>
      <VStack alignItems="flex-start" h="50%" spacing="0" w="full">
        <InfoButton
          infoText="The potential daily value is an approximation based on swap fees, bi-weekly vote incentives to be received, current token prices and your staked share. A number of external factors can influence this value from second to second."
          label="My potential daily yield"
          labelProps={{
            lineHeight: '1rem',
            fontWeight: 'semibold',
            fontSize: 'md',
            color: 'beets.base.50',
          }}
        />
        {isLoading ? (
          <Skeleton height="34px" mb="4px" mt="4px" width="140px" />
        ) : (
          <Text color="white" fontSize="1.75rem">
            {fNum('fiat', relicYieldPerDay)}
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
