import { Box, HStack, Text } from '@chakra-ui/react'
import { TokenIcon } from '../../tokens/TokenIcon'
import { PoolListItem } from '../pool.types'
import { ExpandedPoolInfo } from '../../portfolio/PortfolioTable/useExpandedPools'

export function PoolListPoolName({ pool }: { pool: PoolListItem | ExpandedPoolInfo }) {
  const isFirstToken = (index: number) => index === 0
  const zIndices = Array.from({ length: pool.displayTokens.length }, (_, index) => index).reverse()

  return (
    <HStack>
      {pool.displayTokens.map((token, i) => (
        <Box key={token.address} ml={isFirstToken(i) ? 0 : -3} zIndex={zIndices[i]}>
          <TokenIcon
            address={token.address}
            alt={token.symbol}
            chain={pool.chain}
            size={20}
            weight={token.weight}
          />
        </Box>
      ))}
      <Text fontWeight="medium" textAlign="left">
        {pool.name}
      </Text>
    </HStack>
  )
}
