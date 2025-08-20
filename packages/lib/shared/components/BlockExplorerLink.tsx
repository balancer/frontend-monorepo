'use client'

import { HStack, Link, Text } from '@chakra-ui/react'
import { ArrowUpRight } from 'react-feather'
import { Address } from 'viem'
import { GqlChain } from '../services/api/generated/graphql'
import { getBlockExplorerName, getBlockExplorerTxUrl } from '../utils/blockExplorer'
import { getBlockExplorerAddressUrl } from '@repo/lib/shared/utils/blockExplorer'
import { abbreviateAddress } from '@repo/lib/shared/utils/addresses'
import { Icon } from '@chakra-ui/react'

type Props = { transactionHash?: Address; chain: GqlChain; address?: Address }

export function BlockExplorerLink({ chain, transactionHash, address }: Props) {
  if (!transactionHash && !address) return null

  if (address) {
    return (
      <Link href={getBlockExplorerAddressUrl(address, chain)} target="_blank">
        <HStack spacing="xs">
          <Text color="font.secondary">{abbreviateAddress(address)}</Text>
          <Icon as={ArrowUpRight} color="font.secondary" size={12} />
        </HStack>
      </Link>
    )
  }

  if (transactionHash) {
    return (
      <Link href={getBlockExplorerTxUrl(transactionHash, chain)} target="_blank">
        <HStack color="grayText">
          <Text fontSize="sm" variant="secondary">
            View on {getBlockExplorerName(chain)}
          </Text>
          <ArrowUpRight size={14} />
        </HStack>
      </Link>
    )
  }
}
