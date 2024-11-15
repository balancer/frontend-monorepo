import { useEffect, useState } from 'react'
import { poolTypeLabel } from '@repo/lib/modules/pool/PoolList/usePoolListQueryState'
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Heading,
  HStack,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Text,
  VStack,
} from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { staggeredFadeInUp } from '@repo/lib/shared/utils/animations'
import {
  FilterButton,
  PoolNetworkFilters,
  PoolTypeFilters,
} from '@repo/lib/modules/pool/PoolList/PoolListFilters'
import { useVoteList } from '@repo/lib/modules/vebal/vote/VoteList/VoteListProvider'
import { VoteListSearch } from '@repo/lib/modules/vebal/vote/VoteList/VoteListSearch'
import { PoolFilterType } from '@repo/lib/modules/pool/pool.types'

export function useFilterTagsVisible() {
  const {
    filtersState: { networks, poolTypes, includeExpiredPools },
  } = useVoteList()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(networks.length > 0 || poolTypes.length > 0 || includeExpiredPools)
  }, [networks, poolTypes, includeExpiredPools])

  return isVisible
}

export function VoteListFilters() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const {
    filtersState: {
      resetFilters,
      totalFilterCount,
      networks: toggledNetworks,
      toggleNetwork,
      setNetworks,
      togglePoolType,
      poolTypes,
      setPoolTypes,
      includeExpiredPools,
      toggleIncludeExpiredPools,
    },
  } = useVoteList()

  function _resetFilters() {
    resetFilters()
  }

  return (
    <VStack w="full">
      <HStack gap="0" justify="end" spacing="none" w="full">
        <VoteListSearch />
        <Popover
          isOpen={isPopoverOpen}
          onClose={() => setIsPopoverOpen(false)}
          onOpen={() => setIsPopoverOpen(true)}
          placement="bottom-end"
        >
          <PopoverTrigger>
            <FilterButton ml="ms" totalFilterCount={totalFilterCount} />
          </PopoverTrigger>
          <Box shadow="2xl" zIndex="popover">
            <PopoverContent>
              <PopoverArrow bg="background.level3" />
              <PopoverCloseButton top="sm" />
              <PopoverBody p="md">
                <AnimatePresence>
                  {isPopoverOpen ? (
                    <VStack
                      align="start"
                      animate="show"
                      as={motion.div}
                      exit="exit"
                      initial="hidden"
                      spacing="md"
                      variants={staggeredFadeInUp}
                    >
                      <Box as={motion.div} lineHeight="0" p="0" variants={staggeredFadeInUp}>
                        <Flex alignItems="center" gap="ms" justifyContent="space-between" w="full">
                          <Text
                            background="font.special"
                            backgroundClip="text"
                            display="inline"
                            fontSize="xs"
                            variant="eyebrow"
                          >
                            Filters
                          </Text>
                          {totalFilterCount > 0 && (
                            <Button onClick={_resetFilters} size="xs" variant="link">
                              Reset all
                            </Button>
                          )}
                        </Flex>
                      </Box>

                      <Box as={motion.div} variants={staggeredFadeInUp} w="full">
                        <Heading as="h3" mb="sm" size="sm">
                          Networks
                        </Heading>
                        <PoolNetworkFilters
                          setNetworks={setNetworks}
                          toggleNetwork={toggleNetwork}
                          toggledNetworks={toggledNetworks}
                        />
                      </Box>
                      <Box as={motion.div} variants={staggeredFadeInUp}>
                        <Heading as="h3" mb="sm" size="sm">
                          Pool types
                        </Heading>
                        <PoolTypeFilters
                          poolTypeLabel={poolTypeLabel}
                          poolTypes={poolTypes}
                          setPoolTypes={setPoolTypes}
                          togglePoolType={togglePoolType}
                        />
                      </Box>
                      <Box as={motion.div} variants={staggeredFadeInUp} w="full">
                        <Heading as="h3" mb="sm" size="sm">
                          Pool gauge display
                        </Heading>
                        <Box
                          animate="show"
                          as={motion.div}
                          exit="exit"
                          initial="hidden"
                          variants={staggeredFadeInUp}
                        >
                          <Box as={motion.div} variants={staggeredFadeInUp}>
                            <Checkbox
                              isChecked={includeExpiredPools}
                              onChange={e => toggleIncludeExpiredPools(e.target.checked)}
                            >
                              <Text fontSize="sm" textTransform="capitalize">
                                Show expired pools gauges
                              </Text>
                            </Checkbox>
                          </Box>
                        </Box>
                      </Box>
                    </VStack>
                  ) : null}
                </AnimatePresence>
              </PopoverBody>
            </PopoverContent>
          </Box>
        </Popover>
      </HStack>
    </VStack>
  )
}
