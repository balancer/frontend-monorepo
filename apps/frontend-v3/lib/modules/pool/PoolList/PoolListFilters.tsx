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
  VisuallyHidden,
  VStack,
} from '@chakra-ui/react'
import { PoolListSearch } from './PoolListSearch'
import { getProjectConfig } from '@/lib/config/getProjectConfig'
import { usePoolListQueryState } from './usePoolListQueryState'
import {
  PoolFilterType,
  poolTypeFilters,
  PoolCategoryType,
  poolCategoryFilters,
} from '../pool.types'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import { useEffect, useState } from 'react'
import { Filter } from 'react-feather'
import { useBreakpoints } from '@/lib/shared/hooks/useBreakpoints'
import { useCurrency } from '@/lib/shared/hooks/useCurrency'
import { useDebouncedCallback } from 'use-debounce'
import { defaultDebounceMs } from '@/lib/shared/utils/queries'
import { motion, AnimatePresence } from 'framer-motion'
import { staggeredFadeInUp } from '@/lib/shared/utils/animations'
import { getChainShortName } from '@/lib/config/app.config'
import { usePoolList } from './PoolListProvider'
import { MultiSelect } from '@/lib/shared/components/inputs/MultiSelect'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import Image from 'next/image'

const SLIDER_MAX_VALUE = 10000000
const SLIDER_STEP_SIZE = 100000

export function useFilterTagsVisible() {
  const { networks, poolTypes, minTvl, poolCategories } = usePoolListQueryState()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(
      networks.length > 0 || poolTypes.length > 0 || minTvl > 0 || poolCategories.length > 0
    )
  }, [networks, poolTypes, minTvl, poolCategories])

  return isVisible
}

function UserPoolFilter() {
  const { userAddress, toggleUserAddress } = usePoolListQueryState()
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
      mb="xxs"
      isChecked={checked}
      onChange={e => toggleUserAddress(e.target.checked, connectedUserAddress as string)}
    >
      <Text fontSize="sm">My positions</Text>
    </Checkbox>
  )
}

function PoolCategoryFilters() {
  const { togglePoolCategory, poolCategories, setPoolCategories, poolCategoryLabel } =
    usePoolListQueryState()

  // remove query param when empty
  useEffect(() => {
    if (!poolCategories.length) {
      setPoolCategories(null)
    }
  }, [poolCategories])

  return (
    <Box as={motion.div} initial="hidden" animate="show" exit="exit" variants={staggeredFadeInUp}>
      {poolCategoryFilters.map(category => (
        <Box key={category} as={motion.div} variants={staggeredFadeInUp}>
          <Checkbox
            isChecked={!!poolCategories.find(selected => selected === category)}
            onChange={e => togglePoolCategory(e.target.checked, category as PoolCategoryType)}
          >
            <Text fontSize="sm">{poolCategoryLabel(category)}</Text>
          </Checkbox>
        </Box>
      ))}
    </Box>
  )
}

function PoolTypeFilters() {
  const { togglePoolType, poolTypes, poolTypeLabel, setPoolTypes } = usePoolListQueryState()

  // remove query param when empty
  useEffect(() => {
    if (!poolTypes.length) {
      setPoolTypes(null)
    }
  }, [poolTypes])

  return (
    <Box as={motion.div} initial="hidden" animate="show" exit="exit" variants={staggeredFadeInUp}>
      {poolTypeFilters.map(poolType => (
        <Box key={poolType} as={motion.div} variants={staggeredFadeInUp}>
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

function PoolNetworkFilters() {
  const { supportedNetworks } = getProjectConfig()
  const { networks: toggledNetworks, toggleNetwork, setNetworks } = usePoolListQueryState()

  // Sort networks alphabetically after mainnet
  const sortedNetworks = [supportedNetworks[0], ...supportedNetworks.slice(1).sort()]

  const networkOptions = sortedNetworks.map(network => ({
    label: getChainShortName(network),
    value: network,
    selectedLabel: (
      <Image src={`/images/chains/${network}.svg`} alt={network} width="20" height="20" />
    ),
  }))

  function isCheckedNetwork(network: GqlChain): boolean {
    return !!toggledNetworks.includes(network)
  }

  return (
    <MultiSelect<GqlChain>
      options={networkOptions}
      isChecked={isCheckedNetwork}
      toggleOption={toggleNetwork}
      toggleAll={() => setNetworks(null)}
      label="All networks"
    />
  )
}

function PoolMinTvlFilter() {
  const { toCurrency } = useCurrency()
  const { minTvl, setMinTvl } = usePoolListQueryState()
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
        <Heading as="h3" size="sm" mt="sm" mb="xs">
          Minimum TVL
        </Heading>
        <Text fontSize="sm" ml="auto">
          {toCurrency(sliderValue)}
        </Text>
      </HStack>
      <Slider
        aria-label="slider-min-tvl"
        onChange={val => setSliderValue(val)}
        value={sliderValue}
        min={0}
        max={SLIDER_MAX_VALUE}
        step={SLIDER_STEP_SIZE}
        ml="sm"
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </VStack>
  )
}

export function FilterTags() {
  const {
    networks,
    toggleNetwork,
    poolTypes,
    togglePoolType,
    poolTypeLabel,
    minTvl,
    setMinTvl,
    poolCategories,
    togglePoolCategory,
    poolCategoryLabel,
  } = usePoolListQueryState()
  const { toCurrency } = useCurrency()

  if (
    networks.length === 0 &&
    poolTypes.length === 0 &&
    minTvl === 0 &&
    poolCategories.length === 0
  ) {
    return <></>
  }

  return (
    <HStack spacing="sm" wrap="wrap">
      <AnimatePresence>
        {poolTypes.map(poolType => (
          <motion.div
            key={poolType}
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 40 }}
            exit={{ opacity: 0, y: 0 }}
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
            key={network}
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 40 }}
            exit={{ opacity: 0, y: 0 }}
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
      {minTvl > 0 && (
        <AnimatePresence>
          <motion.div
            key="minTvl"
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 40 }}
            exit={{ opacity: 0, y: 0 }}
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
              <TagCloseButton onClick={() => setMinTvl(0)} />
            </Tag>
          </motion.div>
        </AnimatePresence>
      )}
      <AnimatePresence>
        {poolCategories.map(poolCategory => (
          <motion.div
            key={poolCategory}
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 40 }}
            exit={{ opacity: 0, y: 0 }}
            transition={{
              enter: { ease: 'easeOut', duration: 0.15, delay: 0.05 },
              exit: { ease: 'easeIn', duration: 0.05, delay: 0 },
            }}
          >
            <Tag size="lg">
              <TagLabel>
                <Text fontSize="sm" fontWeight="bold" textTransform="capitalize">
                  {poolCategoryLabel(poolCategory)}
                </Text>
              </TagLabel>
              <TagCloseButton onClick={() => togglePoolCategory(false, poolCategory)} />
            </Tag>
          </motion.div>
        ))}
      </AnimatePresence>
    </HStack>
  )
}

const FilterButton = forwardRef<ButtonProps, 'button'>((props, ref) => {
  const { totalFilterCount } = usePoolListQueryState()
  const { isMobile } = useBreakpoints()
  const textColor = useColorModeValue('#fff', 'font.dark')

  return (
    <Button ref={ref} {...props} display="flex" gap="2" variant="tertiary">
      <Icon as={Filter} boxSize={4} />
      {!isMobile && 'Filters'}
      {totalFilterCount > 0 && (
        <Badge
          bg="font.highlight"
          color={textColor}
          borderRadius="full"
          p="0"
          position="absolute"
          right="-9px"
          top="-9px"
          shadow="lg"
        >
          <Center h="5" w="5">
            {totalFilterCount}
          </Center>
        </Badge>
      )}
    </Button>
  )
})

export function PoolListFilters() {
  const { isConnected } = useUserAccount()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const { resetFilters, totalFilterCount } = usePoolListQueryState()
  const { isFixedPoolType } = usePoolList()

  return (
    <VStack w="full">
      <HStack w="full" spacing="none" justify="end" gap="0">
        <PoolListSearch />
        <Popover
          isOpen={isPopoverOpen}
          onOpen={() => setIsPopoverOpen(true)}
          onClose={() => setIsPopoverOpen(false)}
          placement="bottom-end"
        >
          <PopoverTrigger>
            <FilterButton ml="ms" />
          </PopoverTrigger>
          <Box zIndex="popover" shadow="2xl">
            <PopoverContent>
              <PopoverArrow bg="background.level3" />
              <PopoverCloseButton top="sm" />
              <PopoverBody p="md">
                <AnimatePresence>
                  {isPopoverOpen && (
                    <VStack
                      align="start"
                      spacing="xxs"
                      as={motion.div}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      variants={staggeredFadeInUp}
                    >
                      <Box lineHeight="0" p="0" as={motion.div} variants={staggeredFadeInUp}>
                        <Flex gap="ms" alignItems="center" w="full" justifyContent="space-between">
                          <Text
                            variant="eyebrow"
                            background="font.special"
                            backgroundClip="text"
                            fontSize="xs"
                            display="inline"
                            lineHeight="1"
                          >
                            Filters
                          </Text>

                          <Button size="xs" variant="link" onClick={resetFilters}>
                            {totalFilterCount === 0 ? (
                              <VisuallyHidden>Reset all</VisuallyHidden>
                            ) : (
                              'Reset all'
                            )}
                          </Button>
                        </Flex>
                      </Box>

                      {isConnected && (
                        <Box as={motion.div} variants={staggeredFadeInUp}>
                          <Heading as="h3" size="sm" my="sm">
                            My liquidity
                          </Heading>
                          <UserPoolFilter />
                        </Box>
                      )}
                      <Box as={motion.div} variants={staggeredFadeInUp} w="full">
                        <Heading as="h3" size="sm" my="sm">
                          Networks
                        </Heading>
                        <PoolNetworkFilters />
                      </Box>
                      {!isFixedPoolType && (
                        <Box as={motion.div} variants={staggeredFadeInUp}>
                          <Heading as="h3" size="sm" my="sm">
                            Pool types
                          </Heading>
                          <PoolTypeFilters />
                        </Box>
                      )}
                      <Box as={motion.div} variants={staggeredFadeInUp}>
                        <Heading as="h3" size="sm" my="sm">
                          Pool categories
                        </Heading>
                        <PoolCategoryFilters />
                      </Box>

                      <Box mb="xs" as={motion.div} variants={staggeredFadeInUp} w="full">
                        <PoolMinTvlFilter />
                      </Box>
                    </VStack>
                  )}
                </AnimatePresence>
              </PopoverBody>
            </PopoverContent>
          </Box>
        </Popover>
      </HStack>
    </VStack>
  )
}
