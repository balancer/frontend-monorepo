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
} from '@chakra-ui/react'
import { getChainShortName } from '@repo/lib/config/app.config'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { MultiSelect } from '@repo/lib/shared/components/inputs/MultiSelect'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { staggeredFadeInUp } from '@repo/lib/shared/utils/animations'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'
import { Filter } from 'react-feather'
import { PortfolioFiltersProvider, usePortfolioFilters } from './PortfolioFiltersProvider'

export interface PortfolioNetworkFiltersArgs {
  toggledNetworks: GqlChain[]
  toggleNetwork: (checked: boolean, value: GqlChain) => void
  setNetworks: (networks: GqlChain[]) => void
}

export function PortfolioNetworkFilters({
  toggledNetworks,
  toggleNetwork,
  setNetworks,
}: PortfolioNetworkFiltersArgs) {
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
      toggleAll={() => setNetworks([])}
      toggleOption={toggleNetwork}
    />
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
  return (
    <PortfolioFiltersProvider>
      <PortfolioFiltersContent />
    </PortfolioFiltersProvider>
  )
}

function PortfolioFiltersContent() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const { networks, toggleNetwork, totalFilterCount, resetFilters, setNetworks } =
    usePortfolioFilters()

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
                      <Box as={motion.div} variants={staggeredFadeInUp} w="full">
                        <Heading as="h3" mb="sm" size="sm">
                          Networks
                        </Heading>
                        <PortfolioNetworkFilters
                          setNetworks={setNetworks}
                          toggleNetwork={toggleNetwork}
                          toggledNetworks={networks}
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
