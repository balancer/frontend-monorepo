import { Box, HStack, StackProps } from '@chakra-ui/react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ApiToken } from './token.types'
import { TokenIcon } from './TokenIcon'
import { Numberish } from '@repo/lib/shared/utils/numbers'

type TokenBalances = {
  [address: string]: Numberish
}

type Props = {
  chain: GqlChain
  disablePopover?: boolean
  size?: number
  tokenBalances?: TokenBalances
  tokens: ApiToken[]
}

export function TokenIconStack({
  chain,
  disablePopover,
  size = 64,
  tokens,
  ...rest
}: Props & StackProps) {
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
              disablePopover={disablePopover}
              size={size}
            />
          </Box>
        )
      })}
    </HStack>
  )
}
