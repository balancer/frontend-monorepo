import { PaginatedTable } from '@repo/lib/shared/components/tables/PaginatedTable'
import { usePortfolio } from '../PortfolioProvider'
import { PortfolioTableHeader } from './PortfolioTableHeader'
import { PortfolioTableRow } from './PortfolioTableRow'
import {
  Box,
  Card,
  Center,
  Checkbox,
  Divider,
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
import { usePoolMigrations } from '../../pool/migrations/PoolMigrationsProvider'
import { getChainId } from '@repo/lib/config/app.config'
import { MigrationAlert } from '../../pool/migrations/MigrationAlert'

const rowProps = (addExtraColumn: boolean, needsLastColumnWider: boolean) => ({
  px: [0, 4],
  gridTemplateColumns: `32px minmax(320px, 1fr) minmax(180px, max-content) minmax(100px, max-content) 126px ${addExtraColumn ? '120px' : ''} ${needsLastColumnWider ? '160px' : 'minmax(100px, max-content)'}`,
  alignItems: 'center',
  gap: { base: 'xxs', xl: 'lg' },
})

export function PortfolioTable() {
  const { isLoadingPortfolio } = usePortfolio()
  const { isConnected } = useUserAccount()
  const isFilterVisible = usePortfolioFilterTagsVisible()
  const isMd = useBreakpointValue({ base: false, md: true })
  const { sortedPools, setSorting, currentSortingObj, veBalBoostMap } = usePortfolioSorting()

  const hasStakingBoost = sortedPools.some(pool =>
    pool.dynamicData?.aprItems?.some(item => item.type === 'STAKING_BOOST')
  )

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

  const { needsMigration } = usePoolMigrations()
  const poolsThatNeedMigration = sortedPools
    .filter(pool => needsMigration(pool.protocolVersion, getChainId(pool.chain), pool.id))
    .sort((a, b) => (b.userBalance?.totalBalanceUsd || 0) - (a.userBalance?.totalBalanceUsd || 0))
    .filter((item, pos, ary) => !pos || item.id != ary[pos - 1].id) // deduplication

  return (
    <FadeInOnView>
      <VStack align="start" spacing="md" w="full">
        <Stack
          alignItems={isFilterVisible ? 'flex-end' : 'flex-start'}
          direction="row"
          justify="space-between"
          minW="max-content"
          w="full"
        >
          <VStack align="start" flex={1} minW="max-content" pb={{ base: '0', md: '0' }}>
            <HStack w="full">
              <Box position="relative" top="0">
                <Box
                  animate={isFilterVisible ? 'visible' : 'hidden'}
                  as={motion.div}
                  left="0"
                  minW={{ base: 'auto', md: '270px' }}
                  position={{ base: 'relative', md: 'absolute' }}
                  top="8px"
                  transition="all 0.15s var(--ease-out-cubic)"
                  variants={variants}
                  willChange="transform"
                >
                  <Heading as="h2" size="h4" variant="special" w="full">
                    {`${projectName} portfolio`}
                  </Heading>
                </Box>
              </Box>
            </HStack>

            {isFilterVisible && (
              <PortfolioFilterTags
                networks={selectedNetworks}
                poolTypes={selectedPoolTypes}
                stakingTypes={selectedStakingTypes}
                toggleNetwork={toggleNetwork}
                togglePoolType={togglePoolType}
                toggleStakingType={toggleStakingType}
              />
            )}
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

        {poolsThatNeedMigration.map(pool => (
          <MigrationAlert key={pool.id} pool={pool} />
        ))}

        {isConnected ? (
          <Card
            alignItems="flex-start"
            left={{ base: '-4px', sm: '0' }}
            overflowX={{ base: 'auto', '2xl': 'hidden' }}
            overflowY="hidden"
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
              noItemsFoundLabel="You have no current positions"
              paginationProps={undefined}
              position="relative"
              renderTableHeader={() => (
                <PortfolioTableHeader
                  currentSortingObj={currentSortingObj}
                  setCurrentSortingObj={setSorting}
                  {...rowProps(options.showVeBal, hasStakingBoost)}
                />
              )}
              renderTableRow={({ item }) => {
                return (
                  <PortfolioTableRow
                    keyValue={item.id}
                    pool={item}
                    veBalBoostMap={veBalBoostMap}
                    {...rowProps(options.showVeBal, hasStakingBoost)}
                  />
                )
              }}
              showPagination={false}
              w={{ base: '100vw', lg: 'full' }}
            />
          </Card>
        ) : (
          <Card
            alignItems="flex-start"
            left={{ base: '-4px', sm: '0' }}
            p={{ base: '0', sm: '0' }}
            position="relative"
            // fixing right padding for horizontal scroll on mobile
            pr={{ base: 'lg', sm: 'lg', md: 'lg', lg: '0' }}
            w={{ base: '100vw', lg: 'full' }}
          >
            <PortfolioTableHeader
              currentSortingObj={currentSortingObj}
              setCurrentSortingObj={setSorting}
              {...rowProps(options.showVeBal, hasStakingBoost)}
            />
            <Divider />
            <Center h="160px" rounded="lg" w="full">
              <Box>
                <ConnectWallet size="lg" variant="primary" />
              </Box>
            </Center>
          </Card>
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
