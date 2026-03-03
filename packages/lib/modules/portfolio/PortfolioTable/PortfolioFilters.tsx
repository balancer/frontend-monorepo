import {
  Box,
  Text,
  ButtonProps,
  Button,
  Icon,
  Badge,
  Center,
  Flex,
  Heading,
  HStack,
  Popover,
  VStack,
  Checkbox } from '@chakra-ui/react';
import { useThemeColorMode } from '@repo/lib/shared/services/chakra/useThemeColorMode';
import { getChainShortName } from '@repo/lib/config/app.config'
import { MultiSelect } from '@repo/lib/shared/components/inputs/MultiSelect'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { staggeredFadeInUp } from '@repo/lib/shared/utils/animations'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useState, forwardRef } from 'react';
import { Filter } from 'react-feather'
import { usePortfolioFilters } from './PortfolioFiltersProvider'
import { PoolFilterType } from '../../pool/pool.types'
import { poolTypeLabel } from '../../pool/pool.helpers'
import { AnimatedTag } from '@repo/lib/shared/components/other/AnimatedTag'
import { StakingFilterKeyType, STAKING_LABEL_MAP } from './useExpandedPools'

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
  networks }: PortfolioNetworkFiltersArgs) {
  const networkOptions = networks.map(network => ({
    label: getChainShortName(network),
    value: network,
    selectedLabel: (
      <Image alt={network} height="20" src={`/images/chains/${network}.svg`} width="20" />
    ) }))

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

interface CheckboxFilterListProps<T> {
  availableItems: T[]
  selectedItems: T[]
  toggleItem: (checked: boolean, value: T) => void
  getItemLabel: (item: T) => string
}

function CheckboxFilterList<T>({
  availableItems,
  selectedItems,
  toggleItem,
  getItemLabel }: CheckboxFilterListProps<T>) {
  return (
    <Box animate="show" exit="exit" initial="hidden" variants={staggeredFadeInUp} asChild><motion.div>
        {availableItems.map(item => (
          <Box variants={staggeredFadeInUp} asChild><motion.div key={String(item)}>
              <Checkbox.Root
                onCheckedChange={e => toggleItem(e.target.checked, item)}
                checked={!!selectedItems.find(selected => selected === item)}
              ><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control></Checkbox.Root><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control></Checkbox.Root></Checkbox.Label></Checkbox.Root><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label>
                  <Text fontSize="sm" textTransform="capitalize">
                    {getItemLabel(item)}
                  </Text>
                </Checkbox.Label></Checkbox.Root></Checkbox.Label></Checkbox.Root>
            </motion.div></Box>
        ))}
      </motion.div></Box>
  );
}

export interface PortfolioPoolTypeFiltersArgs {
  poolTypes: PoolFilterType[]
  setPoolTypes: (poolTypes: PoolFilterType[]) => void
  togglePoolType: (checked: boolean, value: PoolFilterType) => void
  availablePoolTypes: PoolFilterType[]
}

export function PoolTypeFilters({
  togglePoolType,
  poolTypes,
  availablePoolTypes }: PortfolioPoolTypeFiltersArgs) {
  return (
    <CheckboxFilterList
      availableItems={availablePoolTypes}
      getItemLabel={poolTypeLabel}
      selectedItems={poolTypes}
      toggleItem={togglePoolType}
    />
  )
}

export interface PortfolioStakingTypeFiltersArgs {
  availableStakingTypes: StakingFilterKeyType[]
  stakingTypes: StakingFilterKeyType[]
  toggleStakingType: (checked: boolean, value: StakingFilterKeyType) => void
}

export function StakingTypeFilters({
  availableStakingTypes,
  stakingTypes,
  toggleStakingType }: PortfolioStakingTypeFiltersArgs) {
  return (
    <CheckboxFilterList
      availableItems={availableStakingTypes}
      getItemLabel={item => STAKING_LABEL_MAP[item]}
      selectedItems={stakingTypes}
      toggleItem={toggleStakingType}
    />
  )
}

export function usePortfolioFilterTagsVisible() {
  const { selectedNetworks, selectedPoolTypes, selectedStakingTypes } = usePortfolioFilters()

  return (
    selectedNetworks.length > 0 || selectedPoolTypes.length > 0 || selectedStakingTypes.length > 0
  )
}

export interface PortfolioFilterTagsPops {
  networks: GqlChain[]
  toggleNetwork: (checked: boolean, value: GqlChain) => void
  poolTypes: PoolFilterType[]
  togglePoolType: (checked: boolean, value: PoolFilterType) => void
  stakingTypes: StakingFilterKeyType[]
  toggleStakingType: (checked: boolean, value: StakingFilterKeyType) => void
}

export function PortfolioFilterTags({
  networks,
  toggleNetwork,
  poolTypes,
  togglePoolType,
  stakingTypes,
  toggleStakingType }: PortfolioFilterTagsPops) {
  // prevents layout shift in mobile view
  if (networks.length === 0 && poolTypes.length === 0 && stakingTypes.length === 0) {
    return <Box display={{ base: 'flex', md: 'none' }} minHeight="32px" />
  }

  return (
    <HStack gap="sm" wrap="wrap">
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
        {stakingTypes.map((stakingTypeKey: StakingFilterKeyType) => (
          <AnimatedTag
            key={stakingTypeKey}
            label={STAKING_LABEL_MAP[stakingTypeKey]}
            onClose={() => toggleStakingType(false, stakingTypeKey)}
          />
        ))}
      </AnimatePresence>
    </HStack>
  );
}

export const FilterButton = forwardRef<HTMLButtonElement, ButtonProps & { totalFilterCount: number }>(
  ({ totalFilterCount, ...props }, ref) => {
    const { isMobile } = useBreakpoints()
    const colorMode = useThemeColorMode()
    const textColor = colorMode === 'dark' ? 'font.dark' : '#fff'

    return (
      <Button ref={ref} {...props} display="flex" gap="2" variant="tertiary">
        <Icon boxSize={4} asChild><Filter /></Icon>
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
    );
  }
)

export function PortfolioFilters({
  selectedNetworks,
  selectedPoolTypes }: {
  selectedNetworks?: GqlChain[]
  selectedPoolTypes?: PoolFilterType[]
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const {
    selectedNetworks: hookSelectedNetworks,
    setSelectedNetworks,
    toggleNetwork,
    totalFilterCount,
    resetFilters,
    availableNetworks,
    selectedPoolTypes: hookSelectedPoolTypes,
    setSelectedPoolTypes,
    togglePoolType,
    availablePoolTypes,
    selectedStakingTypes,
    toggleStakingType,
    availableStakingTypes } = usePortfolioFilters()

  const effectiveSelectedNetworks = selectedNetworks || hookSelectedNetworks
  const effectiveSelectedPoolTypes = selectedPoolTypes || hookSelectedPoolTypes

  const isDisabled =
    availableNetworks.length === 0 &&
    availablePoolTypes.length === 0 &&
    availableStakingTypes.length === 0

  return (
    <VStack w="full">
      <HStack gap="0" justify="end" gap="none" w="full">
        {/* <PoolListSearch /> */}
        <Popover.Root
          open={isPopoverOpen}
          onOpenChange={e => {
            if (e.open) {
              setIsPopoverOpen(true);
            } else {
              setIsPopoverOpen(false);
            }
          }}
          positioning={{
            placement: 'bottom-end'
          }}>
          <Popover.Trigger asChild>
            <FilterButton isDisabled={isDisabled} ml="ms" totalFilterCount={totalFilterCount} />
          </Popover.Trigger>
          <Box shadow="2xl" zIndex="popover">
            <Popover.Positioner>
              <Popover.Content>
                <Popover.Arrow bg="background.level3" />
                <Popover.CloseTrigger top="sm" />
                <Popover.Body p="md">
                  <AnimatePresence>
                    {isPopoverOpen ? (
                      <VStack
                        align="start"
                        animate="show"
                        exit="exit"
                        initial="hidden"
                        gap="md"
                        variants={staggeredFadeInUp}
                        asChild
                      ><motion.div>
                          <Box lineHeight="0" p="0" variants={staggeredFadeInUp} asChild><motion.div>
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
                                  <Button h="fit-content" onClick={resetFilters} size="xs" variant='plain'>
                                    Reset all
                                  </Button>
                                )}
                              </Flex>
                            </motion.div></Box>
                          {availableNetworks.length > 1 && (
                            <Box variants={staggeredFadeInUp} w="full" asChild><motion.div>
                                <Heading as="h3" mb="sm" size="sm">
                                  Networks
                                </Heading>
                                <PortfolioNetworkFilters
                                  networks={availableNetworks}
                                  setNetworks={setSelectedNetworks}
                                  toggledNetworks={effectiveSelectedNetworks}
                                  toggleNetwork={toggleNetwork}
                                />
                              </motion.div></Box>
                          )}
                          <Box variants={staggeredFadeInUp} asChild><motion.div>
                              <Heading as="h3" mb="sm" size="sm">
                                Pool types
                              </Heading>
                              <PoolTypeFilters
                                availablePoolTypes={availablePoolTypes}
                                poolTypes={effectiveSelectedPoolTypes}
                                setPoolTypes={setSelectedPoolTypes}
                                togglePoolType={togglePoolType}
                              />
                            </motion.div></Box>
                          <Box variants={staggeredFadeInUp} asChild><motion.div>
                              <Heading as="h3" mb="sm" size="sm">
                                Staking types
                              </Heading>
                              <StakingTypeFilters
                                availableStakingTypes={availableStakingTypes}
                                stakingTypes={selectedStakingTypes}
                                toggleStakingType={toggleStakingType}
                              />
                            </motion.div></Box>
                        </motion.div></VStack>
                    ) : null}
                  </AnimatePresence>
                </Popover.Body>
              </Popover.Content>
            </Popover.Positioner>
          </Box>
        </Popover.Root>
      </HStack>
    </VStack>
  );
}
