'use client'

import { useQuery } from '@apollo/client'
import { Box, HStack, Stack, VStack } from '@chakra-ui/react'
import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'
import ButtonGroup, {
  ButtonGroupOption,
} from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import {
  GetReliquaryFarmSnapshotsDocument,
  GqlPoolSnapshotDataRange,
} from '@repo/lib/shared/services/api/generated/graphql'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { ReliquaryLiquidityChart } from './ReliquaryLiquidityChart'
import { ReliquaryMaBEETSLevelChart } from './ReliquaryMaBEETSLevelChart'
import { ReliquaryMaturityChart } from './ReliquaryMaturityChart'
import { ReliquaryRelicsCountChart } from './ReliquaryRelicsCountChart'

const chartTypeOptions: ButtonGroupOption[] = [
  { value: 'FB_LEV', label: 'fBEETS', disabled: false },
  { value: 'MAB_LEV', label: 'maBEETS', disabled: false },
  { value: 'RELICS', label: 'Relics', disabled: false },
  { value: 'TVL', label: 'TVL', disabled: false },
]

const rangeOptions: ButtonGroupOption[] = [
  { value: 'THIRTY_DAYS', label: '30d', disabled: false },
  { value: 'NINETY_DAYS', label: '90d', disabled: false },
  { value: 'ONE_HUNDRED_EIGHTY_DAYS', label: '180d', disabled: false },
  { value: 'ONE_YEAR', label: '1y', disabled: false },
  { value: 'ALL_TIME', label: 'All', disabled: false },
]

export function ReliquaryDetailsCharts() {
  const [selectedChartOption, setSelectedChartOption] = useState<ButtonGroupOption>(
    chartTypeOptions[0]
  )

  const [selectedRangeOption, setRangeOption] = useState<ButtonGroupOption>(rangeOptions[0])
  const networkConfig = useNetworkConfig()

  const { data } = useQuery(GetReliquaryFarmSnapshotsDocument, {
    variables: {
      id: networkConfig.reliquary?.fbeets.farmId.toString() || '',
      chain: networkConfig.chain,
      range: selectedRangeOption.value as GqlPoolSnapshotDataRange,
    },
  })

  return (
    <VStack h="full" p={{ base: 'sm', md: 'md' }} w="full">
      <Stack direction={{ base: 'column', md: 'row' }} w="full" wrap="wrap">
        <HStack gap="10px" wrap="wrap">
          <ButtonGroup
            currentOption={selectedChartOption}
            groupId="reliquary-chart"
            onChange={value => setSelectedChartOption(value)}
            options={chartTypeOptions}
            size="xxs"
          />
          {selectedChartOption.value !== 'FB_LEV' && selectedChartOption.value !== 'MAB_LEV' && (
            <ButtonGroup
              currentOption={selectedRangeOption}
              groupId="reliquary-range"
              onChange={value => setRangeOption(value)}
              options={rangeOptions}
              size="xxs"
            />
          )}
        </HStack>
      </Stack>
      <Box h="full" overflow="hidden" position="relative" w="full">
        <AnimatePresence mode="wait">
          <motion.div
            animate={{ x: '0%' }}
            exit={{ x: '-100%' }}
            initial={{ x: '100%' }}
            key={selectedChartOption.value}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {selectedChartOption.value === 'FB_LEV' && <ReliquaryMaturityChart />}
            {selectedChartOption.value === 'MAB_LEV' && <ReliquaryMaBEETSLevelChart />}
            {selectedChartOption.value === 'TVL' && (
              <ReliquaryLiquidityChart data={data?.snapshots || []} />
            )}
            {selectedChartOption.value === 'RELICS' && (
              <ReliquaryRelicsCountChart data={data?.snapshots || []} />
            )}
          </motion.div>
        </AnimatePresence>
      </Box>
    </VStack>
  )
}
