import { Card, HStack, Skeleton, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAddLiquidity } from '../AddLiquidityProvider'
import { TokenInputs } from './TokenInputs'
import { useProportionalInputs } from './useProportionalInputs'
import { ApiToken, HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'
import { WrappedOrUnderlyingSelectModal } from '@repo/lib/modules/tokens/WrappedOrUnderlyingSelectModal'
import { useMemo, useState } from 'react'
import { usePool } from '../../../PoolProvider'
import { NativeAssetSelectModal } from '@repo/lib/modules/tokens/NativeAssetSelectModal'
import { isNativeAsset, isNativeOrWrappedNative } from '@repo/lib/modules/tokens/token.helpers'
import { Address } from 'viem'
import { useTokenInputsValidation } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { shouldShowNativeWrappedSelector } from '../../LiquidityActionHelpers'
import { getWrappedAndUnderlyingTokenFn } from '../../../pool-tokens.utils'
import { isEqual } from 'lodash'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { bn } from '@repo/lib/shared/utils/numbers'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { HumanAmount } from '@balancer/sdk'
import { TooltipWithTouch } from '@repo/lib/shared/components/tooltips/TooltipWithTouch'
import { AlertIcon } from '@repo/lib/shared/components/icons/AlertIcon'

type Props = {
  isProportional: boolean
  totalUSDValue: string
}

export function TokenInputsMaybeProportional({ isProportional }: Props) {
  const {
    setHumanAmountIn,
    setHumanAmountsIn,
    humanAmountsIn,
    tokens,
    validTokens,
    setWethIsEth,
    setWrapUnderlyingByIndex,
    wrapUnderlying,
    clearAmountsIn,
  } = useAddLiquidity()
  const { isConnected, isLoading: isUserAccountLoading } = useUserAccount()
  const { toCurrency } = useCurrency()
  const { usdValueForToken } = useTokens()
  const { chain, pool } = usePool()
  const { balanceFor, balances, isBalancesLoading } = useTokenBalances()

  const {
    handleProportionalHumanInputChange,
    maxProportionalHumanAmountsIn,
    handleMaximizeProportionalAmounts,
  } = useProportionalInputs()
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

  const poolTokenBalances = useMemo(
    () =>
      tokens.map(token => {
        const formattedBalance = balanceFor(token.address)?.formatted || '0'

        return {
          token,
          formattedBalance,
          hasBalance: bn(formattedBalance).gt(0),
        }
      }),
    [tokens, balances, balanceFor]
  )

  const hasAnyPoolTokenBalance = poolTokenBalances.some(token => token.hasBalance)
  const addableTokenCount = poolTokenBalances.filter(token => token.hasBalance).length
  const totalPoolTokenCount = poolTokenBalances.length
  const missingPoolTokenCount = poolTokenBalances.filter(token => !token.hasBalance).length

  const addableUsdBalance = useMemo(() => {
    return poolTokenBalances
      .reduce((sum, { formattedBalance, token }) => {
        return bn(sum).plus(usdValueForToken(token, formattedBalance))
      }, bn(0))
      .toString()
  }, [poolTokenBalances, usdValueForToken])

  const maxHumanAmountsIn = useMemo<HumanTokenAmountWithSymbol[]>(
    () =>
      poolTokenBalances.map(({ token, formattedBalance, hasBalance }) => ({
        tokenAddress: token.address as Address,
        humanAmount: hasBalance ? (formattedBalance as HumanAmount) : '',
        symbol: token.symbol,
      })),
    [poolTokenBalances]
  )

  const proportionalAddableUsdBalance = useMemo(() => {
    if (!maxProportionalHumanAmountsIn?.length) return '0'

    return maxProportionalHumanAmountsIn
      .reduce((sum, amountIn) => {
        const token = tokens.find(token =>
          isSameAddress(token.address as Address, amountIn.tokenAddress)
        )
        if (!token) return bn(sum)

        return bn(sum).plus(usdValueForToken(token, amountIn.humanAmount || '0'))
      }, bn(0))
      .toString()
  }, [maxProportionalHumanAmountsIn, tokens, usdValueForToken])

  const isFlexibleMaxApplied = useMemo(() => {
    if (!hasAnyPoolTokenBalance) return false

    return poolTokenBalances.every(({ token, formattedBalance, hasBalance }) => {
      const currentAmount = humanAmountsIn.find(amountIn =>
        isSameAddress(amountIn.tokenAddress, token.address as Address)
      )?.humanAmount

      if (hasBalance) {
        return !!currentAmount && bn(currentAmount).eq(formattedBalance)
      }

      return !currentAmount || bn(currentAmount).isZero()
    })
  }, [poolTokenBalances, humanAmountsIn, hasAnyPoolTokenBalance])

  const isProportionalMaxApplied = useMemo(() => {
    if (!maxProportionalHumanAmountsIn?.length) return false

    return maxProportionalHumanAmountsIn.every(expectedAmount => {
      const currentAmount = humanAmountsIn.find(amountIn =>
        isSameAddress(amountIn.tokenAddress, expectedAmount.tokenAddress)
      )?.humanAmount

      if (!expectedAmount.humanAmount) {
        return !currentAmount || bn(currentAmount).isZero()
      }

      return !!currentAmount && bn(currentAmount).eq(expectedAmount.humanAmount)
    })
  }, [maxProportionalHumanAmountsIn, humanAmountsIn])

  const canApplyProportionalMax = !!maxProportionalHumanAmountsIn?.length
  const isFlexibleWarning = !hasAnyPoolTokenBalance
  const isProportionalWarning = missingPoolTokenCount > 0

  const flexibleAddableLabel = `${addableTokenCount} Addable token${addableTokenCount === 1 ? '' : 's'}`

  const proportionalAddableLabel = isProportionalWarning
    ? `${addableTokenCount}/${totalPoolTokenCount} Addable token${totalPoolTokenCount === 1 ? '' : 's'}`
    : `${totalPoolTokenCount} Addable token${totalPoolTokenCount === 1 ? '' : 's'}`

  const flexibleWarningTooltip =
    "You don't have any of these pool tokens in your wallet, so you can't add any liquidity to this pool right now. Get some pool tokens and come back"

  const proportionalWarningTooltip = `You are missing ${missingPoolTokenCount} pool token${missingPoolTokenCount === 1 ? '' : 's'}. You'll need all of them in order to add proportional liquidity to this pool. Get all pool tokens and come back`

  const warningOverlayStyles = {
    _before: {
      content: '""',
      position: 'absolute',
      inset: 0,
      bg: 'font.warning',
      opacity: 0.05,
      borderRadius: 'inherit',
      pointerEvents: 'none',
    },
    _after: {
      content: '""',
      position: 'absolute',
      inset: 0,
      border: '1px solid',
      borderColor: 'font.warning',
      opacity: 0.5,
      borderRadius: 'inherit',
      pointerEvents: 'none',
    },
  }

  function handleFlexibleMaxClick() {
    if (isFlexibleMaxApplied || !hasAnyPoolTokenBalance) return

    setHumanAmountsIn(maxHumanAmountsIn)
  }

  function handleProportionalMaxClick() {
    if (isProportionalMaxApplied || !canApplyProportionalMax) return

    handleMaximizeProportionalAmounts()
  }

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
      {(isConnected || isUserAccountLoading) && (
        <Card
          p={['sm', 'ms']}
          position="relative"
          variant="subSection"
          w="full"
          {...(!isBalancesLoading &&
          !isUserAccountLoading &&
          ((!isProportional && isFlexibleWarning) || (isProportional && isProportionalWarning))
            ? warningOverlayStyles
            : {})}
        >
          {isBalancesLoading || isUserAccountLoading ? (
            <HStack justify="space-between" position="relative" w="full" zIndex={1}>
              <Skeleton height="20px" width="120px" />
              <HStack gap={1.5}>
                <Skeleton height="20px" width="80px" />
                <Skeleton height="20px" width="30px" />
              </HStack>
            </HStack>
          ) : (
            <HStack justify="space-between" position="relative" w="full" zIndex={1}>
              {!isProportional && isFlexibleWarning ? (
                <TooltipWithTouch label={flexibleWarningTooltip} placement="top-start">
                  <HStack color="font.warning" cursor="help" gap={1}>
                    <Text color="font.warning" fontSize="sm">
                      {flexibleAddableLabel}
                    </Text>
                    <AlertIcon height="14" width="14" />
                  </HStack>
                </TooltipWithTouch>
              ) : null}

              {!isProportional && !isFlexibleWarning ? (
                <Text color="grayText" fontSize="sm">
                  {flexibleAddableLabel}
                </Text>
              ) : null}

              {isProportional && isProportionalWarning ? (
                <TooltipWithTouch label={proportionalWarningTooltip} placement="top-start">
                  <HStack color="font.warning" cursor="help" gap={1}>
                    <Text color="font.warning" fontSize="sm">
                      {proportionalAddableLabel}
                    </Text>
                    <AlertIcon height="14" width="14" />
                  </HStack>
                </TooltipWithTouch>
              ) : null}

              {isProportional && !isProportionalWarning ? (
                <Text color="grayText" fontSize="sm">
                  {proportionalAddableLabel}
                </Text>
              ) : null}

              {!isProportional ? (
                <HStack gap={1.5}>
                  <motion.div layout transition={{ duration: 0.2, ease: 'easeIn' }}>
                    <Text color="grayText" fontSize="sm">
                      {toCurrency(addableUsdBalance, { abbreviated: false })}
                    </Text>
                  </motion.div>
                  <motion.div
                    layout
                    style={{ position: 'relative' }}
                    transition={{ duration: 0.2, ease: 'easeIn' }}
                  >
                    <AnimatePresence initial={false} mode="popLayout">
                      {isFlexibleMaxApplied && !isFlexibleWarning ? (
                        <motion.div
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, transition: { duration: 0 } }}
                          initial={{ opacity: 0, x: 5 }}
                          key="clear"
                          style={{ transformOrigin: 'right', whiteSpace: 'nowrap' }}
                          transition={{ duration: 0.2, ease: 'easeIn' }}
                        >
                          <Text
                            color="font.default"
                            cursor="pointer"
                            fontSize="sm"
                            onClick={() => clearAmountsIn()}
                          >
                            Reset
                          </Text>
                        </motion.div>
                      ) : (
                        <motion.div
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, transition: { duration: 0 } }}
                          initial={{ opacity: 0, x: -5 }}
                          key="max"
                          style={{ transformOrigin: 'right', whiteSpace: 'nowrap' }}
                          transition={{ duration: 0.2, ease: 'easeIn' }}
                        >
                          <Text
                            color={isFlexibleWarning ? 'grayText' : 'font.highlight'}
                            cursor={isFlexibleWarning ? 'not-allowed' : 'pointer'}
                            fontSize="sm"
                            onClick={isFlexibleWarning ? undefined : handleFlexibleMaxClick}
                            opacity={isFlexibleWarning ? 0.5 : 1}
                          >
                            Max
                          </Text>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </HStack>
              ) : (
                <HStack gap={1.5}>
                  <motion.div layout transition={{ duration: 0.2, ease: 'easeIn' }}>
                    <Text color="grayText" fontSize="sm">
                      {toCurrency(proportionalAddableUsdBalance, { abbreviated: false })}
                    </Text>
                  </motion.div>
                  <motion.div
                    layout
                    style={{ position: 'relative' }}
                    transition={{ duration: 0.2, ease: 'easeIn' }}
                  >
                    <AnimatePresence initial={false} mode="popLayout">
                      {isProportionalMaxApplied &&
                      canApplyProportionalMax &&
                      !isProportionalWarning ? (
                        <motion.div
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, transition: { duration: 0 } }}
                          initial={{ opacity: 0, x: 5 }}
                          key="clear"
                          style={{ transformOrigin: 'right', whiteSpace: 'nowrap' }}
                          transition={{ duration: 0.2, ease: 'easeIn' }}
                        >
                          <Text
                            color="font.default"
                            cursor="pointer"
                            fontSize="sm"
                            onClick={() => clearAmountsIn()}
                          >
                            Reset
                          </Text>
                        </motion.div>
                      ) : (
                        <motion.div
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, transition: { duration: 0 } }}
                          initial={{ opacity: 0, x: -5 }}
                          key="max"
                          style={{ transformOrigin: 'right', whiteSpace: 'nowrap' }}
                          transition={{ duration: 0.2, ease: 'easeIn' }}
                        >
                          <Text
                            color={
                              !canApplyProportionalMax || isProportionalWarning
                                ? 'grayText'
                                : 'font.highlight'
                            }
                            cursor={
                              !canApplyProportionalMax || isProportionalWarning
                                ? 'not-allowed'
                                : 'pointer'
                            }
                            fontSize="sm"
                            onClick={
                              !canApplyProportionalMax || isProportionalWarning
                                ? undefined
                                : handleProportionalMaxClick
                            }
                            opacity={!canApplyProportionalMax || isProportionalWarning ? 0.5 : 1}
                          >
                            Max
                          </Text>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </HStack>
              )}
            </HStack>
          )}
        </Card>
      )}

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
