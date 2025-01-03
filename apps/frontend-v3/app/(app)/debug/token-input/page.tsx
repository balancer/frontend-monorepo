'use client'

import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
import { Button, Card, Heading, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useState } from 'react'
import { TokenSelectModal } from '@repo/lib/modules/tokens/TokenSelectModal/TokenSelectModal'
import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { daiAddress } from '@repo/lib/debug-helpers'
import { TokenInputsValidationProvider } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { PriceImpactProvider } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'

export default function TokenInputPage() {
  const [currentValue, setCurrentValue] = useState('')
  const { getToken, getTokensByChain } = useTokens()
  const tokenSelectDisclosure = useDisclosure()
  const [token, setToken] = useState<ApiToken>(getToken(daiAddress, 1) as ApiToken)

  const tokens = getTokensByChain(1)

  function handleTokenSelect(token: ApiToken) {
    setToken(token)
  }

  return (
    <TokenInputsValidationProvider>
      <PriceImpactProvider>
        <TokenBalancesProvider extTokens={tokens}>
          <VStack align="start" p="md" width="sm">
            <Heading>Token Input</Heading>
            <Text>Current value: {currentValue}</Text>
            <ConnectWallet />
            <Card p="md" shadow="2xl" variant="level3">
              <VStack spacing="md" w="full">
                <TokenInput
                  address={token?.address}
                  chain={token?.chain}
                  onChange={e => setCurrentValue(e.currentTarget.value)}
                  toggleTokenSelect={() => {
                    tokenSelectDisclosure.onOpen()
                  }}
                  value={currentValue}
                />
                <Button variant="primary" w="full">
                  Submit
                </Button>
              </VStack>
            </Card>

            <TokenSelectModal
              chain={GqlChain.Mainnet}
              isOpen={tokenSelectDisclosure.isOpen}
              onClose={tokenSelectDisclosure.onClose}
              onOpen={tokenSelectDisclosure.onOpen}
              onTokenSelect={handleTokenSelect}
              tokens={tokens}
            />
          </VStack>
        </TokenBalancesProvider>
      </PriceImpactProvider>
    </TokenInputsValidationProvider>
  )
}
