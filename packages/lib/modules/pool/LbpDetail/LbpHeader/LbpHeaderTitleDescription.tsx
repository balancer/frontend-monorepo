import { HStack, VStack, Heading, Text, Button, IconButton, Link } from '@chakra-ui/react'
import { GqlPoolLiquidityBootstrappingV3 } from '@repo/lib/shared/services/api/generated/graphql'
import { TokenIcon } from '@repo/lib/modules/tokens/TokenIcon'
import { IconType, SocialIcon } from '@repo/lib/shared/components/navs/SocialIcon'
import { ArrowUpRight } from 'react-feather'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { usePool } from '../../PoolProvider'

export function LbpHeaderTitleDescription() {
  const { pool } = usePool()
  const lbpPool = pool as GqlPoolLiquidityBootstrappingV3

  const projectToken = pool.poolTokens[lbpPool.projectTokenIndex]

  const socialLinks = [
    {
      iconType: 'x',
      href: `https://twitter.com/${lbpPool.x}`,
    },
    {
      iconType: 'discord',
      href: lbpPool.discord || undefined,
    },
    {
      iconType: 'tg',
      href: lbpPool.telegram ? `https://t.me/${lbpPool.telegram}` : undefined,
    },
  ] as { iconType: IconType; href: string | undefined }[]

  return (
    <VStack align="start" spacing="xl">
      <HStack spacing="sm">
        <TokenIcon
          address={pool.address}
          alt={projectToken.symbol || pool.address}
          chain={pool.chain}
          logoURI={projectToken.logoURI}
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
            >{`${projectToken.symbol} token launch`}</Heading>
            <NetworkIcon chain={pool.chain} size={8} />
          </HStack>
          <Text fontSize="md" variant="secondary">
            {lbpPool.lbpName}
          </Text>
        </VStack>
      </HStack>
      <Text fontSize="md" lineHeight="24px" variant="secondary">
        {lbpPool.description}
      </Text>
      <HStack mt="auto">
        <Button
          as="a"
          href={lbpPool.website || ''}
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
          {socialLinks.map(({ href, iconType }) => (
            <>
              {href && (
                <IconButton
                  aria-label={`Visit us on ${iconType}`}
                  as={Link}
                  bg="background.level2"
                  href={href}
                  isExternal
                  isRound
                  key={href + '-' + iconType}
                  rounded="full"
                  variant="tertiary"
                  size="sm"
                  h="32px"
                >
                  <SocialIcon iconType={iconType} size={16} />
                </IconButton>
              )}
            </>
          ))}
        </HStack>
      </HStack>
    </VStack>
  )
}
