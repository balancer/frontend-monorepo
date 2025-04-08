/* eslint-disable react-hooks/exhaustive-deps */
import { PaginatedTable } from '@repo/lib/shared/components/tables/PaginatedTable'
import { usePortfolio } from '../PortfolioProvider'
import { PortfolioTableHeader } from './PortfolioTableHeader'
import { PortfolioTableRow } from './PortfolioTableRow'
import {
  Box,
  Card,
  Center,
  Checkbox,
  Heading,
  HStack,
  Stack,
  Text,
  useBreakpointValue,
  VStack,
} from '@chakra-ui/react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { ConnectWallet } from '../../web3/ConnectWallet'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import {
  PortfolioFilters,
  PortfolioFilterTags,
  usePortfolioFilterTagsVisible,
} from './PortfolioFilters'
import { usePortfolioFilters } from './PortfolioFiltersProvider'
import { motion } from 'framer-motion'
import { usePortfolioSorting } from './usePortfolioSorting'

const rowProps = (addExtraColumn: boolean) => ({
  px: [0, 4],
  gridTemplateColumns: `32px minmax(320px, 1fr) 180px 110px 110px ${addExtraColumn ? '130px' : ''} 170px`,
  alignItems: 'center',
  gap: { base: 'xxs', xl: 'lg' },
})

export function PortfolioTable() {
  const { isLoadingPortfolio } = usePortfolio()
  const { isConnected } = useUserAccount()
  const isFilterVisible = usePortfolioFilterTagsVisible()
  const isMd = useBreakpointValue({ base: false, md: true })

  const { sortedPools, setSorting, currentSortingObj, veBalBoostMap } = usePortfolioSorting()

  const {
    selectedNetworks,
    selectedPoolTypes,
    toggleNetwork,
    togglePoolType,
    toggleStakingType,
    selectedStakingTypes,
    hasTinyBalances,
    setShouldFilterTinyBalances,
    shouldFilterTinyBalances,
  } = usePortfolioFilters()

  const { projectName, options } = PROJECT_CONFIG

  const variants = {
    visible: {
      transform: isMd ? 'translateY(-40px)' : 'translateY(0)',
    },
    hidden: {
      transform: 'translateY(0)',
    },
  }

  return (
    <FadeInOnView>
      <VStack align="start" minHeight="1000px" spacing="md" w="full">
        <Stack
          alignItems={isFilterVisible ? 'flex-end' : 'flex-start'}
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          w="full"
        >
          <VStack align="start" flex={1} pb={{ base: 'sm', md: '0' }} w="full">
            <HStack w="full">
              <Box position="relative" top="0">
                <Box
                  animate={isFilterVisible ? 'visible' : 'hidden'}
                  as={motion.div}
                  left="0"
                  minW={{ base: 'auto', md: '270px' }}
                  position={{ base: 'relative', md: 'absolute' }}
                  top="0"
                  transition="all 0.15s var(--ease-out-cubic)"
                  variants={variants}
                  willChange="transform"
                >
                  <Heading
                    as="h2"
                    size="lg"
                    variant="special"
                    w="full"
                  >{`${projectName} portfolio`}</Heading>
                </Box>
              </Box>
            </HStack>
            <PortfolioFilterTags
              networks={selectedNetworks}
              poolTypes={selectedPoolTypes}
              stakingTypes={selectedStakingTypes}
              toggleNetwork={toggleNetwork}
              togglePoolType={togglePoolType}
              toggleStakingType={toggleStakingType}
            />
          </VStack>

          <Stack
            align={{ base: 'end', sm: 'center' }}
            direction="row"
            w={{ base: 'full', md: 'auto' }}
          >
            <PortfolioFilters
              selectedNetworks={selectedNetworks}
              selectedPoolTypes={selectedPoolTypes}
            />
          </Stack>
        </Stack>
        {isConnected ? (
          <Card
            alignItems="flex-start"
            left={{ base: '-4px', sm: '0' }}
            p={{ base: '0', sm: '0' }}
            position="relative"
            // fixing right padding for horizontal scroll on mobile
            pr={{ base: 'lg', sm: 'lg', md: 'lg', lg: '0' }}
            w={{ base: '100vw', lg: 'full' }}
          >
            <PaginatedTable
              alignItems="flex-start"
              getRowId={row => row.uniqueKey}
              items={sortedPools}
              left={{ base: '-4px', sm: '0' }}
              loading={isLoadingPortfolio}
              noItemsFoundLabel="No pools found"
              paginationProps={null}
              position="relative"
              renderTableHeader={() => (
                <PortfolioTableHeader
                  currentSortingObj={currentSortingObj}
                  setCurrentSortingObj={setSorting}
                  {...rowProps(options.showVeBal)}
                />
              )}
              renderTableRow={({ item, index }) => {
                return (
                  <PortfolioTableRow
                    keyValue={index}
                    pool={item}
                    veBalBoostMap={veBalBoostMap}
                    {...rowProps(options.showVeBal)}
                  />
                )
              }}
              showPagination={false}
              w={{ base: '100vw', lg: 'full' }}
            />
          </Card>
        ) : (
          <Center border="1px dashed" borderColor="border.base" h="400px" rounded="lg" w="full">
            <Box>
              <ConnectWallet size="lg" variant="primary" />
            </Box>
          </Center>
        )}
        {hasTinyBalances && (
          <Checkbox
            isChecked={shouldFilterTinyBalances}
            onChange={() => {
              setShouldFilterTinyBalances(!shouldFilterTinyBalances)
            }}
            size="lg"
          >
            <Text fontSize="md" variant="secondary">
              Hide pools under $0.01
            </Text>
          </Checkbox>
        )}
      </VStack>
    </FadeInOnView>
  )
}
