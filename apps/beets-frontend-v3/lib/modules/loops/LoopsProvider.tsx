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
import { useLoopsWithdrawStep } from './hooks/useLoopsWithdrawStep'
import { useTokenInputsValidation } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { bn } from '@repo/lib/shared/utils/numbers'
import { formatUnits, parseUnits } from 'viem'
import { useLoopsGetRate } from './hooks/useLoopsGetRate'

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

  const { step: depositStep } = useLoopsDepositStep(amountAssets, CHAIN, isDepositTab)
  const depositTransactionSteps = useTransactionSteps([depositStep], false)
  const loopsDepositTxHash = depositTransactionSteps.lastTransaction?.result?.data?.transactionHash
  const loopsStakeTxConfirmed = depositTransactionSteps.lastTransactionConfirmed

  const { step: withdrawStep } = useLoopsWithdrawStep(amountShares, CHAIN, isWithdrawTab)
  const withdrawTransactionSteps = useTransactionSteps([withdrawStep], false)
  const loopsWithdrawTxHash =
    withdrawTransactionSteps.lastTransaction?.result?.data?.transactionHash
  const loopsWithdrawTxConfirmed = withdrawTransactionSteps.lastTransactionConfirmed

  // const hasStakedAssetValidationError = hasValidationError(stakedAsset)
  const hasNativeAssetValidationError = hasValidationError(nativeAsset)

  const disabledConditions: [boolean, string][] = [
    [!isConnected, LABELS.walletNotConnected],
    [
      isDepositTab && (!amountAssets || bn(amountAssets).lte(0)),
      'Please enter an amount to deposit',
    ],
    [isDepositTab && hasNativeAssetValidationError, getValidationError(nativeAsset)],
    // [isUnstakeTab && hasStakedAssetValidationError, getValidationError(stakedAsset)],
  ]

  const { isDisabled, disabledReason } = isDisabledWithReason(...disabledConditions)

  const { data: rate, isLoading: isRateLoading } = useLoopsGetRate(CHAIN)

  function getAmountShares(amountAssets: string) {
    if (amountAssets === '') return '0'

    const amountShares = (parseUnits(amountAssets, 18) * 10n ** 18n) / (rate || 1n)

    return formatUnits(amountShares, 18)
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
  }
}

export type Result = ReturnType<typeof useLoopsLogic>
export const LoopsContext = createContext<Result | null>(null)

export function LoopsProvider({ children }: PropsWithChildren) {
  const Loops = useLoopsLogic()

  return <LoopsContext.Provider value={Loops}>{children}</LoopsContext.Provider>
}

export const useLoops = (): Result => useMandatoryContext(LoopsContext, 'Loops')
