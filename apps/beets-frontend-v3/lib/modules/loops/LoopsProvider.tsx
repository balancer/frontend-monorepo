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
//import { useTokenInputsValidation } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'

const CHAIN = GqlChain.Sonic

export function useLoopsLogic() {
  const [activeTab, setActiveTab] = useState<ButtonGroupOption>()
  const [amountDeposit, setAmountDeposit] = useState('')
  const [amountWithdraw, setAmountWithdraw] = useState('')
  const { isConnected } = useUserAccount()
  const { getToken } = useTokens()
  // const { hasValidationError, getValidationError } = useTokenInputsValidation()

  const isDepositTab = activeTab?.value === '0'
  const isWithdrawTab = activeTab?.value === '1'

  const nativeAsset = getToken(sonicNetworkConfig.tokens.nativeAsset.address, CHAIN)
  const stakedAsset = getToken(sonicNetworkConfig.tokens.stakedAsset?.address || '', CHAIN)

  const { step: depositStep } = useLoopsDepositStep(amountDeposit, CHAIN, isDepositTab)
  const depositTransactionSteps = useTransactionSteps([depositStep], false)
  const loopsDepositTxHash = depositTransactionSteps.lastTransaction?.result?.data?.transactionHash
  const loopsStakeTxConfirmed = depositTransactionSteps.lastTransactionConfirmed

  const { step: withdrawStep } = useLoopsWithdrawStep(amountWithdraw, CHAIN, isWithdrawTab)
  const withdrawTransactionSteps = useTransactionSteps([withdrawStep], false)
  const loopsWithdrawTxHash =
    withdrawTransactionSteps.lastTransaction?.result?.data?.transactionHash
  const loopsWithdrawTxConfirmed = withdrawTransactionSteps.lastTransactionConfirmed

  // const hasStakedAssetValidationError = hasValidationError(stakedAsset)
  // const hasNativeAssetValidationError = hasValidationError(nativeAsset)

  const disabledConditions: [boolean, string][] = [
    [!isConnected, LABELS.walletNotConnected],
    //    [isStakeTab && hasNativeAssetValidationError, getValidationError(nativeAsset)],
    // [isUnstakeTab && hasStakedAssetValidationError, getValidationError(stakedAsset)],
  ]

  const { isDisabled, disabledReason } = isDisabledWithReason(...disabledConditions)

  return {
    activeTab,
    setActiveTab,
    depositTransactionSteps,
    lastTransaction: depositTransactionSteps.lastTransaction,
    amountDeposit,
    setAmountDeposit,
    chain: CHAIN,
    loopsDepositTxHash,
    loopsStakeTxConfirmed,
    nativeAsset,
    stakedAsset,
    isDisabled,
    disabledReason,
    isDepositTab,
    isWithdrawTab,
    withdrawTransactionSteps,
    loopsWithdrawTxHash,
    loopsWithdrawTxConfirmed,
    amountWithdraw,
    setAmountWithdraw,
  }
}

export type Result = ReturnType<typeof useLoopsLogic>
export const LoopsContext = createContext<Result | null>(null)

export function LoopsProvider({ children }: PropsWithChildren) {
  const Loops = useLoopsLogic()

  return <LoopsContext.Provider value={Loops}>{children}</LoopsContext.Provider>
}

export const useLoops = (): Result => useMandatoryContext(LoopsContext, 'Loops')
