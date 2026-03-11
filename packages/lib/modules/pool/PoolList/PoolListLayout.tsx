'use client'

import { Box, Heading, Stack, HStack, VStack, useBreakpointValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FilterTags, PoolListFilters, useFilterTagsVisible } from './PoolListFilters'
import { PoolListTable } from './PoolListTable/PoolListTable'
import { usePoolList } from './PoolListProvider'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { ErrorBoundary } from 'react-error-boundary'
import { BoundaryError } from '@repo/lib/shared/components/errors/ErrorBoundary'
import { poolTypeLabel } from '../pool.helpers'

export function PoolListLayout() {
  const {
    pools,
    loading,
    count,
    queryState: {
      networks,
      toggleNetwork,
      poolTypes,
      togglePoolType,
      minTvl,
      setMinTvl,
      poolTags,
      togglePoolTag,
      poolTagLabel,
      poolHookTags,
      togglePoolHookTag,
      poolHookTagLabel,
      protocolVersion,
      setProtocolVersion,
    },
  } = usePoolList()
  const isFilterVisible = useFilterTagsVisible()
  const isMd = useBreakpointValue({ base: false, md: true })

  const variants = {
    visible: {
      transform: isMd ? 'translateY(-40px)' : 'translateY(0)',
    },
    hidden: {
      transform: 'translateY(0)',
    },
  }

  return (
    <VStack align="start" gap="md" minHeight="1000px" w="full">
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
                asChild
                left="0"
                minW={{ base: 'auto', md: '270px' }}
                position={{ base: 'relative', md: 'absolute' }}
                top="0"
                transition="all 0.15s var(--ease-out-cubic)"
                variants={variants}
                willChange="transform"
              >
                <motion.div>
                  <HStack w="full">
                    <Heading size="h4" variant="special">
                      Liquidity pools
                    </Heading>
                    <Heading mt="1" size="h5" variant="secondary">
                      ({fNum('integer', count || 0)})
                    </Heading>
                  </HStack>
                </motion.div>
              </Box>
            </Box>
          </HStack>
          <FilterTags
            minTvl={minTvl}
            networks={networks}
            poolHookTagLabel={poolHookTagLabel}
            poolHookTags={poolHookTags}
            poolTagLabel={poolTagLabel}
            poolTags={poolTags}
            poolTypeLabel={poolTypeLabel}
            poolTypes={poolTypes}
            protocolVersion={protocolVersion}
            setMinTvl={setMinTvl}
            setProtocolVersion={setProtocolVersion}
            toggleNetwork={toggleNetwork}
            togglePoolHookTag={togglePoolHookTag}
            togglePoolTag={togglePoolTag}
            togglePoolType={togglePoolType}
          />
        </VStack>

        <Stack
          align={{ base: 'end', sm: 'center' }}
          direction="row"
          w={{ base: 'full', md: 'auto' }}
        >
          <PoolListFilters />
        </Stack>
      </Stack>
      <ErrorBoundary FallbackComponent={BoundaryError}>
        <PoolListTable count={count || 0} loading={loading} pools={pools} />
      </ErrorBoundary>
    </VStack>
  )
}
