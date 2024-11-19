/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import TokenRow from '@repo/lib/modules/tokens/TokenRow/TokenRow'
import { GqlPoolType, GqlToken } from '@repo/lib/shared/services/api/generated/graphql'
import { Card, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { Address } from 'viem'
import { useRemoveLiquidity } from '../RemoveLiquidityProvider'
import { isNativeAsset, isNativeOrWrappedNative } from '@repo/lib/modules/tokens/token.helpers'
import { NativeAssetSelectModal } from '@repo/lib/modules/tokens/NativeAssetSelectModal'
import { shouldShowNativeWrappedSelector } from '../../LiquidityActionHelpers'

type Props = { tokens: GqlToken[]; poolType: GqlPoolType }
export function RemoveLiquidityProportional({ tokens, poolType }: Props) {
  const { amountOutForToken, validTokens, setWethIsEth, simulationQuery, priceImpactQuery } =
    useRemoveLiquidity()
  const tokenSelectDisclosure = useDisclosure()
  const isLoading = simulationQuery.isLoading || priceImpactQuery.isLoading

  const nativeAssets = validTokens.filter(token =>
    isNativeOrWrappedNative(token.address as Address, token.chain)
  )

  function handleTokenSelect(token: GqlToken) {
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
                  chain={token.chain}
                  isLoading={isLoading}
                  key={token.address}
                  toggleTokenSelect={
                    shouldShowNativeWrappedSelector(token, poolType)
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
