'use client'
/* eslint-disable react-hooks/exhaustive-deps */

import {
  Badge,
  Box,
  Button,
  ButtonProps,
  Center,
  Checkbox,
  Flex,
  forwardRef,
  Heading,
  HStack,
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { PoolListSearch } from './PoolListSearch'
import { PROTOCOL_VERSION_TABS } from './usePoolListQueryState'
import { PoolFilterType, poolTagFilters, PoolTagType, poolTypeFilters } from '../pool.types'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useEffect, useState } from 'react'
import { Filter, Plus } from 'react-feather'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { useDebouncedCallback } from 'use-debounce'
import { defaultDebounceMs } from '@repo/lib/shared/utils/queries'
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
import Link from 'next/link'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

const SLIDER_MAX_VALUE = 10000000
const SLIDER_STEP_SIZE = 100000

export function useFilterTagsVisible() {
  const {
    queryState: { networks, poolTypes, minTvl, poolTags, hasHook },
  } = usePoolList()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(
      networks.length > 0 || poolTypes.length > 0 || minTvl > 0 || poolTags.length > 0 || hasHook
    )
  }, [networks, poolTypes, minTvl, poolTags])

  return isVisible
}

function UserPoolFilter() {
  const {
    queryState: { userAddress, toggleUserAddress },
  } = usePoolList()
  const { userAddress: connectedUserAddress } = useUserAccount()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (connectedUserAddress) {
      setChecked(userAddress === connectedUserAddress)
    } else {
      setChecked(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAddress, connectedUserAddress])

  return (
    <Checkbox
      isChecked={checked}
      mb="xxs"
      onChange={e => toggleUserAddress(e.target.checked, connectedUserAddress as string)}
    >
      <Text fontSize="sm">My positions</Text>
    </Checkbox>
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
    <Box animate="show" as={motion.div} exit="exit" initial="hidden" variants={staggeredFadeInUp}>
      {poolTagFilters
        .filter(tag => !hidePoolTags?.includes(tag))
        .map(tag => (
          <Box as={motion.div} key={tag} variants={staggeredFadeInUp}>
            <Checkbox
              isChecked={!!poolTags.find(selected => selected === tag)}
              onChange={e => togglePoolTag(e.target.checked, tag as PoolTagType)}
            >
              <Text fontSize="sm">{poolTagLabel(tag)}</Text>
            </Checkbox>
          </Box>
        ))}
    </Box>
  )
}

function PoolHookFilters() {
  const {
    queryState: { setHasHook, hasHook },
  } = usePoolList()

  // remove query param when empty
  useEffect(() => {
    if (!hasHook) {
      setHasHook(null)
    }
  }, [hasHook])

  return (
    <Box animate="show" as={motion.div} exit="exit" initial="hidden" variants={staggeredFadeInUp}>
      <Box as={motion.div} key="hasHook" variants={staggeredFadeInUp}>
        <Checkbox isChecked={hasHook} onChange={e => setHasHook(e.target.checked)}>
          <Text fontSize="sm">All</Text>
        </Checkbox>
      </Box>
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
    <Box animate="show" as={motion.div} exit="exit" initial="hidden" variants={staggeredFadeInUp}>
      {_poolTypeFilters.map(poolType => (
        <Box as={motion.div} key={poolType} variants={staggeredFadeInUp}>
          <Checkbox
            isChecked={!!poolTypes.find(selected => selected === poolType)}
            onChange={e => togglePoolType(e.target.checked, poolType as PoolFilterType)}
          >
            <Text fontSize="sm" textTransform="capitalize">
              {poolTypeLabel(poolType)}
            </Text>
          </Checkbox>
        </Box>
      ))}
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

  // Sort networks alphabetically after mainnet
  const sortedNetworks = [supportedNetworks[0], ...supportedNetworks.slice(1).sort()]

  const networkOptions = sortedNetworks.map(network => ({
    label: getChainShortName(network),
    value: network,
    selectedLabel: (
      <Image alt={network} height="20" src={`/images/chains/${network}.svg`} width="20" />
    ),
  }))

  function isCheckedNetwork(network: GqlChain): boolean {
    return !!toggledNetworks.includes(network)
  }

  return (
    <MultiSelect<GqlChain>
      isChecked={isCheckedNetwork}
      label="All networks"
      options={networkOptions}
      toggleAll={() => setNetworks(null)}
      toggleOption={toggleNetwork}
    />
  )
}

function PoolMinTvlFilter() {
  const { toCurrency } = useCurrency()
  const {
    queryState: { minTvl, setMinTvl },
  } = usePoolList()
  const [sliderValue, setSliderValue] = useState(minTvl)

  const debounced = useDebouncedCallback((val: number) => {
    const minTvl = val > 0 ? val : null
    setMinTvl(minTvl)
  }, defaultDebounceMs)

  // set min tvl value here to keep slider performant
  useEffect(() => {
    debounced(sliderValue)
  }, [sliderValue])

  // sync slider value with minTvl value
  useEffect(() => {
    setSliderValue(minTvl)
  }, [minTvl])

  return (
    <VStack w="full">
      <HStack w="full">
        <Heading as="h3" mb="xs" mt="sm" size="sm">
          Minimum TVL
        </Heading>
        <Text fontSize="sm" ml="auto">
          {toCurrency(sliderValue)}
        </Text>
      </HStack>
      <Slider
        aria-label="slider-min-tvl"
        max={SLIDER_MAX_VALUE}
        min={0}
        ml="sm"
        onChange={val => setSliderValue(val)}
        step={SLIDER_STEP_SIZE}
        value={sliderValue}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </VStack>
  )
}

export interface FilterTagsPops {
  networks: GqlChain[]
  toggleNetwork: (checked: boolean, value: GqlChain) => void
  poolTypes: PoolFilterType[]
  togglePoolType: (checked: boolean, value: PoolFilterType) => void
  poolTypeLabel: (poolType: PoolFilterType) => string
  minTvl?: number
  setMinTvl?: (value: number | null) => void
  poolTags?: PoolTagType[]
  togglePoolTag?: (checked: boolean, value: PoolTagType) => void
  poolTagLabel?: (poolTag: PoolTagType) => string
  includeExpiredPools?: boolean
  toggleIncludeExpiredPools?: (checked: boolean) => void
  hasHook?: boolean
  setHasHook?: (value: boolean | null) => void
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
  hasHook,
  setHasHook,
}: FilterTagsPops) {
  const { toCurrency } = useCurrency()

  // prevents layout shift in mobile view
  if (
    networks.length === 0 &&
    poolTypes.length === 0 &&
    minTvl === 0 &&
    (poolTags ? poolTags.length === 0 : true) &&
    !includeExpiredPools &&
    !hasHook
  ) {
    return <Box display={{ base: 'flex', md: 'none' }} minHeight="32px" />
  }

  return (
    <HStack spacing="sm" wrap="wrap">
      <AnimatePresence>
        {poolTypes.map(poolType => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
            initial={{ opacity: 0, y: 40 }}
            key={poolType}
            transition={{
              enter: { ease: 'easeOut', duration: 0.15, delay: 0.05 },
              exit: { ease: 'easeIn', duration: 0.05, delay: 0 },
            }}
          >
            <Tag size="lg">
              <TagLabel>
                <Text fontSize="sm" fontWeight="bold" textTransform="capitalize">
                  {poolTypeLabel(poolType)}
                </Text>
              </TagLabel>
              <TagCloseButton onClick={() => togglePoolType(false, poolType)} />
            </Tag>
          </motion.div>
        ))}
      </AnimatePresence>
      <AnimatePresence>
        {networks.map(network => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
            initial={{ opacity: 0, y: 40 }}
            key={network}
            transition={{
              enter: { ease: 'easeOut', duration: 0.15, delay: 0.05 },
              exit: { ease: 'easeIn', duration: 0.05, delay: 0 },
            }}
          >
            <Tag size="lg">
              <TagLabel>
                <Text fontSize="sm" fontWeight="bold" textTransform="capitalize">
                  {network.toLowerCase()}
                </Text>
              </TagLabel>
              <TagCloseButton onClick={() => toggleNetwork(false, network)} />
            </Tag>
          </motion.div>
        ))}
      </AnimatePresence>
      {minTvl && minTvl > 0 && (
        <AnimatePresence>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
            initial={{ opacity: 0, y: 40 }}
            key="minTvl"
            transition={{
              enter: { ease: 'easeOut', duration: 0.15, delay: 0.05 },
              exit: { ease: 'easeIn', duration: 0.05, delay: 0 },
            }}
          >
            <Tag size="lg">
              <TagLabel>
                <Text fontSize="sm" fontWeight="bold" textTransform="capitalize">
                  {`TVL > ${toCurrency(minTvl)}`}
                </Text>
              </TagLabel>
              <TagCloseButton onClick={() => setMinTvl && setMinTvl(0)} />
            </Tag>
          </motion.div>
        </AnimatePresence>
      )}
      {poolTags && poolTagLabel && (
        <AnimatePresence>
          {poolTags.map(tag => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0 }}
              initial={{ opacity: 0, y: 40 }}
              key={tag}
              transition={{
                enter: { ease: 'easeOut', duration: 0.15, delay: 0.05 },
                exit: { ease: 'easeIn', duration: 0.05, delay: 0 },
              }}
            >
              <Tag size="lg">
                <TagLabel>
                  <Text fontSize="sm" fontWeight="bold" textTransform="capitalize">
                    {poolTagLabel(tag)}
                  </Text>
                </TagLabel>
                <TagCloseButton onClick={() => togglePoolTag && togglePoolTag(false, tag)} />
              </Tag>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
      {includeExpiredPools && (
        <AnimatePresence>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
            initial={{ opacity: 0, y: 40 }}
            key="expiredPools"
            transition={{
              enter: { ease: 'easeOut', duration: 0.15, delay: 0.05 },
              exit: { ease: 'easeIn', duration: 0.05, delay: 0 },
            }}
          >
            <Tag size="lg">
              <TagLabel>
                <Text fontSize="sm" fontWeight="bold" textTransform="capitalize">
                  Expired
                </Text>
              </TagLabel>
              <TagCloseButton
                onClick={() => toggleIncludeExpiredPools && toggleIncludeExpiredPools(false)}
              />
            </Tag>
          </motion.div>
        </AnimatePresence>
      )}
      {hasHook && (
        <AnimatePresence>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
            initial={{ opacity: 0, y: 40 }}
            key="hasHook"
            transition={{
              enter: { ease: 'easeOut', duration: 0.15, delay: 0.05 },
              exit: { ease: 'easeIn', duration: 0.05, delay: 0 },
            }}
          >
            <Tag size="lg">
              <TagLabel>
                <Text fontSize="sm" fontWeight="bold">
                  All hooks
                </Text>
              </TagLabel>
              <TagCloseButton onClick={() => setHasHook && setHasHook(null)} />
            </Tag>
          </motion.div>
        </AnimatePresence>
      )}
    </HStack>
  )
}

export const FilterButton = forwardRef<ButtonProps & { totalFilterCount: number }, 'button'>(
  ({ totalFilterCount, ...props }, ref) => {
    const { isMobile } = useBreakpoints()
    const textColor = useColorModeValue('#fff', 'font.dark')

    return (
      <Button ref={ref} {...props} display="flex" gap="2" variant="tertiary">
        <Icon as={Filter} boxSize={4} />
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
  }
)

export interface ProtocolVersionFilterProps {
  setProtocolVersion: React.Dispatch<React.SetStateAction<number | null>>
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
      poolTypeLabel,
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

  const { options, externalLinks } = PROJECT_CONFIG
  const subPath = !options.showVeBal ? '' : isCowPath ? 'cow' : 'v3'
  const poolCreatorUrl = `${externalLinks.poolComposerUrl}/${subPath}`

  return (
    <VStack w="full">
      <HStack gap="0" justify="end" spacing="none" w="full">
        <PoolListSearch />
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
                            <Button
                              h="fit-content"
                              onClick={_resetFilters}
                              size="xs"
                              variant="link"
                            >
                              Reset all
                            </Button>
                          )}
                        </Flex>
                      </Box>

                      {isConnected ? (
                        <Box as={motion.div} variants={staggeredFadeInUp}>
                          <Heading as="h3" my="sm" size="sm">
                            My liquidity
                          </Heading>
                          <UserPoolFilter />
                        </Box>
                      ) : null}
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
                      {!isCowPath && (
                        <Box as={motion.div} variants={staggeredFadeInUp}>
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
                        </Box>
                      )}
                      {!isFixedPoolType && (
                        <Box as={motion.div} variants={staggeredFadeInUp}>
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
                        </Box>
                      )}
                      <Box as={motion.div} variants={staggeredFadeInUp}>
                        <Heading as="h3" mb="sm" size="sm">
                          Pool categories
                        </Heading>
                        <PoolCategoryFilters hidePoolTags={options.hidePoolTags} />
                      </Box>
                      <Box as={motion.div} variants={staggeredFadeInUp}>
                        <Heading as="h3" mb="sm" size="sm">
                          Hooks
                        </Heading>
                        <PoolHookFilters />
                      </Box>
                      <Box as={motion.div} mb="xs" variants={staggeredFadeInUp} w="full">
                        <PoolMinTvlFilter />
                      </Box>
                    </VStack>
                  ) : null}
                </AnimatePresence>
              </PopoverBody>
            </PopoverContent>
          </Box>
        </Popover>
        <Button
          as={Link}
          display="flex"
          gap="2"
          href={poolCreatorUrl}
          ml="ms"
          rel=""
          target="_blank"
          variant="tertiary"
        >
          <Icon as={Plus} boxSize={4} />
          {!isMobile && 'Create a pool'}
        </Button>
      </HStack>
    </VStack>
  )
}
