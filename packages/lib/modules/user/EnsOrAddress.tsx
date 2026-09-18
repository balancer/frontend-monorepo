import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

import { abbreviateAddress } from '@repo/lib/shared/utils/addresses'
import { useEnsAvatar, useEnsName } from 'wagmi'
import { getChainId } from '@repo/lib/config/app.config'
import { Avatar, Style } from '@dicebear/core'
import identicon from '@dicebear/styles/identicon.json'
import { getBlockExplorerAddressUrl } from '@repo/lib/shared/utils/blockExplorer'
import { HStack, Image, Link, Text } from '@chakra-ui/react'
import { ArrowUpRight } from 'lucide-react'

const identiconStyle = new Style(identicon)

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

  const fallbackSVG = new Avatar(identiconStyle, {
    seed: userAddress || 'unknown',
  })

  return (
    <Link href={getBlockExplorerAddressUrl(userAddress, chain)} isExternal>
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
