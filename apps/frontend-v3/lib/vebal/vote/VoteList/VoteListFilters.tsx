import { useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Heading,
  HStack,
  Popover,
  Text,
  VStack,
} from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { staggeredFadeInUp } from '@repo/lib/shared/utils/animations'
import {
  FilterButton,
  PoolNetworkFilters,
  PoolTypeFilters,
  ProtocolVersionFilter,
} from '@repo/lib/modules/pool/PoolList/PoolListFilters'
import { useVoteList } from '@bal/lib/vebal/vote/VoteList/VoteListProvider'
import { VoteListSearch } from '@bal/lib/vebal/vote/VoteList/VoteListSearch'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { poolTypeLabel } from '@repo/lib/modules/pool/pool.helpers'

export function useFilterTagsVisible() {
  const {
    filtersState: { networks, poolTypes, includeExpiredPools, protocolVersion },
  } = useVoteList()

  return networks.length > 0 || poolTypes.length > 0 || includeExpiredPools || !!protocolVersion
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
      protocolVersion,
      setProtocolVersion,
      activeProtocolVersionTab,
      setActiveProtocolVersionTab,
    },
  } = useVoteList()

  function _resetFilters() {
    resetFilters()
  }

  return (
    <VStack w="full">
      <HStack gap="0" justify="end" w="full">
        <VoteListSearch />
        <Popover.Root
          lazyMount
          onOpenChange={(e: any) => {
            if (e.open) {
              setIsPopoverOpen(true)
            } else {
              setIsPopoverOpen(false)
            }
          }}
          open={isPopoverOpen}
          positioning={{
            placement: 'bottom-end',
          }}
        >
          <Popover.Trigger asChild>
            <FilterButton ml="ms" totalFilterCount={totalFilterCount} />
          </Popover.Trigger>
          <Box shadow="2xl" zIndex="popover">
            <Popover.Positioner>
              <Popover.Content motionProps={{ animate: { scale: 1, opacity: 1 } }}>
                <Popover.Arrow bg="background.level3" />
                <Popover.CloseTrigger top="sm" />
                <Popover.Body p="md">
                  <AnimatePresence>
                    {isPopoverOpen ? (
                      <VStack
                        align="start"
                        animate="show"
                        asChild
                        exit="exit"
                        gap="md"
                        initial="hidden"
                        variants={staggeredFadeInUp}
                      >
                        <motion.div>
                          <Box asChild lineHeight="0" p="0" variants={staggeredFadeInUp}>
                            <motion.div>
                              <Flex
                                alignItems="center"
                                gap="ms"
                                justifyContent="space-between"
                                w="full"
                              >
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
                                  <Button
                                    h="fit-content"
                                    onClick={_resetFilters}
                                    size="xs"
                                    variant="plain"
                                  >
                                    Reset all
                                  </Button>
                                )}
                              </Flex>
                            </motion.div>
                          </Box>
                          <Box asChild variants={staggeredFadeInUp} w="full">
                            <motion.div>
                              <Heading as="h3" mb="sm" size="sm">
                                Networks
                              </Heading>
                              <PoolNetworkFilters
                                setNetworks={setNetworks}
                                toggledNetworks={toggledNetworks}
                                toggleNetwork={toggleNetwork}
                              />
                            </motion.div>
                          </Box>
                          <Box asChild variants={staggeredFadeInUp}>
                            <motion.div>
                              <Heading as="h3" mb="sm" size="sm">
                                Protocol version
                              </Heading>
                              <ProtocolVersionFilter
                                activeProtocolVersionTab={activeProtocolVersionTab}
                                hideProtocolVersion={PROJECT_CONFIG.options.hideProtocolVersion}
                                poolTypes={poolTypes}
                                protocolVersion={protocolVersion}
                                setActiveProtocolVersionTab={setActiveProtocolVersionTab}
                                setProtocolVersion={setProtocolVersion}
                              />
                            </motion.div>
                          </Box>
                          <Box asChild variants={staggeredFadeInUp}>
                            <motion.div>
                              <Heading as="h3" mb="sm" size="sm">
                                Pool types
                              </Heading>
                              <PoolTypeFilters
                                hidePoolTypes={PROJECT_CONFIG.options.hidePoolTypes}
                                poolTypeLabel={poolTypeLabel}
                                poolTypes={poolTypes}
                                setPoolTypes={setPoolTypes}
                                togglePoolType={togglePoolType}
                              />
                            </motion.div>
                          </Box>
                          <Box asChild variants={staggeredFadeInUp} w="full">
                            <motion.div>
                              <Heading as="h3" mb="sm" size="sm">
                                Pool gauge display
                              </Heading>
                              <Box
                                animate="show"
                                asChild
                                exit="exit"
                                initial="hidden"
                                variants={staggeredFadeInUp}
                              >
                                <motion.div>
                                  <Box asChild variants={staggeredFadeInUp}>
                                    <motion.div>
                                      <Checkbox.Root
                                        checked={includeExpiredPools}
                                        onCheckedChange={(e: any) =>
                                          toggleIncludeExpiredPools(e.target.checked)
                                        }
                                      >
                                        <Checkbox.HiddenInput />
                                        <Checkbox.Control>
                                          <Checkbox.Indicator />
                                        </Checkbox.Control>
                                        <Checkbox.Label>
                                          <Checkbox.Root>
                                            <Checkbox.HiddenInput />
                                            <Checkbox.Control>
                                              <Checkbox.Indicator />
                                            </Checkbox.Control>
                                          </Checkbox.Root>
                                          <Checkbox.Root>
                                            <Checkbox.HiddenInput />
                                            <Checkbox.Control>
                                              <Checkbox.Indicator />
                                            </Checkbox.Control>
                                            <Checkbox.Label>
                                              <Checkbox.Root>
                                                <Checkbox.HiddenInput />
                                                <Checkbox.Control>
                                                  <Checkbox.Indicator />
                                                </Checkbox.Control>
                                              </Checkbox.Root>
                                            </Checkbox.Label>
                                          </Checkbox.Root>
                                          <Checkbox.Root>
                                            <Checkbox.HiddenInput />
                                            <Checkbox.Control>
                                              <Checkbox.Indicator />
                                            </Checkbox.Control>
                                            <Checkbox.Label>
                                              <Text fontSize="sm" textTransform="capitalize">
                                                Show expired pools gauges
                                              </Text>
                                            </Checkbox.Label>
                                          </Checkbox.Root>
                                        </Checkbox.Label>
                                      </Checkbox.Root>
                                    </motion.div>
                                  </Box>
                                </motion.div>
                              </Box>
                            </motion.div>
                          </Box>
                        </motion.div>
                      </VStack>
                    ) : null}
                  </AnimatePresence>
                </Popover.Body>
              </Popover.Content>
            </Popover.Positioner>
          </Box>
        </Popover.Root>
      </HStack>
    </VStack>
  )
}
