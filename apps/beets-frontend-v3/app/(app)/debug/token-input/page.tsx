'use client'

import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
import { Button, Card, Heading, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { GqlChain, GqlToken } from '@repo/lib/shared/services/api/generated/graphql'
import { useState } from 'react'
import { TokenSelectModal } from '@repo/lib/modules/tokens/TokenSelectModal/TokenSelectModal'
import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { daiAddress } from '@repo/lib/debug-helpers'
import { TokenInputsValidationProvider } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { PriceImpactProvider } from '@repo/lib/modules/price-impact/PriceImpactProvider'

export default function TokenInputPage() {
  const [currentValue, setCurrentValue] = useState('')
  const { getToken, getTokensByChain } = useTokens()
  const tokenSelectDisclosure = useDisclosure()
  const [token, setToken] = useState<GqlToken>(getToken(daiAddress, 1) as GqlToken)

  const tokens = getTokensByChain(1)

  function handleTokenSelect(token: GqlToken) {
    setToken(token)
  }

  return (
    <TokenInputsValidationProvider>
      <PriceImpactProvider>
        <TokenBalancesProvider extTokens={tokens}>
          <VStack width="sm" align="start" p="md">
            <Heading>Token Input</Heading>
            <Text>Current value: {currentValue}</Text>
            <ConnectWallet />
            <Card p="md" variant="level3" shadow="2xl">
              <VStack spacing="md" w="full">
                <TokenInput
                  address={token?.address}
                  chain={token?.chain}
                  value={currentValue}
                  onChange={e => setCurrentValue(e.currentTarget.value)}
                  toggleTokenSelect={() => {
                    tokenSelectDisclosure.onOpen()
                  }}
                />
                <Button variant="primary" w="full">
                  Submit
                </Button>
              </VStack>
            </Card>

            <TokenSelectModal
              tokens={tokens}
              chain={GqlChain.Mainnet}
              isOpen={tokenSelectDisclosure.isOpen}
              onOpen={tokenSelectDisclosure.onOpen}
              onClose={tokenSelectDisclosure.onClose}
              onTokenSelect={handleTokenSelect}
            />
          </VStack>
        </TokenBalancesProvider>
      </PriceImpactProvider>
    </TokenInputsValidationProvider>
  )
}
