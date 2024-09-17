import {
  GqlChain,
  GqlPoolTokenDisplay,
  GqlToken,
} from '@/lib/shared/services/api/generated/graphql'
import { Box, HStack, StackProps } from '@chakra-ui/react'
import { TokenIcon } from './TokenIcon'

type Props = {
  tokens: GqlPoolTokenDisplay[] | GqlToken[]
  chain: GqlChain
  size?: number
}

export function TokenIconStack({ tokens, chain, size = 64, ...rest }: Props & StackProps) {
  const getNestingMargin = () => {
    if (tokens.length > 4) return -10
    return -5
  }

  return (
    <HStack {...rest}>
      {tokens.map((token, i) => {
        // If the token is undefined (missing in tokenlists) we will show an unknown token icon to avoid a crash
        const tokenAddress = token?.address

        return (
          <Box
            key={tokenAddress}
            ml={i > 0 ? getNestingMargin() : 0}
            zIndex={9 - i}
            border="2px solid"
            borderColor="background.base"
            borderRadius="100%"
            width={`${size + 4}px`}
            height={`${size + 4}px`}
          >
            <TokenIcon
              chain={chain}
              address={tokenAddress}
              size={size}
              alt={token?.symbol || tokenAddress}
            />
          </Box>
        )
      })}
    </HStack>
  )
}
