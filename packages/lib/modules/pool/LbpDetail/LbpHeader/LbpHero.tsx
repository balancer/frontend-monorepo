import { HStack, VStack, Heading, Text, Button, IconButton, Link } from '@chakra-ui/react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { TokenIcon } from '@repo/lib/modules/tokens/TokenIcon'
import { SocialIcon } from '@repo/lib/shared/components/navs/SocialIcon'
import { AppLink } from '@repo/lib/shared/components/navs/useNav'
import { ArrowUpRight } from 'react-feather'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'

// TODO: replace with real data from api
const lbp = {
  address: '0x123',
  chain: GqlChain.Mainnet,
  symbol: 'XYZZ',
  name: 'XYZZ Real World Assets',
  logoURI: 'https://example.com/logo.png',
  description:
    'XYZZ Real World Assets Coin (XYZZ) is a revolutionary DeFi protocol designed to seamlessly bridge traditional assets with the blockchain ecosystem. The protocol enables the tokenization of real-world assets (RWAs) including real estate.',
  socialLinks: [
    {
      iconType: 'x',
      href: 'https://x.com/balancer',
    },
    {
      iconType: 'discord',
      href: 'https://discord.balancer.fi/',
    },
    {
      iconType: 'tg',
      href: 'https://t.me/balancerfi',
    },
  ] as AppLink[],
  projectLink: 'https://example.com/project',
}

export function LbpHero() {
  return (
    <VStack align="start" spacing="xl">
      <HStack spacing="sm">
        <TokenIcon
          address={lbp.address}
          alt={lbp.symbol || lbp.address}
          chain={lbp.chain}
          //logoURI={lbp.logoURI}
          overflow="visible"
          size={64}
          disablePopover
        />
        <VStack align="start" spacing="sm">
          <HStack spacing="md">
            <Heading
              fontSize="4xl"
              lineHeight="36px"
              variant="special"
            >{`${lbp.symbol} token launch`}</Heading>
            <NetworkIcon chain={lbp.chain} size={8} />
          </HStack>
          <Text fontSize="md" variant="secondary">
            {lbp.name}
          </Text>
        </VStack>
      </HStack>
      <Text fontSize="md" lineHeight="24px" variant="secondary">
        {lbp.description}
      </Text>
      <HStack>
        <Button
          as="a"
          href={lbp.projectLink}
          target="_blank"
          rel="noopener noreferrer"
          variant="tertiary"
        >
          <HStack gap="xxs">
            <Text>View project</Text>
            <ArrowUpRight size={12} />
          </HStack>
        </Button>
        <Text opacity="0.25" px={{ base: '0', sm: 'ms' }} variant="secondary">
          |
        </Text>
        <HStack spacing="ms" w={{ base: 'full', lg: 'auto' }}>
          {lbp.socialLinks.map(({ href, iconType }) => (
            <IconButton
              aria-label={`Visit us on ${iconType}`}
              as={Link}
              bg="background.level2"
              href={href}
              isExternal
              isRound
              key={href}
              rounded="full"
              variant="tertiary"
              size="sm"
              h="32px"
            >
              <SocialIcon iconType={iconType} size={16} />
            </IconButton>
          ))}
        </HStack>
      </HStack>
    </VStack>
  )
}
