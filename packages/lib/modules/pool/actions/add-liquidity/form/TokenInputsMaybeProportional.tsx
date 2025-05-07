 
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
import { getWrappedAndUnderlyingTokenFn } from '../../../pool-tokens.utils'
import { isEqual } from 'lodash'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'

type Props = {
  isProportional: boolean
  totalUSDValue: string
}

export function TokenInputsMaybeProportional({ isProportional }: Props) {
  const {
    setHumanAmountIn,
    validTokens,
    setWethIsEth,
    setWrapUnderlyingByIndex,
    wrapUnderlying,
    clearAmountsIn,
  } = useAddLiquidity()
  const { chain, pool } = usePool()
  const { balanceFor } = useTokenBalances()

  const { handleProportionalHumanInputChange } = useProportionalInputs()
  const { setValidationError } = useTokenInputsValidation()

  const setAmountIn = isProportional ? handleProportionalHumanInputChange : setHumanAmountIn

  // Triggers modal to select between native and wrapped tokens
  const nativeTokenSelectDisclosure = useDisclosure()
  // Triggers modal to select between wrapped or underlying tokens (only for boosted tokens)
  const boostedTokenSelectDisclosure = useDisclosure()

  // Array with the underlying and wrapped tokens to be selected in WrappedOrUnderlyingSelectModal
  const [wrappedAndUnderlying, setWrappedAndUnderlying] = useState<ApiToken[] | undefined>()

  const nativeAssets = validTokens.filter(token =>
    isNativeOrWrappedNative(token.address as Address, token.chain)
  )

  function handleNativeTokenSelect(token: ApiToken) {
    if (isNativeAsset(token.address as Address, token.chain)) {
      setWethIsEth(true)
    } else {
      setWethIsEth(false)
    }
    setAmountIn(token, '0')

    // reset any validation errors for native assets
    nativeAssets.forEach(nativeAsset => {
      setValidationError(nativeAsset.address as Address, '')
    })
  }

  function getToggleTokenCallback(token: ApiToken) {
    if (shouldShowNativeWrappedSelector(token, pool)) {
      return () => nativeTokenSelectDisclosure.onOpen()
    }

    const wrappedAndUnderlying = getWrappedAndUnderlyingTokenFn(token, pool, balanceFor)()
    if (wrappedAndUnderlying) {
      return () => {
        setWrappedAndUnderlying(wrappedAndUnderlying)
        return boostedTokenSelectDisclosure.onOpen()
      }
    }
    return undefined
  }

  function onBoostedTokenSelect(token: ApiToken) {
    if (token.index === undefined) {
      console.error('Token should have index', token)
      throw new Error(`Token index not found for token ${token.symbol}`)
    }

    const newWrapUnderlying = setWrapUnderlyingByIndex(token.index, !!token.wrappedToken)

    if (!isEqual(wrapUnderlying, newWrapUnderlying)) {
      clearAmountsIn()
    }
  }

  return (
    <VStack spacing="md" w="full">
      <TokenInputs
        customSetAmountIn={setAmountIn}
        getToggleTokenCallback={getToggleTokenCallback}
      />

      {!!validTokens.length && (
        <NativeAssetSelectModal
          chain={validTokens[0].chain}
          isOpen={nativeTokenSelectDisclosure.isOpen}
          nativeAssets={nativeAssets}
          onClose={nativeTokenSelectDisclosure.onClose}
          onOpen={nativeTokenSelectDisclosure.onOpen}
          onTokenSelect={handleNativeTokenSelect}
        />
      )}

      <WrappedOrUnderlyingSelectModal
        chain={chain}
        isOpen={boostedTokenSelectDisclosure.isOpen && !!wrappedAndUnderlying}
        onClose={boostedTokenSelectDisclosure.onClose}
        onOpen={boostedTokenSelectDisclosure.onOpen}
        onTokenSelect={onBoostedTokenSelect}
        tokens={wrappedAndUnderlying as ApiToken[]}
      />
    </VStack>
  )
}
