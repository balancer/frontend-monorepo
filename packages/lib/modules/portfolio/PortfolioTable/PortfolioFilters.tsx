import {
  Box,
  Text,
  ButtonProps,
  useColorModeValue,
  Button,
  Icon,
  Badge,
  Center,
  Flex,
  Heading,
  HStack,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  VStack,
  forwardRef,
  Checkbox,
} from '@chakra-ui/react'
import { getChainShortName } from '@repo/lib/config/app.config'
import { MultiSelect } from '@repo/lib/shared/components/inputs/MultiSelect'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { staggeredFadeInUp } from '@repo/lib/shared/utils/animations'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Filter } from 'react-feather'
import { usePortfolioFilters } from './PortfolioFiltersProvider'
import { PoolFilterType } from '../../pool/pool.types'
import { poolTypeLabel } from '../../pool/pool.helpers'
import { AnimatedTag } from '@repo/lib/shared/components/other/AnimatedTag'
import { ExpandedPoolType } from './useExpandedPools'
import { getStakingText } from '../portfolio.helpers'

export interface PortfolioNetworkFiltersArgs {
  toggledNetworks: GqlChain[]
  toggleNetwork: (checked: boolean, value: GqlChain) => void
  setNetworks: (networks: GqlChain[]) => void
  networks: GqlChain[]
}

export function PortfolioNetworkFilters({
  toggledNetworks,
  toggleNetwork,
  setNetworks,
  networks,
}: PortfolioNetworkFiltersArgs) {
  const networkOptions = networks.map(network => ({
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
      toggleAll={() => setNetworks([])}
      toggleOption={toggleNetwork}
    />
  )
}

export interface PortfolioPoolTypeFiltersArgs {
  poolTypes: PoolFilterType[]
  poolTypeLabel: (poolType: PoolFilterType) => string
  setPoolTypes: (poolTypes: PoolFilterType[]) => void
  togglePoolType: (checked: boolean, value: PoolFilterType) => void
  availablePoolTypes: PoolFilterType[]
}

export function PoolTypeFilters({
  togglePoolType,
  poolTypes,
  poolTypeLabel,
  availablePoolTypes,
}: PortfolioPoolTypeFiltersArgs) {
  return (
    <Box animate="show" as={motion.div} exit="exit" initial="hidden" variants={staggeredFadeInUp}>
      {availablePoolTypes.map(poolType => (
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

export interface PortfolioStakingTypeFiltersArgs {
  stakingTypes: ExpandedPoolType[]
  setStakingTypes: (stakingTypes: ExpandedPoolType[]) => void
  toggleStakingType: (checked: boolean, value: ExpandedPoolType) => void
  availableStakingTypes: ExpandedPoolType[]
}

export function StakingTypeFilters({
  toggleStakingType,
  stakingTypes,
  availableStakingTypes,
}: PortfolioStakingTypeFiltersArgs) {
  return (
    <Box animate="show" as={motion.div} exit="exit" initial="hidden" variants={staggeredFadeInUp}>
      {availableStakingTypes.map(stakingType => (
        <Box as={motion.div} key={stakingType} variants={staggeredFadeInUp}>
          <Checkbox
            isChecked={!!stakingTypes.find(selected => selected === stakingType)}
            onChange={e => toggleStakingType(e.target.checked, stakingType)}
          >
            <Text fontSize="sm" textTransform="capitalize">
              {getStakingText(stakingType)}
            </Text>
          </Checkbox>
        </Box>
      ))}
    </Box>
  )
}

export function usePortfolioFilterTagsVisible() {
  const { selectedNetworks, selectedPoolTypes, selectedStakingTypes } = usePortfolioFilters()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(
      selectedNetworks.length > 0 || selectedPoolTypes.length > 0 || selectedStakingTypes.length > 0
    )
  }, [selectedNetworks, selectedPoolTypes, selectedStakingTypes])

  return isVisible
}

export interface PortfolioFilterTagsPops {
  networks: GqlChain[]
  toggleNetwork: (checked: boolean, value: GqlChain) => void
  poolTypes: PoolFilterType[]
  togglePoolType: (checked: boolean, value: PoolFilterType) => void
  stakingTypes: ExpandedPoolType[]
  toggleStakingType: (checked: boolean, value: ExpandedPoolType) => void
}

export function PortfolioFilterTags({
  networks,
  toggleNetwork,
  poolTypes,
  togglePoolType,
  stakingTypes,
  toggleStakingType,
}: PortfolioFilterTagsPops) {
  // prevents layout shift in mobile view
  if (networks.length === 0 && poolTypes.length === 0 && stakingTypes.length === 0) {
    return <Box display={{ base: 'flex', md: 'none' }} minHeight="32px" />
  }

  return (
    <HStack spacing="sm" wrap="wrap">
      <AnimatePresence>
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
        {stakingTypes.map(stakingType => (
          <AnimatedTag
            key={stakingType}
            label={getStakingText(stakingType)}
            onClose={() => toggleStakingType(false, stakingType)}
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

export function PortfolioFilters() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const {
    selectedNetworks,
    setSelectedNetworks,
    toggleNetwork,
    totalFilterCount,
    resetFilters,
    availableNetworks,
    selectedPoolTypes,
    setSelectedPoolTypes,
    togglePoolType,
    availablePoolTypes,
    selectedStakingTypes,
    setSelectedStakingTypes,
    toggleStakingType,
    availableStakingTypes,
  } = usePortfolioFilters()

  return (
    <VStack w="full">
      <HStack gap="0" justify="end" spacing="none" w="full">
        {/* <PoolListSearch /> */}
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
                            <Button h="fit-content" onClick={resetFilters} size="xs" variant="link">
                              Reset all
                            </Button>
                          )}
                        </Flex>
                      </Box>
                      {availableNetworks.length > 1 && (
                        <Box as={motion.div} variants={staggeredFadeInUp} w="full">
                          <Heading as="h3" mb="sm" size="sm">
                            Networks
                          </Heading>
                          <PortfolioNetworkFilters
                            networks={availableNetworks}
                            setNetworks={setSelectedNetworks}
                            toggleNetwork={toggleNetwork}
                            toggledNetworks={selectedNetworks}
                          />
                        </Box>
                      )}
                      <Box as={motion.div} variants={staggeredFadeInUp}>
                        <Heading as="h3" mb="sm" size="sm">
                          Pool types
                        </Heading>
                        <PoolTypeFilters
                          availablePoolTypes={availablePoolTypes}
                          poolTypeLabel={poolTypeLabel}
                          poolTypes={selectedPoolTypes}
                          setPoolTypes={setSelectedPoolTypes}
                          togglePoolType={togglePoolType}
                        />
                      </Box>
                      <Box as={motion.div} variants={staggeredFadeInUp}>
                        <Heading as="h3" mb="sm" size="sm">
                          Staking types
                        </Heading>
                        <StakingTypeFilters
                          availableStakingTypes={availableStakingTypes}
                          setStakingTypes={setSelectedStakingTypes}
                          stakingTypes={selectedStakingTypes}
                          toggleStakingType={toggleStakingType}
                        />
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
