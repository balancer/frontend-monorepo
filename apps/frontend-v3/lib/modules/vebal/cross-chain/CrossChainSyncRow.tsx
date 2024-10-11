import { GqlChain } from '@/lib/shared/services/api/generated/graphql'

import { useVebalUserData } from '@/lib/modules/vebal/useVebalUserData'
import { HStack, Text, VStack } from '@chakra-ui/react'
import Image from 'next/image'
import { getChainShortName } from '@/lib/config/app.config'
import { useCrossChainSync } from './CrossChainSyncProvider'

export function CrossChainSyncRow({ network, current }: { network: GqlChain; current: boolean }) {
  const { l2VeBalBalances } = useCrossChainSync()
  const { data } = useVebalUserData()
  const myVebalBalance = data?.veBalGetUser.balance

  return (
    <VStack opacity={current ? 1 : 0.6} alignItems="unset">
      <HStack alignSelf="start">
        <Image
          src={`/images/chains/${network}.svg`}
          alt={`Chain icon for ${getChainShortName(network)}`}
          width={20}
          height={20}
          title={getChainShortName(network)}
        />
        <Text>{getChainShortName(network)}</Text>
      </HStack>
      <HStack justifyContent="space-between">
        <VStack alignItems="start">
          <Text>Current balance</Text>
          <Text fontWeight="bold">{l2VeBalBalances[network]}</Text>
        </VStack>
        <VStack alignItems="start">
          <Text>Post-sync balance</Text>
          <Text fontWeight="bold">{Number(myVebalBalance).toFixed(4)}</Text>
        </VStack>
      </HStack>
    </VStack>
  )
}
