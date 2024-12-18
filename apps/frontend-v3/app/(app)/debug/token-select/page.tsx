'use client'

import { Button, Text, useDisclosure } from '@chakra-ui/react'
import { ApiToken } from '@repo/lib/modules/pool/pool.types'
import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { TokenSelectModal } from '@repo/lib/modules/tokens/TokenSelectModal/TokenSelectModal'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useRef, useState } from 'react'

export default function TokenSelectPage() {
  const [selectedToken, setSelectedToken] = useState<ApiToken>()
  const tokenSelectBtn = useRef(null)
  const tokenSelectDisclosure = useDisclosure()
  const { getTokensByChain } = useTokens()

  function handleTokenSelect(token: ApiToken) {
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
