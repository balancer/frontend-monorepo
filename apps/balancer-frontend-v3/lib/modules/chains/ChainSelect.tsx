'use client'

import { getChainShortName } from '@/lib/config/app.config'
import { getProjectConfig } from '@/lib/config/getProjectConfig'
import { NetworkIcon } from '@/lib/shared/components/icons/NetworkIcon'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { getSelectStyles } from '@/lib/shared/services/chakra/custom/chakra-react-select'
import { Box, HStack, Text } from '@chakra-ui/react'
import { Select, OptionBase, GroupBase, SingleValue, chakraComponents } from 'chakra-react-select'
import { ReactNode, useEffect, useState } from 'react'
import { ChevronDown, Globe } from 'react-feather'
import { motion } from 'framer-motion'
import { pulseOnceWithDelay } from '@/lib/shared/utils/animations'

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
    <Box as={motion.div} animate={pulseOnceWithDelay} w="full" zIndex="10">
      <Select<ChainOption, false, GroupBase<ChainOption>>
        instanceId="chain-select"
        name="Chain"
        value={chainValue}
        options={networkOptions}
        chakraStyles={chakraStyles}
        onChange={handleChange}
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
      />
    </Box>
  )
}
