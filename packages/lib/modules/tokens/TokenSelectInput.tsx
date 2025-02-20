'use client'

import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { HStack, Text } from '@chakra-ui/react'
import { TokenIcon } from './TokenIcon'
import { useTokens } from './TokensProvider'
import { SelectInput } from '@repo/lib/shared/components/inputs/SelectInput'

type Props = {
  value: string
  onChange(value: string): void
  tokenAddresses: string[]
  chain: GqlChain
  defaultTokenAddress?: string
}

export function TokenSelectInput({
  value,
  onChange,
  tokenAddresses,
  chain,
  defaultTokenAddress,
}: Props) {
  const { getToken } = useTokens()
  const tokenOptions = tokenAddresses.map(tokenAddress => ({
    label: (
      <HStack>
        <TokenIcon address={tokenAddress} alt={tokenAddress} chain={chain} size={24} />
        <Text>{getToken(tokenAddress, chain)?.symbol}</Text>
      </HStack>
    ),
    value: tokenAddress,
  }))

  return (
    <SelectInput
      defaultValue={defaultTokenAddress}
      id="token-select"
      onChange={onChange}
      options={tokenOptions}
      value={value}
    />
  )
}
