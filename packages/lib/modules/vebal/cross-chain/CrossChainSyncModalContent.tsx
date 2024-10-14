import { Card } from '@chakra-ui/react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { CrossChainSyncRow } from '@repo/lib/modules/vebal/cross-chain/CrossChainSyncRow'

export function CrossChainSyncModalContent({
  currentNetwork,
  networks,
}: {
  currentNetwork: GqlChain
  networks: GqlChain[]
}) {
  return (
    <Card variant="modalSubSection" gap="4">
      {networks.map(network => (
        <CrossChainSyncRow key={network} network={network} current={network === currentNetwork} />
      ))}
    </Card>
  )
}
