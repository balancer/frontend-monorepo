'use client'

import { useState } from 'react'
import { VStack, useDisclosure, Button, Text } from '@chakra-ui/react'
import { useAddLiquidity } from '../AddLiquidityProvider'
import { usePool } from '../../../PoolProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { TokenSelectModal } from '@repo/lib/modules/tokens/TokenSelectModal/TokenSelectModal'
import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
import { ApiOrCustomToken } from '@repo/lib/modules/tokens/token.types'
import { Address, HumanAmount } from '@balancer/sdk'
import { bn } from '@repo/lib/shared/utils/numbers'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import BigNumber from 'bignumber.js'

export function UnbalancedTokenInput() {
  const { chain } = usePool()
  const { setHumanAmountsIn, humanAmountsIn, slippage } = useAddLiquidity()
  const { getTokensByChain } = useTokens()
  const { balanceFor } = useTokenBalances()
  const tokenSelectDisclosure = useDisclosure()

  const allTokens = getTokensByChain(chain)

  const [selectedToken, setSelectedToken] = useState<ApiOrCustomToken | undefined>()

  const currentAmountEntry = humanAmountsIn.find(
    amount => selectedToken && isSameAddress(amount.tokenAddress, selectedToken.address as Address)
  )

  const currentAmount = currentAmountEntry?.humanAmount || ''

  function handleTokenSelect(token: ApiOrCustomToken) {
    setSelectedToken(token)
    // Clear existing amounts and set up the new token
    setHumanAmountsIn([
      ...humanAmountsIn.map(({ tokenAddress, symbol }) => ({
        tokenAddress,
        humanAmount: '' as HumanAmount | '',
        symbol,
      })),
      {
        tokenAddress: token.address as Address,
        humanAmount: '',
        symbol: token.symbol,
        decimals: token.decimals,
      },
    ])
  }

  function handleAmountChange(e: { currentTarget: { value: string } }) {
    if (!selectedToken) return
    const value = e.currentTarget.value

    setHumanAmountsIn(prev => {
      // Remove any existing entry for this token
      const filtered = prev.filter(
        amount => !isSameAddress(amount.tokenAddress, selectedToken.address as Address)
      )
      return [
        ...filtered,
        {
          tokenAddress: selectedToken.address as Address,
          humanAmount: value as HumanAmount | '',
          symbol: selectedToken.symbol,
          decimals: selectedToken.decimals,
        },
      ]
    })
  }

  const balance = selectedToken ? balanceFor(selectedToken.address)?.formatted : undefined
  const userBalance = balance ? bn(balance) : bn(0)

  // Reduce max amount by slippage to account for swap slippage
  const customMaxAmount =
    selectedToken && userBalance.gt(0)
      ? userBalance
          .times(bn(1).minus(bn(slippage).div(100)))
          .toFixed(selectedToken.decimals, BigNumber.ROUND_DOWN)
      : undefined

  return (
    <VStack spacing="md" w="full">
      {!selectedToken ? (
        <Button onClick={tokenSelectDisclosure.onOpen} variant="secondary" w="full">
          <Text color="font.dark" fontWeight="bold">
            Select token
          </Text>
        </Button>
      ) : (
        <TokenInput
          address={selectedToken.address as Address}
          apiToken={selectedToken}
          chain={chain}
          customMaxAmount={customMaxAmount}
          onChange={handleAmountChange}
          onToggleTokenClicked={tokenSelectDisclosure.onOpen}
          value={currentAmount}
        />
      )}

      <TokenSelectModal
        chain={chain}
        enableUnlistedToken
        isOpen={tokenSelectDisclosure.isOpen}
        onClose={tokenSelectDisclosure.onClose}
        onOpen={tokenSelectDisclosure.onOpen}
        onTokenSelect={handleTokenSelect}
        tokens={allTokens}
      />
    </VStack>
  )
}
