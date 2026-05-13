'use client'

import {
  Badge,
  Box,
  Button,
  ButtonProps,
  Center,
  Checkbox,
  Flex,
  HStack,
  Heading,
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
  VStack,
  forwardRef,
  useColorModeValue,
} from '@chakra-ui/react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { Filter } from 'react-feather'
import { useState } from 'react'
import {
  GqlChain,
  GqlPoolType,
} from '@repo/lib/shared/services/api/generated/graphql'
import { MultiSelect } from '@repo/lib/shared/components/inputs/MultiSelect'
import { SearchInput } from '@repo/lib/shared/components/inputs/SearchInput'
import ButtonGroup, {
  ButtonGroupOption,
} from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { AnimatedTag } from '@repo/lib/shared/components/other/AnimatedTag'
import { NumberText } from '@repo/lib/shared/components/typography/NumberText'
import { getChainShortName } from '@repo/lib/config/app.config'
import { getPoolTypeLabel } from '@repo/lib/modules/pool/pool.utils'

const VERSION_TABS: ButtonGroupOption[] = [
  { value: 'all', label: 'All' },
  { value: 'v2', label: 'v2' },
  { value: 'v3', label: 'v3' },
  { value: 'cow', label: 'CoW' },
]

function versionToTab(v: number | null): ButtonGroupOption {
  if (v === 3) return VERSION_TABS[2]
  if (v === 2) return VERSION_TABS[1]
  if (v === 1) return VERSION_TABS[3]
  return VERSION_TABS[0]
}

function tabToVersion(tab: string): number | null {
  if (tab === 'v3') return 3
  if (tab === 'v2') return 2
  if (tab === 'cow') return 1
  return null
}

const HOOK_LABEL: Record<string, string> = {
  STABLE_SURGE: 'StableSurge',
  MEV_TAX: 'MEV tax',
  FEE_TAKING: 'Fee taking',
  EXIT_FEE: 'Exit fee',
  DIRECTIONAL_FEE: 'Directional fee',
  AKRON: 'Akron',
  LOTTERY: 'Lottery',
  NFTLIQUIDITY_POSITION: 'NFT liquidity',
  RECLAMM: 'reCLAMM',
  VEBAL_DISCOUNT: 'veBAL discount',
}

const formatHookLabel = (t: string) =>
  HOOK_LABEL[t] ??
  t
    .split('_')
    .map(p => p.charAt(0) + p.slice(1).toLowerCase())
    .join(' ')

const formatVersionLabel = (v: number | null) =>
  v === 3 ? 'v3' : v === 2 ? 'v2' : v === 1 ? 'CoW' : ''

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n || 0)

export type Filters = {
  search: string
  chains: GqlChain[]
  types: GqlPoolType[]
  protocolVersion: number | null
  hookTypes: string[]
  minTvl: number
}

export type FilterSetters = {
  setSearch: (v: string) => void
  setChains: (v: GqlChain[]) => void
  setTypes: (v: GqlPoolType[]) => void
  setProtocolVersion: (v: number | null) => void
  setHookTypes: (v: string[]) => void
  setMinTvl: (v: number) => void
  resetAll: () => void
}

type Props = {
  filters: Filters
  setters: FilterSetters
  availableChains: GqlChain[]
  availableTypes: GqlPoolType[]
  availableHooks: string[]
  isSearching?: boolean
  /**
   * Layout variant:
   *  - `full` (default): renders search input + filter trigger + chips together.
   *  - `trigger-only`: renders just the Filters popover trigger button (used
   *    when the caller wants to place it in a side rail next to a CSV button).
   *  - `search-and-chips`: renders the search input full-width + chips below,
   *    without the trigger button.
   */
  variant?: 'full' | 'trigger-only' | 'search-and-chips'
}

export function PoolExplorerFilters(props: Props) {
  const { filters, setters, variant = 'full' } = props
  const totalFilterCount =
    filters.chains.length +
    filters.types.length +
    filters.hookTypes.length +
    (filters.protocolVersion !== null ? 1 : 0) +
    (filters.minTvl > 0 ? 1 : 0)

  if (variant === 'trigger-only') {
    return <FilterPopover {...props} totalFilterCount={totalFilterCount} />
  }

  if (variant === 'search-and-chips') {
    return (
      <VStack align="stretch" spacing="sm" w="full">
        <Box
          sx={{
            '& input': {
              fontSize: 'md',
              height: '48px',
            },
          }}
          w="full"
        >
          <SearchInput
            ariaLabel="Search pools"
            autoFocus={false}
            isLoading={props.isSearching}
            placeholder="Search pool, token, address, hook…"
            search={filters.search}
            setSearch={setters.setSearch}
          />
        </Box>
        <FilterChips filters={filters} setters={setters} />
      </VStack>
    )
  }

  return (
    <VStack align="stretch" spacing="sm" w="full">
      <Flex
        align="center"
        direction={{ base: 'column', md: 'row' }}
        gap="sm"
        justify="space-between"
        w="full"
      >
        <Box
          flex="1"
          maxW={{ md: '420px', lg: '520px', xl: '640px' }}
          sx={{
            '& input': {
              fontSize: 'md',
              height: '48px',
            },
          }}
          w="full"
        >
          <SearchInput
            ariaLabel="Search pools"
            autoFocus={false}
            isLoading={props.isSearching}
            placeholder="Search pool, token, address, hook…"
            search={filters.search}
            setSearch={setters.setSearch}
          />
        </Box>
        <FilterPopover {...props} totalFilterCount={totalFilterCount} />
      </Flex>

      <FilterChips filters={filters} setters={setters} />
    </VStack>
  )
}

// -- popover ---------------------------------------------------------------

function FilterPopover({
  filters,
  setters,
  availableChains,
  availableTypes,
  availableHooks,
  totalFilterCount,
}: Props & { totalFilterCount: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover
      isLazy
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onOpen={() => setIsOpen(true)}
      placement="bottom-end"
    >
      <PopoverTrigger>
        <FilterButton totalFilterCount={totalFilterCount} />
      </PopoverTrigger>
      <Box shadow="2xl" zIndex="popover">
        <PopoverContent motionProps={{ animate: { scale: 1, opacity: 1 } }}>
          <PopoverArrow bg="background.level3" />
          <PopoverCloseButton top="sm" />
          <PopoverBody p="md">
            <VStack align="stretch" spacing="md">
              <Flex align="center" justify="space-between">
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
                    onClick={setters.resetAll}
                    size="xs"
                    variant="link"
                  >
                    Reset all
                  </Button>
                )}
              </Flex>

              <Box w="full">
                <Heading as="h3" mb="sm" size="sm">
                  Networks
                </Heading>
                <NetworkMultiSelect
                  availableChains={availableChains}
                  onChange={setters.setChains}
                  selected={filters.chains}
                />
              </Box>

              <Box w="full">
                <Heading as="h3" mb="sm" size="sm">
                  Protocol version
                </Heading>
                <ButtonGroup
                  currentOption={versionToTab(filters.protocolVersion)}
                  groupId="explorer-version"
                  isFullWidth
                  onChange={opt => setters.setProtocolVersion(tabToVersion(opt.value))}
                  options={VERSION_TABS}
                  size="xxs"
                />
              </Box>

              {availableTypes.length > 0 && (
                <Box w="full">
                  <Heading as="h3" mb="sm" size="sm">
                    Pool types
                  </Heading>
                  <CheckboxList
                    items={availableTypes}
                    labelFn={t => getPoolTypeLabel(t as GqlPoolType)}
                    onToggle={t => {
                      const next = filters.types.includes(t)
                        ? filters.types.filter(x => x !== t)
                        : [...filters.types, t]
                      setters.setTypes(next)
                    }}
                    selected={filters.types}
                  />
                </Box>
              )}

              {availableHooks.length > 0 && (
                <Box w="full">
                  <Heading as="h3" mb="sm" size="sm">
                    Hooks
                  </Heading>
                  <CheckboxList
                    items={availableHooks}
                    labelFn={formatHookLabel}
                    onToggle={t => {
                      const next = filters.hookTypes.includes(t)
                        ? filters.hookTypes.filter(x => x !== t)
                        : [...filters.hookTypes, t]
                      setters.setHookTypes(next)
                    }}
                    selected={filters.hookTypes}
                  />
                </Box>
              )}

              <Box w="full">
                <MinTvlSlider minTvl={filters.minTvl} setMinTvl={setters.setMinTvl} />
              </Box>
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Box>
    </Popover>
  )
}

const FilterButton = forwardRef<ButtonProps & { totalFilterCount: number }, 'button'>(
  ({ totalFilterCount, ...props }, ref) => {
    const badgeColor = useColorModeValue('#fff', 'font.dark')
    return (
      <Button display="flex" gap="2" position="relative" ref={ref} variant="tertiary" {...props}>
        <Icon as={Filter} boxSize={4} />
        Filters
        {totalFilterCount > 0 && (
          <Badge
            bg="font.highlight"
            borderRadius="full"
            color={badgeColor}
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

// -- network multi-select --------------------------------------------------

function NetworkMultiSelect({
  availableChains,
  selected,
  onChange,
}: {
  availableChains: GqlChain[]
  selected: GqlChain[]
  onChange: (v: GqlChain[]) => void
}) {
  const options = availableChains.map(chain => ({
    label: getChainShortName(chain),
    value: chain,
    icon: (
      <Box rounded="full" shadow="md">
        <Image alt={chain} height={16} src={`/images/chains/${chain}.svg`} width={16} />
      </Box>
    ),
    selectedLabel: (
      <HStack spacing="6px">
        <Box h="20px" rounded="full" shadow="md" w="20px">
          <Image alt={chain} height={20} src={`/images/chains/${chain}.svg`} width={20} />
        </Box>
      </HStack>
    ),
  }))

  return (
    <MultiSelect<GqlChain>
      bg="background.level4"
      isChecked={(c: GqlChain) => selected.includes(c)}
      label="All networks"
      options={options}
      rounded="md"
      toggleAll={() => onChange([])}
      toggleOption={(checked, value) => {
        if (checked) {
          if (!selected.includes(value)) onChange([...selected, value])
        } else {
          onChange(selected.filter(c => c !== value))
        }
      }}
    />
  )
}

// -- generic checkbox list -------------------------------------------------

function CheckboxList<T extends string>({
  items,
  selected,
  onToggle,
  labelFn,
}: {
  items: T[]
  selected: T[]
  onToggle: (item: T) => void
  labelFn: (item: T) => string
}) {
  return (
    <VStack align="start" spacing="xs">
      {items.map(item => (
        <Checkbox
          isChecked={selected.includes(item)}
          key={item}
          onChange={() => onToggle(item)}
        >
          <Text fontSize="sm">{labelFn(item)}</Text>
        </Checkbox>
      ))}
    </VStack>
  )
}

// -- min TVL slider --------------------------------------------------------

const SLIDER_MAX = 1000
const SLIDER_Q1 = 100_000
const SLIDER_MID = 1_000_000

function sliderToTvl(v: number): number {
  if (v <= 250) return Math.round((v / 250) * SLIDER_Q1)
  if (v <= 500) return Math.round(SLIDER_Q1 + ((v - 250) / 250) * (SLIDER_MID - SLIDER_Q1))
  const minLog = 6
  const maxLog = 8
  const t = (v - 500) / 500
  return Math.round(10 ** (minLog + (maxLog - minLog) * t))
}

function tvlToSlider(tvl: number): number {
  if (tvl <= SLIDER_Q1) return (tvl / SLIDER_Q1) * 250
  if (tvl <= SLIDER_MID) return 250 + ((tvl - SLIDER_Q1) / (SLIDER_MID - SLIDER_Q1)) * 250
  const minLog = 6
  const maxLog = 8
  return 500 + ((Math.log10(tvl) - minLog) / (maxLog - minLog)) * 500
}

const STEP_BUCKETS: { until: number; step: number }[] = [
  { until: 10_000, step: 1_000 },
  { until: 50_000, step: 2_500 },
  { until: 100_000, step: 5_000 },
  { until: 500_000, step: 25_000 },
  { until: 1_000_000, step: 50_000 },
  { until: 10_000_000, step: 100_000 },
  { until: 100_000_000, step: 1_000_000 },
]

function snapStep(value: number): number {
  let prev = 0
  for (const { until, step } of STEP_BUCKETS) {
    if (value <= until) {
      const snapped = Math.round((value - prev) / step) * step + prev
      return Math.max(prev, Math.min(snapped, until))
    }
    prev = until
  }
  const last = STEP_BUCKETS.at(-1)!
  const baseIdx = STEP_BUCKETS.length - 2
  const base = STEP_BUCKETS[baseIdx].until
  const snapped = Math.round((value - base) / last.step) * last.step + base
  return Math.max(base, Math.min(snapped, last.until))
}

function MinTvlSlider({
  minTvl,
  setMinTvl,
}: {
  minTvl: number
  setMinTvl: (v: number) => void
}) {
  const [sliderValue, setSliderValue] = useState(() => tvlToSlider(minTvl))
  const tvlValue = sliderToTvl(sliderValue)

  return (
    <VStack w="full">
      <HStack w="full">
        <Heading as="h3" mb="xs" mt="sm" size="sm">
          Minimum TVL
        </Heading>
        <NumberText fontSize="sm" ml="auto">
          {usd(tvlValue)}
        </NumberText>
      </HStack>
      <Slider
        aria-label="slider-min-tvl"
        max={SLIDER_MAX}
        min={0}
        ml="sm"
        onChange={v => setSliderValue(tvlToSlider(snapStep(sliderToTvl(v))))}
        onChangeEnd={v => setMinTvl(snapStep(sliderToTvl(v)))}
        step={1}
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

// -- active filter chips ---------------------------------------------------

function FilterChips({ filters, setters }: { filters: Filters; setters: FilterSetters }) {
  const isEmpty =
    filters.chains.length === 0 &&
    filters.types.length === 0 &&
    filters.hookTypes.length === 0 &&
    filters.protocolVersion === null &&
    filters.minTvl === 0

  // Prevent layout shift on mobile when no chips
  if (isEmpty) return <Box display={{ base: 'flex', md: 'none' }} minH="32px" />

  return (
    <HStack as={motion.div} spacing="sm" wrap="wrap">
      <AnimatePresence>
        {filters.protocolVersion !== null && (
          <AnimatedTag
            key="version"
            label={formatVersionLabel(filters.protocolVersion)}
            onClose={() => setters.setProtocolVersion(null)}
          />
        )}
        {filters.chains.map(chain => (
          <AnimatedTag
            key={`chain-${chain}`}
            label={getChainShortName(chain)}
            onClose={() => setters.setChains(filters.chains.filter(c => c !== chain))}
          />
        ))}
        {filters.types.map(type => (
          <AnimatedTag
            key={`type-${type}`}
            label={getPoolTypeLabel(type as GqlPoolType)}
            onClose={() => setters.setTypes(filters.types.filter(t => t !== type))}
          />
        ))}
        {filters.hookTypes.map(hook => (
          <AnimatedTag
            key={`hook-${hook}`}
            label={formatHookLabel(hook)}
            onClose={() => setters.setHookTypes(filters.hookTypes.filter(h => h !== hook))}
          />
        ))}
        {filters.minTvl > 0 && (
          <AnimatedTag
            key="minTvl"
            label={`TVL > ${usd(filters.minTvl)}`}
            onClose={() => setters.setMinTvl(0)}
          />
        )}
      </AnimatePresence>
    </HStack>
  )
}
