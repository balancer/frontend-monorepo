'use client'

import { getChainShortName } from '@repo/lib/config/app.config'
import { getSelectStyles } from '@repo/lib/shared/services/chakra/custom/chakra-react-select'
import { Box, HStack, Text } from '@chakra-ui/react'
import { Select, OptionBase, GroupBase, SingleValue, chakraComponents } from 'chakra-react-select'
import { ReactNode, useEffect, useState } from 'react'
import { ChevronDown } from 'react-feather'
import { motion } from 'framer-motion'
import { pulseOnceWithDelay } from '@repo/lib/shared/utils/animations'

import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { supportedNetworks } from '@repo/lib/modules/web3/ChainConfig'
import { gradientMap } from '@repo/lib/modules/marketing/useEcosystemPoolActivity'

interface ChainOption extends OptionBase {
  label: ReactNode
  value: GqlChain | 'all'
}

type Props = {
  value: GqlChain | 'all'
  onChange(value: GqlChain | 'all'): void
}

const networkOptions: ChainOption[] = [
  {
    label: (
      <HStack>
        <Text>All networks</Text>
      </HStack>
    ),
    value: 'all',
  },
  ...supportedNetworks.map(network => ({
    label: (
      <HStack>
        <Box
          backgroundImage={`linear-gradient(to bottom, ${gradientMap[network].from}, ${gradientMap[network].to})`}
          borderRadius="50%"
          display="inline-block"
          height="2"
          width="2"
        />
        <Text>{getChainShortName(network)}</Text>
      </HStack>
    ),
    value: network,
  })),
]

function CustomDropdownIndicator(props: any) {
  return (
    <chakraComponents.DropdownIndicator {...props}>
      <HStack>
        <ChevronDown size={16} />
      </HStack>
    </chakraComponents.DropdownIndicator>
  )
}

export function EcosystemChainSelect({ value, onChange }: Props) {
  const [chainValue, setChainValue] = useState<ChainOption | undefined>(undefined)
  const chakraStyles = getSelectStyles<ChainOption>()

  function handleChange(newOption: SingleValue<ChainOption>) {
    if (newOption) onChange(newOption.value)
  }

  useEffect(() => setChainValue(networkOptions.find(option => option.value === value)), [value])

  return (
    <Box animate={pulseOnceWithDelay} as={motion.div} data-lenis-prevent w="200px" zIndex="10">
      <Select<ChainOption, false, GroupBase<ChainOption>>
        // width="300px"
        chakraStyles={chakraStyles}
        components={{
          DropdownIndicator: CustomDropdownIndicator,
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
