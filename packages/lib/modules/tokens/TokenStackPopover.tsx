import {
  Box,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  VStack,
  Text,
} from '@chakra-ui/react'
import { ApiToken } from './token.types'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import TokenRow from './TokenRow/TokenRow'
import { Address } from 'viem'
import { Numberish } from '@repo/lib/shared/utils/numbers'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'

type TokenBalances = {
  [address: string]: Numberish
}

type TokenStackPopoverProps = {
  chain: GqlChain
  children: React.ReactNode
  tokenBalances?: TokenBalances
  tokens: ApiToken[]
}

export function TokenStackPopover({
  chain,
  children,
  tokenBalances = {},
  tokens,
}: TokenStackPopoverProps) {
  const { isMobile } = useBreakpoints()

  if (!tokens || tokens.length === 0) {
    return <>{children}</>
  }

  return (
    <Popover placement="top" trigger="hover">
      <PopoverTrigger>
        <Box
          display="inline-block"
          sx={{
            '&:hover': {
              '& > *': {
                transform: 'scale(1.1)',
              },
            },
            '& > *': {
              transition: 'all 0.2s var(--ease-out-cubic)',
            },
          }}
        >
          {children}
        </Box>
      </PopoverTrigger>
      <PopoverContent maxW={isMobile ? '100%' : '800px'} minW={{ base: '250px', md: '325px' }}>
        <PopoverArrow bg="background.level3" />
        <PopoverHeader>
          <Text variant="special">Weekly incentives for stakers</Text>
        </PopoverHeader>
        <PopoverBody py="sm">
          <VStack align="flex-start" spacing="xs">
            {tokens.map(token => {
              const tokenAddress = token?.address as Address
              const balance = tokenBalances[tokenAddress] || '0'

              return (
                <TokenRow
                  abbreviated
                  address={tokenAddress}
                  chain={chain}
                  key={tokenAddress}
                  symbol={token?.symbol}
                  value={balance}
                />
              )
            })}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
