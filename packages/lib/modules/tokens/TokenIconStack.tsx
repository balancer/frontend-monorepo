import { Box, HStack, StackProps } from '@chakra-ui/react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ApiToken } from './token.types'
import { TokenIcon } from './TokenIcon'

type Props = {
  tokens: ApiToken[]
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
            border="2px solid"
            borderColor="background.base"
            borderRadius="100%"
            height={`${size + 4}px`}
            key={tokenAddress}
            ml={i > 0 ? getNestingMargin() : 0}
            width={`${size + 4}px`}
            zIndex={9 - i}
          >
            <TokenIcon
              address={tokenAddress}
              alt={token?.symbol || tokenAddress}
              chain={chain}
              size={size}
            />
          </Box>
        )
      })}
    </HStack>
  )
}
