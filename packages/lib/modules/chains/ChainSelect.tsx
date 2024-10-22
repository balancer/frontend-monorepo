'use client'

import { getChainShortName } from '@repo/lib/config/app.config'
import { getProjectConfig } from '@repo/lib/config/getProjectConfig'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { getSelectStyles } from '@repo/lib/shared/services/chakra/custom/chakra-react-select'
import { Box, HStack, Text } from '@chakra-ui/react'
import { Select, OptionBase, GroupBase, SingleValue, chakraComponents } from 'chakra-react-select'
import { ReactNode, useEffect, useState } from 'react'
import { ChevronDown, Globe } from 'react-feather'
import { motion } from 'framer-motion'
import { pulseOnceWithDelay } from '@repo/lib/shared/utils/animations'

interface ChainOption extends OptionBase {
  label: ReactNode
  value: GqlChain
}

type Props = {
  value: GqlChain
  onChange(value: GqlChain): void
}

const networkOptions: ChainOption[] = getProjectConfig().supportedNetworks.map(network => ({
  label: (
    <HStack>
      <NetworkIcon chain={network} size={6} />
      <Text>{getChainShortName(network)}</Text>
    </HStack>
  ),
  value: network,
}))

export function ChainSelect({ value, onChange }: Props) {
  const [chainValue, setChainValue] = useState<ChainOption | undefined>(undefined)
  const chakraStyles = getSelectStyles<ChainOption>()

  function handleChange(newOption: SingleValue<ChainOption>) {
    if (newOption) onChange(newOption.value)
  }

  useEffect(() => setChainValue(networkOptions.find(option => option.value === value)), [value])

  return (
    <Box animate={pulseOnceWithDelay} as={motion.div} w="full" zIndex="10">
      <Select<ChainOption, false, GroupBase<ChainOption>>
        chakraStyles={chakraStyles}
        components={{
          DropdownIndicator: props => (
            <chakraComponents.DropdownIndicator {...props}>
              <HStack>
                <Globe size={16} />
                <ChevronDown size={16} />
              </HStack>
            </chakraComponents.DropdownIndicator>
          ),
        }}
        instanceId="chain-select"
        name="Chain"
        onChange={handleChange}
        options={networkOptions}
        value={chainValue}
      />
    </Box>
  )
}
