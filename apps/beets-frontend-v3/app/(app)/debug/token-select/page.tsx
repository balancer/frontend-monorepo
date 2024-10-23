'use client'

import { TokenSelectModal } from '@repo/lib/modules/tokens/TokenSelectModal/TokenSelectModal'
import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { GqlChain, GqlToken } from '@repo/lib/shared/services/api/generated/graphql'
import { Button, useDisclosure, Text } from '@chakra-ui/react'
import { useRef, useState } from 'react'

export default function TokenSelectPage() {
  const [selectedToken, setSelectedToken] = useState<GqlToken>()
  const tokenSelectBtn = useRef(null)
  const tokenSelectDisclosure = useDisclosure()
  const { getTokensByChain } = useTokens()

  function handleTokenSelect(token: GqlToken) {
    setSelectedToken(token)
  }

  return (
    <TokenBalancesProvider extTokens={getTokensByChain(1)}>
      <h1>TokenSelectPage</h1>
      <Text>Selected token: {selectedToken?.symbol}</Text>
      <Button onClick={tokenSelectDisclosure.onOpen} ref={tokenSelectBtn}>
        Open modal
      </Button>
      <TokenSelectModal
        chain={GqlChain.Mainnet}
        finalFocusRef={tokenSelectBtn}
        isOpen={tokenSelectDisclosure.isOpen}
        onClose={tokenSelectDisclosure.onClose}
        onOpen={tokenSelectDisclosure.onOpen}
        onTokenSelect={handleTokenSelect}
        pinNativeAsset
        tokens={getTokensByChain(1)}
      />
    </TokenBalancesProvider>
  )
}
