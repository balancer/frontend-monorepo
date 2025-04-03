import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

import { useVebalUserData } from '@repo/lib/modules/vebal/useVebalUserData'
import { HStack, Text, VStack } from '@chakra-ui/react'
import Image from 'next/image'
import { getChainShortName } from '@repo/lib/config/app.config'
import { useCrossChainSync } from './CrossChainSyncProvider'
import { formatUnits } from 'viem'

export function CrossChainSyncRow({ network, current }: { network: GqlChain; current: boolean }) {
  const { l2VeBalBalances } = useCrossChainSync()
  const { veBALBalance } = useVebalUserData()

  return (
    <VStack alignItems="unset" opacity={current ? 1 : 0.6}>
      <HStack alignSelf="start">
        <Image
          alt={`Chain icon for ${getChainShortName(network)}`}
          height={20}
          src={`/images/chains/${network}.svg`}
          title={getChainShortName(network)}
          width={20}
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
          <Text fontWeight="bold">{formatUnits(veBALBalance, 18)}</Text>
        </VStack>
      </HStack>
    </VStack>
  )
}
