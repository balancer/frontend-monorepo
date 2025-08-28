'use client'

import { HStack, Link, Text } from '@chakra-ui/react'
import { ArrowUpRight } from 'react-feather'
import { Address } from 'viem'
import { GqlChain } from '../services/api/generated/graphql'
import { getBlockExplorerName, getBlockExplorerTxUrl } from '../utils/blockExplorer'
import { getBlockExplorerAddressUrl } from '@repo/lib/shared/utils/blockExplorer'
import { abbreviateAddress } from '@repo/lib/shared/utils/addresses'
import { Icon } from '@chakra-ui/react'

type Props = {
  transactionHash?: Address
  chain: GqlChain
  address?: Address
  fontSize?: string
  customLabel?: string
}

export function BlockExplorerLink({
  chain,
  transactionHash,
  address,
  customLabel,
  fontSize = 'sm',
}: Props) {
  if (!transactionHash && !address) return null

  let href: string | undefined = undefined
  if (address) href = getBlockExplorerAddressUrl(address, chain)
  if (transactionHash) href = getBlockExplorerTxUrl(transactionHash, chain)

  const label = address ? abbreviateAddress(address) : 'View on ' + getBlockExplorerName(chain)

  return (
    <Link href={href} isExternal>
      <HStack color="grayText" spacing="xs">
        <Text fontSize={fontSize} variant="secondary">
          {customLabel || label}
        </Text>
        <Icon as={ArrowUpRight} color="font.secondary" size={14} />
      </HStack>
    </Link>
  )
}
