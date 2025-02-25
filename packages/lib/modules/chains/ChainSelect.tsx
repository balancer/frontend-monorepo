'use client'

import { getChainShortName } from '@repo/lib/config/app.config'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { Box, HStack, Text } from '@chakra-ui/react'
import { GroupBase, chakraComponents, DropdownIndicatorProps } from 'chakra-react-select'
import { ChevronDown, Globe } from 'react-feather'
import { motion } from 'framer-motion'
import { pulseOnceWithDelay } from '@repo/lib/shared/utils/animations'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { SelectInput, SelectOption } from '@repo/lib/shared/components/inputs/SelectInput'

type Props = {
  value: GqlChain
  onChange(value: GqlChain): void
  chains?: GqlChain[]
}

function DropdownIndicator({
  ...props
}: DropdownIndicatorProps<SelectOption, false, GroupBase<SelectOption>>) {
  return (
    <chakraComponents.DropdownIndicator {...props}>
      <HStack>
        <Globe size={16} />
        <ChevronDown size={16} />
      </HStack>
    </chakraComponents.DropdownIndicator>
  )
}

export function ChainSelect({ value, onChange, chains = PROJECT_CONFIG.supportedNetworks }: Props) {
  const networkOptions: SelectOption[] = chains.map(chain => ({
    label: (
      <HStack>
        <NetworkIcon chain={chain} size={6} />
        <Text>{getChainShortName(chain)}</Text>
      </HStack>
    ),
    value: chain,
  }))

  return (
    <Box animate={pulseOnceWithDelay} as={motion.div} w="full" zIndex="10">
      <SelectInput
        DropdownIndicator={DropdownIndicator}
        id="chain-select"
        onChange={onChange}
        options={networkOptions}
        value={value}
      />
    </Box>
  )
}
