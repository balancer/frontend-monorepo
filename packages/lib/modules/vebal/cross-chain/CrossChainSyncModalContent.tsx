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
    <Card gap="4" variant="modalSubSection">
      {networks.map(network => (
        <CrossChainSyncRow current={network === currentNetwork} key={network} network={network} />
      ))}
    </Card>
  )
}
