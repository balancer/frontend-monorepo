'use client'

import { useState, PropsWithChildren, createContext } from 'react'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { ButtonGroupOption } from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { useLoopsDepositStep } from './hooks/useLoopsDepositStep'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import sonicNetworkConfig from '@repo/lib/config/networks/sonic'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { LABELS } from '@repo/lib/shared/labels'
import { isDisabledWithReason } from '@repo/lib/shared/utils/functions/isDisabledWithReason'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useTokenInputsValidation } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { bn } from '@repo/lib/shared/utils/numbers'
import { formatUnits, parseUnits } from 'viem'
import { useLoopsGetRate } from './hooks/useLoopsGetRate'
import { useLoopsWithdrawSteps } from './hooks/useLoopsWithdrawSteps'

const CHAIN = GqlChain.Sonic

export function useLoopsLogic() {
  const [activeTab, setActiveTab] = useState<ButtonGroupOption>()
  const [amountAssets, setAmountAssets] = useState('')
  const [amountShares, setAmountShares] = useState('')
  const { isConnected } = useUserAccount()
  const { getToken } = useTokens()
  const { hasValidationError, getValidationError } = useTokenInputsValidation()

  const isDepositTab = activeTab?.value === '0'
  const isWithdrawTab = activeTab?.value === '1'

  const nativeAsset = getToken(sonicNetworkConfig.tokens.nativeAsset.address, CHAIN)
  const loopedAsset = getToken(sonicNetworkConfig.tokens.loopedAsset?.address || '', CHAIN)
  const wNativeAsset = getToken(sonicNetworkConfig.tokens.addresses.wNativeAsset, CHAIN)

  const { step: depositStep } = useLoopsDepositStep(amountAssets, CHAIN, isDepositTab)
  const depositTransactionSteps = useTransactionSteps([depositStep], false)
  const loopsDepositTxHash = depositTransactionSteps.lastTransaction?.result?.data?.transactionHash
  const loopsStakeTxConfirmed = depositTransactionSteps.lastTransactionConfirmed

  const { steps: withdrawSteps, isLoadingSteps: isLoadingWithdrawSteps } = useLoopsWithdrawSteps({
    amountShares,
    chain: CHAIN,
    isWithdrawTab,
    loopedAsset,
  })

  const withdrawTransactionSteps = useTransactionSteps(withdrawSteps, isLoadingWithdrawSteps)

  const loopsWithdrawTxHash =
    withdrawTransactionSteps.lastTransaction?.result?.data?.transactionHash

  const loopsWithdrawTxConfirmed = withdrawTransactionSteps.lastTransactionConfirmed

  const hasLoopedAssetValidationError = hasValidationError(loopedAsset)
  const hasNativeAssetValidationError = hasValidationError(nativeAsset)

  const disabledConditions: [boolean, string][] = [
    [!isConnected, LABELS.walletNotConnected],
    [
      isDepositTab && (!amountAssets || bn(amountAssets).lte(0)),
      'Please enter an amount to deposit',
    ],
    [isDepositTab && hasNativeAssetValidationError, getValidationError(nativeAsset)],
    [
      isWithdrawTab && (!amountShares || bn(amountShares).lte(0)),
      'Please enter an amount to wihdraw',
    ],
    [isWithdrawTab && hasLoopedAssetValidationError, getValidationError(loopedAsset)],
  ]

  const { isDisabled, disabledReason } = isDisabledWithReason(...disabledConditions)

  const { data: rate, isLoading: isRateLoading } = useLoopsGetRate(CHAIN)

  function getAmountShares(amountAssets: string) {
    if (amountAssets === '') return '0'

    const amountShares = (parseUnits(amountAssets, 18) * 10n ** 18n) / (rate || 1n)

    return formatUnits(amountShares, 18)
  }

  function getAmountAssets(amountShares: string) {
    if (amountShares === '') return '0'

    const amountAssets = (parseUnits(amountShares, 18) * (rate || 1n)) / 10n ** 18n

    return formatUnits(amountAssets, 18)
  }

  return {
    activeTab,
    setActiveTab,
    depositTransactionSteps,
    lastTransaction: depositTransactionSteps.lastTransaction,
    amountAssets,
    setAmountAssets,
    chain: CHAIN,
    loopsDepositTxHash,
    loopsStakeTxConfirmed,
    nativeAsset,
    loopedAsset,
    isDisabled,
    disabledReason,
    isDepositTab,
    isWithdrawTab,
    withdrawTransactionSteps,
    loopsWithdrawTxHash,
    loopsWithdrawTxConfirmed,
    amountShares,
    setAmountShares,
    getAmountShares,
    isRateLoading,
    getAmountAssets,
    wNativeAsset,
  }
}

export type Result = ReturnType<typeof useLoopsLogic>
export const LoopsContext = createContext<Result | null>(null)

export function LoopsProvider({ children }: PropsWithChildren) {
  const Loops = useLoopsLogic()

  return <LoopsContext.Provider value={Loops}>{children}</LoopsContext.Provider>
}

export const useLoops = (): Result => useMandatoryContext(LoopsContext, 'Loops')
