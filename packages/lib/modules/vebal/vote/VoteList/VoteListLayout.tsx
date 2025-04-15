'use client'

import { Box, Heading, Stack, HStack, VStack, useBreakpointValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { ErrorBoundary } from 'react-error-boundary'
import { BoundaryError } from '@repo/lib/shared/components/errors/ErrorBoundary'
import { FilterTags } from '@repo/lib/modules/pool/PoolList/PoolListFilters'
import { VoteListTable } from '@repo/lib/modules/vebal/vote/VoteList/VoteListTable/VoteListTable'
import { useVoteList } from '@repo/lib/modules/vebal/vote/VoteList/VoteListProvider'
import {
  useFilterTagsVisible,
  VoteListFilters,
} from '@repo/lib/modules/vebal/vote/VoteList/VoteListFilters'
import { SelectedPoolsMenu } from '@repo/lib/modules/vebal/vote/VoteList/SelectedPoolsMenu'
import { useVotes } from '@repo/lib/modules/vebal/vote/Votes/VotesProvider'
import { StaticToast } from '@repo/lib/shared/components/toasts/StaticToast'
import { useMemo } from 'react'
import { poolTypeLabel } from '@repo/lib/modules/pool/pool.helpers'

export function VoteListLayout() {
  const {
    sortedVoteList,
    loading,
    count,
    filtersState: {
      networks,
      toggleNetwork,
      poolTypes,
      togglePoolType,
      includeExpiredPools,
      protocolVersion,
      toggleIncludeExpiredPools,
      setProtocolVersion,
    },
  } = useVoteList()
  const { selectedVotingPools, scrollToMyVotes } = useVotes()
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

  const SelectedPoolsMenuRender = useMemo(() => {
    return function SelectedPoolsRender() {
      return (
        <SelectedPoolsMenu
          onAddVotesClick={scrollToMyVotes}
          votingPools={selectedVotingPools.map(selectedVotingPool => ({
            title: selectedVotingPool.tokens
              .map(token => `${token.symbol} ${token.weight ?? 0}%`)
              .join(' / '),
            // fix: (votes) pool name is not available here...
            description: selectedVotingPool.tokens
              .map(token => `${token.symbol}-${token.weight ?? 0}`)
              .join('-'),
          }))}
        />
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVotingPools])

  return (
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
                minW={{ base: 'auto', md: '370px' }}
                position={{ base: 'relative', md: 'absolute' }}
                top="0"
                transition="all 0.15s var(--ease-out-cubic)"
                variants={variants}
                willChange="transform"
              >
                <HStack w="full">
                  <Heading as="h2" size="lg" variant="special">
                    Pool gauge vote list
                  </Heading>
                  <Heading mt="1" size="md" variant="secondary">
                    ({fNum('integer', count || 0)})
                  </Heading>
                </HStack>
              </Box>
            </Box>
          </HStack>
          <FilterTags
            includeExpiredPools={includeExpiredPools}
            networks={networks}
            poolTypeLabel={poolTypeLabel}
            poolTypes={poolTypes}
            protocolVersion={protocolVersion}
            setProtocolVersion={setProtocolVersion}
            toggleIncludeExpiredPools={toggleIncludeExpiredPools}
            toggleNetwork={toggleNetwork}
            togglePoolType={togglePoolType}
          />
        </VStack>

        <Stack
          align={{ base: 'end', sm: 'center' }}
          direction="row"
          w={{ base: 'full', md: 'auto' }}
        >
          <VoteListFilters />
        </Stack>
      </Stack>
      <ErrorBoundary FallbackComponent={BoundaryError}>
        <VoteListTable count={count || 0} loading={loading} voteList={sortedVoteList} />
      </ErrorBoundary>
      <StaticToast isOpen={selectedVotingPools.length > 0}>{SelectedPoolsMenuRender}</StaticToast>
    </VStack>
  )
}
