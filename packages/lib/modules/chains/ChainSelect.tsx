'use client'

import { getChainShortName } from '@repo/lib/config/app.config'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { getSelectStyles } from '@repo/lib/shared/services/chakra/custom/chakra-react-select'
import { Box, HStack, Text } from '@chakra-ui/react'
import {
  Select,
  OptionBase,
  GroupBase,
  SingleValue,
  chakraComponents,
  DropdownIndicatorProps,
} from 'chakra-react-select'
import { ReactNode, useEffect, useState } from 'react'
import { ChevronDown, Globe } from 'react-feather'
import { motion } from 'framer-motion'
import { pulseOnceWithDelay } from '@repo/lib/shared/utils/animations'
import { useProjectConfig } from '@repo/lib/config/ProjectConfigProvider'

interface ChainOption extends OptionBase {
  label: ReactNode
  value: GqlChain
}

type Props = {
  value: GqlChain
  onChange(value: GqlChain): void
}

function DropdownIndicator({
  ...props
}: DropdownIndicatorProps<ChainOption, false, GroupBase<ChainOption>>) {
  return (
    <chakraComponents.DropdownIndicator {...props}>
      <HStack>
        <Globe size={16} />
        <ChevronDown size={16} />
      </HStack>
    </chakraComponents.DropdownIndicator>
  )
}

export function ChainSelect({ value, onChange }: Props) {
  const [chainValue, setChainValue] = useState<ChainOption | undefined>(undefined)
  const { supportedNetworks } = useProjectConfig()

  const chakraStyles = getSelectStyles<ChainOption>()

  const networkOptions: ChainOption[] = supportedNetworks.map(network => ({
    label: (
      <HStack>
        <NetworkIcon chain={network} size={6} />
        <Text>{getChainShortName(network)}</Text>
      </HStack>
    ),
    value: network,
  }))

  function handleChange(newOption: SingleValue<ChainOption>) {
    if (newOption) onChange(newOption.value)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setChainValue(networkOptions.find(option => option.value === value)), [value])

  return (
    <Box animate={pulseOnceWithDelay} as={motion.div} w="full" zIndex="10">
      <Select<ChainOption, false, GroupBase<ChainOption>>
        chakraStyles={chakraStyles}
        components={{ DropdownIndicator: DropdownIndicator }}
        instanceId="chain-select"
        name="Chain"
        onChange={handleChange}
        options={networkOptions}
        value={chainValue}
      />
    </Box>
  )
}
