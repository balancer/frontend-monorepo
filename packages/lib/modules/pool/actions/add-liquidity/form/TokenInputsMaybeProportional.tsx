/* eslint-disable max-len */
import { useDisclosure, VStack } from '@chakra-ui/react'
import { useAddLiquidity } from '../AddLiquidityProvider'
import { TokenInputs } from './TokenInputs'
import { useProportionalInputs } from './useProportionalInputs'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { WrappedOrUnderlyingSelectModal } from '@repo/lib/modules/tokens/WrappedOrUnderlyingSelectModal'
import { useState } from 'react'
import { usePool } from '../../../PoolProvider'
import { NativeAssetSelectModal } from '@repo/lib/modules/tokens/NativeAssetSelectModal'
import { isNativeAsset, isNativeOrWrappedNative } from '@repo/lib/modules/tokens/token.helpers'
import { Address } from 'viem'
import { useTokenInputsValidation } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { shouldShowNativeWrappedSelector } from '../../LiquidityActionHelpers'
import { shouldUseUnderlyingToken } from '../../../pool-tokens.utils'

type Props = {
  isProportional: boolean
  totalUSDValue: string
}

export function TokenInputsMaybeProportional({ isProportional }: Props) {
  const { setHumanAmountIn, validTokens, setWethIsEth } = useAddLiquidity()
  const { chain, pool } = usePool()

  const { handleProportionalHumanInputChange } = useProportionalInputs()
  const { setValidationError } = useTokenInputsValidation()

  const setAmountIn = isProportional ? handleProportionalHumanInputChange : setHumanAmountIn

  // Triggers modal to select between native and wrapped tokens
  const nativeTokenSelectDisclosure = useDisclosure()
  // Triggers modal to select between wrapped or underlying tokens (only for boosted tokens)
  const boostedTokenSelectDisclosure2 = useDisclosure()

  const [selectedBoostedToken, setSelectedBoostedToken] = useState<ApiToken | null>(null)

  const wrappedAndUnderlyingTokens =
    selectedBoostedToken && selectedBoostedToken.underlyingToken
      ? [selectedBoostedToken, selectedBoostedToken.underlyingToken]
      : []

  const nativeAssets = validTokens.filter(token =>
    isNativeOrWrappedNative(token.address as Address, token.chain)
  )

  function handleTokenSelect(token: ApiToken) {
    if (isNativeAsset(token.address as Address, token.chain)) {
      setWethIsEth(true)
    } else {
      setWethIsEth(false)
    }
    setAmountIn(token, '')

    // reset any validation errors for native assets
    nativeAssets.forEach(nativeAsset => {
      setValidationError(nativeAsset.address as Address, '')
    })
  }

  function onToggleTokenClicked(token: ApiToken) {
    if (shouldShowNativeWrappedSelector(token, pool)) return nativeTokenSelectDisclosure.onOpen()
    if (shouldUseUnderlyingToken(token, pool)) {
      setSelectedBoostedToken(token)
      return boostedTokenSelectDisclosure2.onOpen()
    }
    console.error('Trying to toggle with incorrect token (no native, no boosted)', { token })
    return
  }

  return (
    <VStack spacing="md" w="full">
      <TokenInputs customSetAmountIn={setAmountIn} onToggleTokenClicked={onToggleTokenClicked} />

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

      <WrappedOrUnderlyingSelectModal
        chain={chain}
        isOpen={boostedTokenSelectDisclosure2.isOpen}
        onClose={boostedTokenSelectDisclosure2.onClose}
        onOpen={boostedTokenSelectDisclosure2.onOpen}
        // TODO: in incoming PRs
        // AddLiquidityProvider ->
        onTokenSelect={token =>
          console.log('TODO: handle boosted token select in AddLiquidity Provider', token)
        }
        tokens={wrappedAndUnderlyingTokens}
      />
    </VStack>
  )
}
