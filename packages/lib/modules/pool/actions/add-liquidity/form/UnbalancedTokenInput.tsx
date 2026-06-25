'use client'

import { useState } from 'react'
import { VStack, useDisclosure } from '@chakra-ui/react'
import { useAddLiquidity } from '../AddLiquidityProvider'
import { usePool } from '../../../PoolProvider'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { CompactTokenSelectModal } from '@repo/lib/modules/tokens/TokenSelectModal/TokenSelectList/CompactTokenSelectModal'
import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { Address, HumanAmount } from '@balancer/sdk'
import { bn } from '@repo/lib/shared/utils/numbers'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import BigNumber from 'bignumber.js'

export function UnbalancedTokenInput() {
  const { pool, chain } = usePool()
  const { setHumanAmountsIn, humanAmountsIn, slippage, validTokens } = useAddLiquidity()
  const { balanceFor } = useTokenBalances()
  const tokenSelectDisclosure = useDisclosure()

  const poolTokens = pool.poolTokens as unknown as ApiToken[]

  const [selectedToken, setSelectedToken] = useState<ApiToken | undefined>(poolTokens[0])

  const currentAmountEntry = humanAmountsIn.find(
    amount => selectedToken && isSameAddress(amount.tokenAddress, selectedToken.address as Address)
  )

  const currentAmount = currentAmountEntry?.humanAmount || ''

  function handleTokenSelect(token: ApiToken) {
    setSelectedToken(token)
    setHumanAmountsIn(prev => {
      const filtered = prev.filter(
        amount => !validTokens.some(t => isSameAddress(t.address as Address, amount.tokenAddress))
      )
      return [
        ...filtered,
        {
          tokenAddress: token.address as Address,
          humanAmount: '',
          symbol: token.symbol,
          decimals: token.decimals,
        },
      ]
    })
  }

  function handleAmountChange(e: { currentTarget: { value: string } }) {
    if (!selectedToken) return
    const value = e.currentTarget.value

    setHumanAmountsIn(prev => {
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
      {selectedToken && (
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

      <CompactTokenSelectModal
        chain={chain}
        isOpen={tokenSelectDisclosure.isOpen}
        onClose={tokenSelectDisclosure.onClose}
        onOpen={tokenSelectDisclosure.onOpen}
        onTokenSelect={handleTokenSelect}
        tokens={validTokens}
      />
    </VStack>
  )
}
