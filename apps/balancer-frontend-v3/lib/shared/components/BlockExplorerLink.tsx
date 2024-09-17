'use client'

import { HStack, Link, Text } from '@chakra-ui/react'
import { ArrowUpRight } from 'react-feather'
import { getBlockExplorerTxUrl, getBlockExplorerName } from '../hooks/useBlockExplorer'
import { Address } from 'viem'
import { GqlChain } from '../services/api/generated/graphql'

type Props = { transactionHash?: Address; chain: GqlChain }

export function BlockExplorerLink({ chain, transactionHash }: Props) {
  if (!transactionHash) return null
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
