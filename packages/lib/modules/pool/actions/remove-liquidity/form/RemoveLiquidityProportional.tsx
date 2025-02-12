/* eslint-disable react-hooks/exhaustive-deps */
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

type Props = { tokens: ApiToken[]; pool: Pool }
export function RemoveLiquidityProportional({ tokens, pool }: Props) {
  const { amountOutForToken, validTokens, setWethIsEth, simulationQuery, priceImpactQuery } =
    useRemoveLiquidity()
  const tokenSelectDisclosure = useDisclosure()
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
                  toggleTokenSelect={
                    shouldShowNativeWrappedSelector(token, pool)
                      ? () => tokenSelectDisclosure.onOpen()
                      : undefined
                  }
                  value={amountOutForToken(token.address as Address)}
                />
              )
          )}
        </VStack>
      </Card>
      {!!validTokens.length && (
        <NativeAssetSelectModal
          chain={validTokens[0].chain}
          isOpen={tokenSelectDisclosure.isOpen}
          nativeAssets={nativeAssets}
          onClose={tokenSelectDisclosure.onClose}
          onOpen={tokenSelectDisclosure.onOpen}
          onTokenSelect={handleTokenSelect}
        />
      )}
    </>
  )
}
