'use client'

import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { HStack, Text } from '@chakra-ui/react'
import { TokenIcon } from './TokenIcon'
import { useTokens } from './TokensProvider'
import { SelectInput } from '@repo/lib/shared/components/inputs/SelectInput'
import { useEffect } from 'react'

type Props = {
  value: string
  onChange(value: string): void
  tokenAddresses: string[]
  chain: GqlChain
  defaultTokenAddress?: string
  isDisabled?: boolean
}

export function TokenSelectInput({
  value,
  onChange,
  tokenAddresses,
  chain,
  defaultTokenAddress,
  isDisabled,
}: Props) {
  const { getToken } = useTokens()

  const tokenOptions = tokenAddresses.map(tokenAddress => {
    return {
      label: (
        <HStack>
          <TokenIcon address={tokenAddress} alt={tokenAddress} chain={chain} size={24} />
          <Text>{getToken(tokenAddress, chain)?.symbol}</Text>
        </HStack>
      ),
      value: tokenAddress,
    }
  })

  useEffect(() => {
    if (defaultTokenAddress) {
      onChange(defaultTokenAddress)
    }
  }, [])

  return (
    <SelectInput
      defaultValue={defaultTokenAddress}
      id="token-select"
      isDisabled={isDisabled}
      onChange={onChange}
      options={tokenOptions}
      value={value}
    />
  )
}
