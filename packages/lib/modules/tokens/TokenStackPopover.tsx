import { Box, VStack, useBreakpointValue } from '@chakra-ui/react'
import { ApiToken } from './token.types'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import TokenRow from './TokenRow/TokenRow'
import { Address } from 'viem'
import { Numberish } from '@repo/lib/shared/utils/numbers'
import { useState, useRef } from 'react'

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
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isMobile = useBreakpointValue({ base: true, md: false })

  if (!tokens || tokens.length === 0) {
    return <>{children}</>
  }

  return (
    <Box
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      position="relative"
      ref={containerRef}
    >
      {children}

      {isOpen && (
        <Box
          bg="background.level3"
          borderRadius="md"
          boxShadow="md"
          left={{ base: '0', md: '50%' }}
          maxW={isMobile ? '100%' : '800px'}
          minW={{ base: '250px', md: '325px' }}
          overflowY="visible"
          p={3}
          position="absolute"
          top="-10px"
          transform={{
            base: 'translateY(-100%)',
            md: 'translate(-50%, -100%)',
          }}
          zIndex={1000}
        >
          <Box
            borderBottomColor="transparent"
            borderColor="background.level3"
            borderLeftColor="transparent"
            borderRightColor="transparent"
            borderStyle="solid"
            borderTopColor="background.level3"
            borderWidth="8px 8px 0 8px"
            bottom="-8px"
            height="0"
            left={{ base: '20px', md: '50%' }}
            position="absolute"
            transform="translateX(-50%)"
            width="0"
          />
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
                  showCompactView
                  symbol={token?.symbol}
                  value={balance}
                />
              )
            })}
          </VStack>
        </Box>
      )}
    </Box>
  )
}
