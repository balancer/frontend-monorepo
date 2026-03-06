import { Box, HoverCard, VStack, Text } from '@chakra-ui/react'
import { ApiToken } from './token.types'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import TokenRow from './TokenRow/TokenRow'
import { Address } from 'viem'
import { Numberish } from '@repo/lib/shared/utils/numbers'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { hasDefinedValues } from '@repo/lib/shared/utils/array'

type RewardsByToken = {
  [address: string]: Numberish
}

type TokenStackPopoverProps = {
  chain: GqlChain
  children: React.ReactNode
  rewardsByToken?: RewardsByToken
  tokens: ApiToken[]
  headerText: string
}

export function TokenStackPopover({
  chain,
  children,
  rewardsByToken = {},
  tokens,
  headerText,
}: TokenStackPopoverProps) {
  const { isMobile } = useBreakpoints()

  if (!hasDefinedValues(tokens)) {
    return <>{children}</>
  }

  return (
    <HoverCard.Root
      positioning={{
        placement: 'top',
      }}
    >
      <HoverCard.Trigger asChild>
        <Box
          css={{
            '& &:hover': {
              '& > *': {
                transform: 'scale(1.1)',
              },
            },

            '& & > *': {
              transition: 'all 0.2s var(--ease-out-cubic)',
            },
          }}
          display="inline-block"
        >
          {children}
        </Box>
      </HoverCard.Trigger>
      <HoverCard.Positioner>
        <HoverCard.Content maxW={isMobile ? '100%' : '800px'} minW={{ base: '250px', md: '325px' }}>
          <HoverCard.Arrow bg="background.level3" />
          <Text variant="special">{headerText}</Text>
          <Box py="sm">
            <VStack align="flex-start" gap="xs">
              {tokens.map((token, i) => {
                const tokenAddress = token?.address as Address
                const balance = rewardsByToken[tokenAddress] || '0'

                return (
                  <TokenRow
                    abbreviated
                    address={tokenAddress}
                    chain={chain}
                    key={tokenAddress + i}
                    symbol={token?.symbol}
                    value={balance}
                  />
                )
              })}
            </VStack>
          </Box>
        </HoverCard.Content>
      </HoverCard.Positioner>
    </HoverCard.Root>
  )
}
