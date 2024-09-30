/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { Card, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { Address } from 'viem'
import { useRemoveLiquidity } from '../RemoveLiquidityProvider'
import { shouldShowNativeWrappedSelector } from '../../LiquidityActionHelpers'
import { GqlToken, GqlPoolType } from '../../../../../shared/services/api/generated/graphql'
import { NativeAssetSelectModal } from '../../../../tokens/NativeAssetSelectModal'
import { isNativeOrWrappedNative, isNativeAsset } from '../../../../tokens/token.helpers'
import TokenRow from '../../../../tokens/TokenRow/TokenRow'

type Props = { tokens: (GqlToken | undefined)[]; poolType: GqlPoolType }
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
        <VStack spacing="md" align="start">
          <Text fontWeight="bold" fontSize="sm">
            You&apos;re expected to get (if no slippage)
          </Text>
          {tokens.map(
            token =>
              token && (
                <TokenRow
                  chain={token.chain}
                  key={token.address}
                  address={token.address as Address}
                  value={amountOutForToken(token.address as Address)}
                  toggleTokenSelect={
                    shouldShowNativeWrappedSelector(token, poolType)
                      ? () => tokenSelectDisclosure.onOpen()
                      : undefined
                  }
                  isLoading={isLoading}
                />
              )
          )}
        </VStack>
      </Card>
      {!!validTokens.length && (
        <NativeAssetSelectModal
          chain={validTokens[0].chain}
          isOpen={tokenSelectDisclosure.isOpen}
          onOpen={tokenSelectDisclosure.onOpen}
          onClose={tokenSelectDisclosure.onClose}
          onTokenSelect={handleTokenSelect}
          nativeAssets={nativeAssets}
        />
      )}
    </>
  )
}
