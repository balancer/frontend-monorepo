'use client'

import { getChainShortName } from '@repo/lib/config/app.config'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { Box, HStack, Text, Center } from '@chakra-ui/react'
import {
  GroupBase,
  chakraComponents,
  DropdownIndicatorProps,
  SingleValueProps,
} from 'chakra-react-select'
import { ChevronDown } from 'react-feather'
import { motion } from 'framer-motion'
import { pulseOnceWithDelay } from '@repo/lib/shared/utils/animations'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { SelectInput, SelectOption } from '@repo/lib/shared/components/inputs/SelectInput'
import { NativeTokenBalance, useHasNativeBalance } from './NativeTokenBalance'
import { useUserAccount } from '../web3/UserAccountProvider'
import { getGqlChain } from '@repo/lib/config/app.config'
import { GasIcon } from '@repo/lib/shared/components/icons/GasIcon'
import { PlugIcon } from '@repo/lib/shared/components/icons/PlugIcon'

type Props = {
  value: GqlChain
  onChange(value: GqlChain): void
  chains?: GqlChain[]
}

function DropdownIndicator({
  ...props
}: DropdownIndicatorProps<SelectOption, false, GroupBase<SelectOption>>) {
  const chain = (props.selectProps.value as SelectOption)?.value as GqlChain
  const hasBalance = useHasNativeBalance(chain)

  return (
    <chakraComponents.DropdownIndicator {...props}>
      <HStack position="relative" right="12px">
        <Center bg="background.level4" h="24px" rounded="full" w="24px">
          <Box color={hasBalance ? 'font.secondary' : 'font.warning'}>
            <GasIcon size={14} />
          </Box>
        </Center>

        <ChevronDown size={16} />
      </HStack>
    </chakraComponents.DropdownIndicator>
  )
}

function SingleValue({ ...props }: SingleValueProps<SelectOption, false, GroupBase<SelectOption>>) {
  return (
    <chakraComponents.SingleValue {...props}>
      <HStack align="center" gap="sm">
        <NetworkIcon chain={props.data.value} size={5} />
        <Text>{getChainShortName(props.data.value)}</Text>
        <NativeTokenBalance chain={props.data.value} color="font.secondary" fontSize="xs" pr="3" />
      </HStack>
    </chakraComponents.SingleValue>
  )
}

export function ChainSelect({ value, onChange, chains = PROJECT_CONFIG.supportedNetworks }: Props) {
  const { chainId } = useUserAccount()
  const connectedChain = chainId ? getGqlChain(chainId) : undefined
  const networkOptions: SelectOption[] = chains.map(chain => ({
    label: (
      <HStack w="full">
        <NetworkIcon chain={chain} size={6} />
        <HStack gap="xxs">
          <Text>{getChainShortName(chain)}</Text>
          {connectedChain === chain && (
            <Box alignItems="center" borderRadius="full" display="inline-flex" gap="xxs" px="xxs">
              <PlugIcon size={18} />
              <Text color="font.secondary" fontSize="11px" opacity="0.8">
                Connected
              </Text>
            </Box>
          )}
        </HStack>
        <NativeTokenBalance applyOpacity chain={chain} fontSize="xs" />
      </HStack>
    ),
    value: chain,
  }))

  return (
    <Box animate={pulseOnceWithDelay} as={motion.div} w="full" zIndex="10">
      <SelectInput
        DropdownIndicator={DropdownIndicator}
        id="chain-select"
        isSearchable={false}
        onChange={onChange}
        options={networkOptions}
        SingleValue={SingleValue}
        value={value}
      />
    </Box>
  )
}
