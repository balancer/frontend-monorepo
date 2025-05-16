'use client'

import TokenRow from '@repo/lib/modules/tokens/TokenRow/TokenRow'
import { Card, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { Address } from 'viem'
import { useRemoveLiquidity } from '../RemoveLiquidityProvider'
import { isNativeAsset, isNativeOrWrappedNative } from '@repo/lib/modules/tokens/token.helpers'
import { NativeAssetSelectModal } from '@repo/lib/modules/tokens/NativeAssetSelectModal'
import { shouldShowNativeWrappedSelector } from '../../LiquidityActionHelpers'
import { Pool } from '../../../pool.types'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { WrappedOrUnderlyingSelectModal } from '@repo/lib/modules/tokens/WrappedOrUnderlyingSelectModal'
import { useState } from 'react'
import { getWrappedAndUnderlyingTokenFn } from '../../../pool-tokens.utils'

type Props = { tokens: ApiToken[]; pool: Pool }
export function RemoveLiquidityProportional({ tokens, pool }: Props) {
  const {
    amountOutForToken,
    validTokens,
    setWethIsEth,
    simulationQuery,
    priceImpactQuery,
    setWrapUnderlyingByIndex,
  } = useRemoveLiquidity()
  // Array with the underlying and wrapped tokens to be selected in WrappedOrUnderlyingSelectModal
  const [wrappedAndUnderlying, setWrappedAndUnderlying] = useState<ApiToken[] | undefined>()
  const nativeTokenSelectDisclosure = useDisclosure()
  const boostedTokenSelectDisclosure = useDisclosure()
  const isLoading = simulationQuery.isLoading || priceImpactQuery.isLoading

  const nativeAssets = validTokens.filter(token =>
    isNativeOrWrappedNative(token.address as Address, token.chain)
  )

  function handleTokenSelect(token: ApiToken) {
    if (isNativeAsset(token.address as Address, token.chain)) {
      setWethIsEth(true)
    } else {
      setWethIsEth(false)
    }
  }

  function onBoostedTokenSelect(token: ApiToken) {
    if (token.index === undefined) {
      console.error('Token should have index', token)
      throw new Error(`Token index not found for token ${token.symbol}`)
    }

    setWrapUnderlyingByIndex(token.index, !!token.wrappedToken)
  }

  function getToggleTokenCallback(token: ApiToken) {
    if (shouldShowNativeWrappedSelector(token, pool)) {
      return () => nativeTokenSelectDisclosure.onOpen()
    }

    const wrappedAndUnderlying = getWrappedAndUnderlyingTokenFn(token, pool, () => undefined)()
    if (wrappedAndUnderlying) {
      return () => {
        setWrappedAndUnderlying(wrappedAndUnderlying)
        return boostedTokenSelectDisclosure.onOpen()
      }
    }
    return undefined
  }

  return (
    <>
      <Card variant="subSection">
        <VStack align="start" spacing="md">
          <Text fontSize="sm" fontWeight="bold">
            You&apos;re expected to get (if no slippage)
          </Text>
          {tokens.map(
            token =>
              token && (
                <TokenRow
                  address={token.address as Address}
                  chain={pool.chain}
                  isLoading={isLoading}
                  key={token.address}
                  toggleTokenSelect={getToggleTokenCallback(token)}
                  value={amountOutForToken(token.address as Address)}
                />
              )
          )}
        </VStack>
      </Card>
      {!!validTokens.length && (
        <NativeAssetSelectModal
          chain={validTokens[0].chain}
          isOpen={nativeTokenSelectDisclosure.isOpen}
          nativeAssets={nativeAssets}
          onClose={nativeTokenSelectDisclosure.onClose}
          onOpen={nativeTokenSelectDisclosure.onOpen}
          onTokenSelect={handleTokenSelect}
        />
      )}

      {!!validTokens.length && (
        <WrappedOrUnderlyingSelectModal
          chain={validTokens[0].chain}
          isOpen={boostedTokenSelectDisclosure.isOpen && !!wrappedAndUnderlying}
          onClose={boostedTokenSelectDisclosure.onClose}
          onOpen={boostedTokenSelectDisclosure.onOpen}
          onTokenSelect={onBoostedTokenSelect}
          tokens={wrappedAndUnderlying as ApiToken[]}
        />
      )}
    </>
  )
}
