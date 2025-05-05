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
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
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
import { isBalancer, PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { poolTypeLabel } from '../pool.helpers'
import { AnimatedTag } from '@repo/lib/shared/components/other/AnimatedTag'

const SLIDER_MAX_VALUE = 10000000
const SLIDER_STEP_SIZE = 100000

export function useFilterTagsVisible() {
  const {
    queryState: { networks, poolTypes, minTvl, poolTags, poolHookTags, protocolVersion },
  } = usePoolList()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(
      networks.length > 0 ||
        poolTypes.length > 0 ||
        minTvl > 0 ||
        poolTags.length > 0 ||
        poolHookTags.length > 0 ||
        !!protocolVersion
    )
  }, [networks, poolTypes, minTvl, poolTags, poolHookTags, protocolVersion])

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
    <Box animate="show" as={motion.div} exit="exit" initial="hidden" variants={staggeredFadeInUp}>
      {livePoolHookTagFilters.map(tag => (
        <Box as={motion.div} key={tag} variants={staggeredFadeInUp}>
          <Checkbox
            isChecked={!!poolHookTags.find(selected => selected === tag)}
            onChange={e => togglePoolHookTag(e.target.checked, tag as PoolHookTagType)}
          >
            <Text fontSize="sm">{poolHookTagLabel(tag)}</Text>
          </Checkbox>
        </Box>
      ))}
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
    <HStack spacing="sm" wrap="wrap">
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

  const { options, externalLinks } = PROJECT_CONFIG
  const subPath = isCowPath ? 'cow' : 'v3'

  const poolCreatorUrl = isBalancer
    ? `${externalLinks.poolComposerUrl}/${subPath}`
    : externalLinks.poolComposerUrl

  return (
    <VStack w="full">
      <HStack gap="0" justify="end" spacing="none" w="full">
        <PoolListSearch />
        <Popover
          isLazy
          isOpen={isPopoverOpen}
          onClose={() => setIsPopoverOpen(false)}
          onOpen={() => setIsPopoverOpen(true)}
          placement="bottom-end"
        >
          <PopoverTrigger>
            <FilterButton ml="ms" totalFilterCount={totalFilterCount} />
          </PopoverTrigger>
          <Box shadow="2xl" zIndex="popover">
            <PopoverContent motionProps={{ animate: { scale: 1, opacity: 1 } }}>
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
                      {options.showPoolHooksFilter && (
                        <Box as={motion.div} variants={staggeredFadeInUp}>
                          <Heading as="h3" mb="sm" size="sm">
                            Hooks
                          </Heading>
                          <PoolHookFilters />
                        </Box>
                      )}
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
          {!isMobile && 'Create pool'}
        </Button>
      </HStack>
    </VStack>
  )
}
