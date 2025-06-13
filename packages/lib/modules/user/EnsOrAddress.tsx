import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

import { abbreviateAddress } from '@repo/lib/shared/utils/addresses'
import { useEnsAvatar, useEnsName } from 'wagmi'
import { getChainId } from '@repo/lib/config/app.config'
import { createAvatar } from '@dicebear/core'
import { identicon } from '@dicebear/collection'
import { getBlockExplorerAddressUrl } from '@repo/lib/shared/utils/blockExplorer'
import { HStack, Image, Link, Text } from '@chakra-ui/react'
import { ArrowUpRight } from 'react-feather'

export function EnsOrAddress({
  userAddress,
  chain,
}: {
  userAddress: `0x${string}`
  chain: GqlChain
}) {
  const chainId = getChainId(PROJECT_CONFIG.ensNetwork) // perform ENS lookup through ensNetwork
  const { data: name } = useEnsName({ address: userAddress, chainId })

  const { data: ensAvatar } = useEnsAvatar({
    name: name as string,
    chainId,
  })

  const fallbackSVG = createAvatar(identicon, {
    seed: userAddress || 'unknown',
  })

  return (
    <Link href={getBlockExplorerAddressUrl(userAddress, chain)} target="_blank">
      <HStack>
        <Image
          alt={name || userAddress}
          backgroundColor="background.level4"
          borderRadius="100%"
          height="24px"
          src={ensAvatar || fallbackSVG.toDataUri()}
          width="24px"
        />
        <HStack gap="0.5">
          <Text>{name || abbreviateAddress(userAddress)}</Text>
          <Text variant="secondary">
            <ArrowUpRight size={12} />
          </Text>
        </HStack>
      </HStack>
    </Link>
  )
}
