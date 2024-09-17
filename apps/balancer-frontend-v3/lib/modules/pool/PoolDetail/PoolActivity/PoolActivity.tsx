import {
  Card,
  Heading,
  Stack,
  VStack,
  Text,
  HStack,
  Skeleton,
  Box,
  IconButton,
} from '@chakra-ui/react'
import { Maximize2, Minimize2 } from 'react-feather'
import ButtonGroup from '@/lib/shared/components/btns/button-group/ButtonGroup'
import { PoolActivityProvider, usePoolActivity } from './usePoolActivity'
import { PoolActivityChart } from '../PoolActivityChart/PoolActivityChart'
import { PoolActivityTable } from '../PoolActivityTable/PoolActivityTable'
import { PoolActivityViewType } from '../PoolActivityViewType/PoolActivityViewType'
import {
  PoolActivityViewTypeProvider,
  usePoolActivityViewType,
} from '../PoolActivityViewType/usePoolActivityViewType'

export function PoolActivity() {
  return (
    <PoolActivityViewTypeProvider>
      <PoolActivityProvider>
        <Content />
      </PoolActivityProvider>
    </PoolActivityViewTypeProvider>
  )
}

function Content() {
  const {
    transactionsLabel,
    activeTab,
    tabsList,
    setActiveTab,
    isLoading,
    isExpanded,
    setIsExpanded,
  } = usePoolActivity()

  const { isChartView, isListView } = usePoolActivityViewType()

  const groupHoverProps = {
    _groupHover: {
      border: '1px solid',
      borderColor: 'font.highlight',
      color: 'font.maxContrast',
      transform: 'scale(1.1)',
      '::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'font.highlight',
        zIndex: -1,
        borderRadius: 'inherit',
        opacity: 0.1,
      },
    },
  }

  return (
    <Card role="group">
      <Stack
        w="full"
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        width="full"
        justifyContent="space-between"
        alignItems="start"
      >
        <VStack alignItems="flex-start" gap="0.5">
          <Box
            transform={!isChartView ? 'translateY(4px)' : '0'}
            transition="transform 0.2s var(--ease-out-cubic)"
          >
            <Heading fontWeight="bold" size="h5">
              Pool activity
            </Heading>
          </Box>
          {isChartView &&
            (isLoading ? (
              <Skeleton height="20px" w="100px" />
            ) : (
              <Text fontWeight="medium" variant="secondary" fontSize="sm">
                {transactionsLabel}
              </Text>
            ))}
        </VStack>
        <HStack>
          <ButtonGroup
            currentOption={activeTab}
            options={tabsList}
            onChange={option => {
              setActiveTab(option)
            }}
            size="xxs"
            groupId="pool-activity"
          />
          <PoolActivityViewType />
          <Box shadow={isChartView ? '2xl' : 'none'} h="34px" w="34px" borderRadius="full">
            <IconButton
              aria-label={isExpanded ? 'Minimize chart' : 'Expand chart'}
              icon={isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              onClick={() => setIsExpanded(!isExpanded)}
              size="sm"
              variant="outline"
              borderRadius="full"
              h="34px"
              w="34px"
              transition="transform 0.2s var(--ease-out-cubic)"
              {...(isChartView && !isExpanded && groupHoverProps)}
              isDisabled={!isChartView}
            />
          </Box>
        </HStack>
      </Stack>
      <Box mt="4">
        {isChartView && <PoolActivityChart />}
        {isListView && <PoolActivityTable />}
      </Box>
    </Card>
  )
}
