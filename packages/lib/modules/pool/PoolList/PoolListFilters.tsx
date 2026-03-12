'use client'
import {
  Badge,
  Box,
  Button,
  ButtonProps,
  Center,
  Checkbox,
  Flex,
  Heading,
  HStack,
  Icon,
  Popover,
  Portal,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useThemeColorMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'
import { PoolListSearch } from './PoolListSearch'
import { PROTOCOL_VERSION_TABS } from './usePoolListQueryState'
import {
  PoolFilterType,
  poolHookTagFilters,
  PoolHookTagType,
  poolTagFilters,
  PoolTagType,
  poolTypeFilters,
} from '../pool.types'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useEffect, useState, forwardRef } from 'react'
import { Filter, Plus } from 'react-feather'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { motion, AnimatePresence } from 'framer-motion'
import { staggeredFadeInUp } from '@repo/lib/shared/utils/animations'
import { getChainShortName } from '@repo/lib/config/app.config'
import { usePoolList } from './PoolListProvider'
import { MultiSelect } from '@repo/lib/shared/components/inputs/MultiSelect'
import { GqlChain, GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import Image from 'next/image'
import ButtonGroup, {
  ButtonGroupOption,
} from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { useCow } from '../../cow/useCow'
import { isBeets, PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { poolTypeLabel } from '../pool.helpers'
import { AnimatedTag } from '@repo/lib/shared/components/other/AnimatedTag'
import { PoolMinTvlFilter } from './PoolMinTvlFilter'
import { AnalyticsEvent, trackEvent } from '@repo/lib/shared/services/fathom/Fathom'
import NextLink from 'next/link'

export function useFilterTagsVisible() {
  const {
    queryState: { networks, poolTypes, minTvl, poolTags, poolHookTags, protocolVersion },
  } = usePoolList()

  return (
    networks.length > 0 ||
    poolTypes.length > 0 ||
    minTvl > 0 ||
    poolTags.length > 0 ||
    poolHookTags.length > 0 ||
    !!protocolVersion
  )
}

function UserPoolFilter() {
  const {
    queryState: { userAddress, toggleUserAddress },
  } = usePoolList()
  const { userAddress: connectedUserAddress } = useUserAccount()
  const isChecked = connectedUserAddress ? userAddress === connectedUserAddress : false

  return (
    <Checkbox.Root
      checked={isChecked}
      mb="xxs"
      onCheckedChange={(e: { checked: boolean | 'indeterminate' }) =>
        toggleUserAddress(!!e.checked, connectedUserAddress as string)
      }
      size="sm"
    >
      <Checkbox.HiddenInput />
      <Checkbox.Control />
      <Checkbox.Label>
        <Text fontSize="sm">My positions</Text>
      </Checkbox.Label>
    </Checkbox.Root>
  )
}

function PoolCategoryFilters({ hidePoolTags }: { hidePoolTags: string[] }) {
  const {
    queryState: { togglePoolTag, poolTags, setPoolTags, poolTagLabel },
  } = usePoolList()

  // remove query param when empty
  useEffect(() => {
    if (!poolTags.length) {
      setPoolTags(null)
    }
  }, [poolTags])

  return (
    <Box animate="show" asChild exit="exit" initial="hidden" variants={staggeredFadeInUp}>
      <motion.div>
        {poolTagFilters
          .filter(tag => !hidePoolTags?.includes(tag))
          .map(tag => (
            <Box asChild key={tag} variants={staggeredFadeInUp}>
              <motion.div key={tag}>
                <Checkbox.Root
                  checked={!!poolTags.find(selected => selected === tag)}
                  onCheckedChange={(e: { checked: boolean | 'indeterminate' }) =>
                    togglePoolTag(!!e.checked, tag as PoolTagType)
                  }
                  size="sm"
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>
                    <Text fontSize="sm">{poolTagLabel(tag)}</Text>
                  </Checkbox.Label>
                </Checkbox.Root>
              </motion.div>
            </Box>
          ))}
      </motion.div>
    </Box>
  )
}

function PoolHookFilters() {
  const {
    queryState: { togglePoolHookTag, poolHookTags, setPoolHookTags, poolHookTagLabel },
  } = usePoolList()

  // Exclude hooks that are not live
  const livePoolHookTagFilters = poolHookTagFilters.filter(
    tag => tag !== 'HOOKS_FEETAKING' && tag !== 'HOOKS_EXITFEE'
  )

  // remove query param when empty
  useEffect(() => {
    if (!poolHookTags.length) {
      setPoolHookTags(null)
    }
  }, [poolHookTags])

  return (
    <Box animate="show" asChild exit="exit" initial="hidden" variants={staggeredFadeInUp}>
      <motion.div>
        {livePoolHookTagFilters.map(tag => (
          <Box asChild key={tag} variants={staggeredFadeInUp}>
            <motion.div key={tag}>
              <Checkbox.Root
                checked={!!poolHookTags.find(selected => selected === tag)}
                onCheckedChange={(e: { checked: boolean | 'indeterminate' }) =>
                  togglePoolHookTag(!!e.checked, tag as PoolHookTagType)
                }
                size="sm"
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>
                  <Text fontSize="sm">{poolHookTagLabel(tag)}</Text>
                </Checkbox.Label>
              </Checkbox.Root>
            </motion.div>
          </Box>
        ))}
      </motion.div>
    </Box>
  )
}

export interface PoolTypeFiltersArgs {
  poolTypes: PoolFilterType[]
  poolTypeLabel: (poolType: PoolFilterType) => string
  setPoolTypes: (value: PoolFilterType[] | null) => void
  togglePoolType: (checked: boolean, value: PoolFilterType) => void
  hidePoolTypes?: GqlPoolType[]
}

export function PoolTypeFilters({
  togglePoolType,
  poolTypes,
  poolTypeLabel,
  setPoolTypes,
  hidePoolTypes,
}: PoolTypeFiltersArgs) {
  // remove query param when empty
  useEffect(() => {
    if (!poolTypes.length) {
      setPoolTypes(null)
    }
  }, [poolTypes])

  const _poolTypeFilters = poolTypeFilters.filter(
    poolType => !(hidePoolTypes ?? []).includes(poolType)
  )

  return (
    <Box animate="show" asChild exit="exit" initial="hidden" variants={staggeredFadeInUp}>
      <motion.div>
        {_poolTypeFilters.map(poolType => (
          <Box asChild key={poolType} variants={staggeredFadeInUp}>
            <motion.div key={poolType}>
              <Checkbox.Root
                checked={!!poolTypes.find(selected => selected === poolType)}
                onCheckedChange={(e: { checked: boolean | 'indeterminate' }) =>
                  togglePoolType(!!e.checked, poolType as PoolFilterType)
                }
                size="sm"
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>
                  <Text fontSize="sm">{poolTypeLabel(poolType)}</Text>
                </Checkbox.Label>
              </Checkbox.Root>
            </motion.div>
          </Box>
        ))}
      </motion.div>
    </Box>
  )
}

export interface PoolNetworkFiltersArgs {
  toggledNetworks: GqlChain[]
  toggleNetwork: (checked: boolean, value: GqlChain) => void
  setNetworks: (value: GqlChain[] | null) => void
}

export function PoolNetworkFilters({
  toggledNetworks,
  toggleNetwork,
  setNetworks,
}: PoolNetworkFiltersArgs) {
  const { supportedNetworks } = PROJECT_CONFIG

  // const sortedNetworks = [supportedNetworks[0], ...supportedNetworks.slice(1).sort()] // Alphabetical order after Mainnet
  const sortedNetworks = supportedNetworks

  const networkOptions = sortedNetworks.map(network => ({
    label: getChainShortName(network),
    value: network,
    icon: (
      <Box rounded="full" shadow="md">
        <Image alt={network} height="16" src={`/images/chains/${network}.svg`} width="16" />
      </Box>
    ),
    selectedLabel: (
      <HStack gap="6px">
        <Box h="20px" rounded="full" shadow="md" w="20px">
          <Image alt={network} height="20" src={`/images/chains/${network}.svg`} width="20" />
        </Box>
      </HStack>
    ),
  }))

  function isCheckedNetwork(network: GqlChain): boolean {
    return !!toggledNetworks.includes(network)
  }

  return (
    <MultiSelect<GqlChain>
      bg="background.level4"
      isChecked={isCheckedNetwork}
      label="All networks"
      mb="xs"
      options={networkOptions}
      rounded="md"
      toggleAll={() => setNetworks(null)}
      toggleOption={toggleNetwork}
    />
  )
}

export interface FilterTagsPops {
  networks: GqlChain[]
  toggleNetwork: (checked: boolean, value: GqlChain) => void
  poolTypes: PoolFilterType[]
  togglePoolType: (checked: boolean, value: PoolFilterType) => void
  poolTypeLabel: (poolType: PoolFilterType) => string
  protocolVersion: number | null
  setProtocolVersion: (value: number | null) => void
  minTvl?: number
  setMinTvl?: (value: number | null) => void
  poolTags?: PoolTagType[]
  togglePoolTag?: (checked: boolean, value: PoolTagType) => void
  poolTagLabel?: (poolTag: PoolTagType) => string
  includeExpiredPools?: boolean
  toggleIncludeExpiredPools?: (checked: boolean) => void
  poolHookTags?: PoolHookTagType[]
  togglePoolHookTag?: (checked: boolean, value: PoolHookTagType) => void
  poolHookTagLabel?: (poolHookTag: PoolHookTagType) => string
}

export function FilterTags({
  networks,
  toggleNetwork,
  poolTypes,
  togglePoolType,
  poolTypeLabel,
  minTvl,
  setMinTvl,
  poolTags,
  togglePoolTag,
  poolTagLabel,
  includeExpiredPools,
  toggleIncludeExpiredPools,
  poolHookTags,
  togglePoolHookTag,
  poolHookTagLabel,
  protocolVersion,
  setProtocolVersion,
}: FilterTagsPops) {
  const { toCurrency } = useCurrency()

  // prevents layout shift in mobile view
  if (
    networks.length === 0 &&
    poolTypes.length === 0 &&
    minTvl === 0 &&
    (poolTags ? poolTags.length === 0 : true) &&
    !includeExpiredPools &&
    (poolHookTags ? poolHookTags.length === 0 : true) &&
    !protocolVersion
  ) {
    return <Box display={{ base: 'flex', md: 'none' }} minHeight="32px" />
  }

  return (
    <HStack gap="sm" wrap="wrap">
      <AnimatePresence>
        {protocolVersion && setProtocolVersion && (
          <AnimatedTag
            key="protocolVersion"
            label={protocolVersion === 1 ? 'CoW' : `v${protocolVersion}`}
            onClose={() => setProtocolVersion(null)}
          />
        )}

        {poolTypes.map(poolType => (
          <AnimatedTag
            key={poolType}
            label={poolTypeLabel(poolType)}
            onClose={() => togglePoolType(false, poolType)}
          />
        ))}

        {networks.map(network => (
          <AnimatedTag
            key={network}
            label={getChainShortName(network)}
            onClose={() => toggleNetwork(false, network)}
          />
        ))}

        {minTvl && minTvl > 0 && (
          <AnimatedTag
            key="minTvl"
            label={`TVL > ${toCurrency(minTvl)}`}
            onClose={() => setMinTvl && setMinTvl(0)}
          />
        )}

        {poolTags &&
          poolTagLabel &&
          poolTags.map(tag => (
            <AnimatedTag
              key={tag}
              label={poolTagLabel(tag)}
              onClose={() => togglePoolTag && togglePoolTag(false, tag)}
            />
          ))}

        {includeExpiredPools && (
          <AnimatedTag
            key="expiredPools"
            label="Expired"
            onClose={() => toggleIncludeExpiredPools && toggleIncludeExpiredPools(false)}
          />
        )}

        {poolHookTags &&
          poolHookTagLabel &&
          poolHookTags.map(tag => (
            <AnimatedTag
              key={tag}
              label={poolHookTagLabel(tag)}
              onClose={() => togglePoolHookTag && togglePoolHookTag(false, tag)}
            />
          ))}
      </AnimatePresence>
    </HStack>
  )
}

export const FilterButton = forwardRef<
  HTMLButtonElement,
  ButtonProps & { totalFilterCount: number }
>(({ totalFilterCount, onClick, ...props }, ref) => {
  const { isMobile } = useBreakpoints()
  const colorMode = useThemeColorMode()
  const textColor = colorMode === 'dark' ? 'font.dark' : '#fff'

  const handleFilterClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    trackEvent(AnalyticsEvent.ClickPoolListFilter)
    onClick?.(e)
  }

  return (
    <Button
      ref={ref}
      {...props}
      display="flex"
      gap="2"
      onClick={handleFilterClick}
      variant="tertiary"
    >
      <Icon asChild boxSize={4}>
        <Filter />
      </Icon>
      {!isMobile && 'Filters'}
      {totalFilterCount > 0 && (
        <Badge
          bg="font.highlight"
          borderRadius="full"
          color={textColor}
          p="0"
          position="absolute"
          right="-9px"
          shadow="lg"
          top="-9px"
        >
          <Center h="5" w="5">
            {totalFilterCount}
          </Center>
        </Badge>
      )}
    </Button>
  )
})

export interface ProtocolVersionFilterProps {
  setProtocolVersion: (version: number | null) => any
  protocolVersion: number | null
  poolTypes: PoolFilterType[]
  activeProtocolVersionTab: ButtonGroupOption
  setActiveProtocolVersionTab: React.Dispatch<React.SetStateAction<ButtonGroupOption>>
  hideProtocolVersion?: string[]
}

export function ProtocolVersionFilter({
  setProtocolVersion,
  protocolVersion,
  poolTypes,
  activeProtocolVersionTab,
  setActiveProtocolVersionTab,
  hideProtocolVersion,
}: ProtocolVersionFilterProps) {
  const tabs = PROTOCOL_VERSION_TABS

  function toggleTab(option: ButtonGroupOption) {
    setActiveProtocolVersionTab(option)
  }

  useEffect(() => {
    if (protocolVersion === 3) {
      setActiveProtocolVersionTab(PROTOCOL_VERSION_TABS[2])
    } else if (protocolVersion === 2) {
      setActiveProtocolVersionTab(PROTOCOL_VERSION_TABS[1])
    } else if (poolTypes.includes(GqlPoolType.CowAmm) || protocolVersion === 1) {
      setActiveProtocolVersionTab(PROTOCOL_VERSION_TABS[3])
    } else {
      setActiveProtocolVersionTab(PROTOCOL_VERSION_TABS[0])
    }
  }, [])

  useEffect(() => {
    if (activeProtocolVersionTab.value === 'v3') {
      setProtocolVersion(3)
    } else if (activeProtocolVersionTab.value === 'v2') {
      setProtocolVersion(2)
    } else if (activeProtocolVersionTab.value === 'cow') {
      setProtocolVersion(1)
    } else {
      setProtocolVersion(null)
    }
  }, [activeProtocolVersionTab])

  return (
    <ButtonGroup
      currentOption={activeProtocolVersionTab}
      groupId="protocol-version"
      onChange={toggleTab}
      options={tabs.filter(tab => !(hideProtocolVersion ?? []).includes(tab.value))}
      size="xxs"
    />
  )
}

export function PoolListFilters() {
  const { isConnected } = useUserAccount()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const {
    isFixedPoolType,
    queryState: {
      resetFilters,
      totalFilterCount,
      setActiveProtocolVersionTab,
      networks: toggledNetworks,
      toggleNetwork,
      setNetworks,
      togglePoolType,
      poolTypes,
      setPoolTypes,
      setProtocolVersion,
      protocolVersion,
      activeProtocolVersionTab,
    },
  } = usePoolList()
  const { isCowPath } = useCow()
  const { isMobile } = useBreakpoints()

  function _resetFilters() {
    resetFilters()
    setActiveProtocolVersionTab(PROTOCOL_VERSION_TABS[0])
  }

  const { options } = PROJECT_CONFIG

  return (
    <VStack w="full">
      <HStack gap="none" justify="end" pr={{ base: 'md', xl: '0' }} w="full">
        <PoolListSearch />
        <Popover.Root
          lazyMount
          onOpenChange={(e: { open: boolean }) => {
            if (e.open) {
              setIsPopoverOpen(true)
            } else {
              setIsPopoverOpen(false)
            }
          }}
          open={isPopoverOpen}
          positioning={{
            fitViewport: false,
            flip: false,
            placement: 'bottom-end',
            sizeMiddleware: false,
          }}
        >
          <Popover.Trigger asChild>
            <FilterButton ml="ms" totalFilterCount={totalFilterCount} />
          </Popover.Trigger>
          <Portal>
            <Popover.Positioner>
              <Popover.Content shadow="2xl" zIndex="popover">
                <Popover.Arrow />
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
                          {isConnected ? (
                            <Box asChild variants={staggeredFadeInUp}>
                              <motion.div>
                                <Heading as="h3" my="sm" size="sm">
                                  My liquidity
                                </Heading>
                                <UserPoolFilter />
                              </motion.div>
                            </Box>
                          ) : null}
                          {/* TODO: filter for cow networks when 'isCowPath' is true */}
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
                          {!isCowPath && (
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
                          )}
                          {!isFixedPoolType && (
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
                          )}
                          {!isCowPath && (
                            <>
                              <Box asChild variants={staggeredFadeInUp}>
                                <motion.div>
                                  <Heading as="h3" mb="sm" size="sm">
                                    Pool categories
                                  </Heading>
                                  <PoolCategoryFilters hidePoolTags={options.hidePoolTags} />
                                </motion.div>
                              </Box>

                              <Box asChild variants={staggeredFadeInUp}>
                                <motion.div>
                                  <Heading as="h3" mb="sm" size="sm">
                                    Hooks
                                  </Heading>
                                  <PoolHookFilters />
                                </motion.div>
                              </Box>
                            </>
                          )}
                          <Box asChild mb="xs" variants={staggeredFadeInUp} w="full">
                            <motion.div>
                              <PoolMinTvlFilter />
                            </motion.div>
                          </Box>
                        </motion.div>
                      </VStack>
                    ) : null}
                  </AnimatePresence>
                </Popover.Body>
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>
        {isBeets && (
          <Button asChild display="flex" gap="2" ml="ms" variant="tertiary">
            <NextLink href="/create">
              <Icon asChild boxSize={4}>
                <Plus />
              </Icon>
              {!isMobile && 'Create a pool'}
            </NextLink>
          </Button>
        )}
      </HStack>
    </VStack>
  )
}
