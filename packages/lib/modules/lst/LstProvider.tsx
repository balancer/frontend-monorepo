/* eslint-disable max-len */
'use client'

import { useState, PropsWithChildren, createContext } from 'react'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { ButtonGroupOption } from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { useLstStakeStep } from './hooks/useLstStakeStep'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import fantomNetworkConfig from '@repo/lib/config/networks/fantom'
import { useLstUnstakeStep } from './hooks/useLstUnstakeStep'
import { useUserAccount } from '../web3/UserAccountProvider'
import { LABELS } from '@repo/lib/shared/labels'
import { bn } from '@repo/lib/shared/utils/numbers'
import { isDisabledWithReason } from '@repo/lib/shared/utils/functions/isDisabledWithReason'

const CHAIN = GqlChain.Fantom

export function _useLst() {
  const [activeTab, setActiveTab] = useState<ButtonGroupOption>()
  const [amount, setAmount] = useState('')
  const { isConnected } = useUserAccount()
  const { step: stakeStep } = useLstStakeStep(amount, CHAIN)
  const stakeTransactionSteps = useTransactionSteps([stakeStep], false)
  const { step: unstakeStep } = useLstUnstakeStep(amount, CHAIN)
  const unstakeTransactionSteps = useTransactionSteps([unstakeStep], false)

  const nativeAsset = fantomNetworkConfig.tokens.nativeAsset.address
  const stakedAsset = fantomNetworkConfig.tokens.stakedAsset?.address || ''

  const lstStakeTxHash = stakeTransactionSteps.lastTransaction?.result?.data?.transactionHash
  const lstStakeTxConfirmed = stakeTransactionSteps.lastTransactionConfirmed

  const lstUnstakeTxHash = unstakeTransactionSteps.lastTransaction?.result?.data?.transactionHash
  const lstUnstakeTxConfirmed = unstakeTransactionSteps.lastTransactionConfirmed

  const isStakeTab = activeTab?.value === '0'
  const isUnstakeTab = activeTab?.value === '1'
  const isWithdrawTab = activeTab?.value === '2'

  const disabledConditions: [boolean, string][] = [
    [!isConnected, LABELS.walletNotConnected],
    [isStakeTab && (!amount || bn(amount).lt(1)), 'Minimum amount to stake is 1'],
    [isUnstakeTab && (!amount || bn(amount).lte(0)), 'Please enter an amount to unstake'],
  ]

  const { isDisabled, disabledReason } = isDisabledWithReason(...disabledConditions)

  return {
    activeTab,
    setActiveTab,
    stakeTransactionSteps,
    amount,
    setAmount,
    chain: CHAIN,
    lstStakeTxHash,
    lstStakeTxConfirmed,
    nativeAsset,
    stakedAsset,
    unstakeTransactionSteps,
    lstUnstakeTxHash,
    lstUnstakeTxConfirmed,
    isDisabled,
    disabledReason,
    isStakeTab,
    isUnstakeTab,
    isWithdrawTab,
  }
}

export type Result = ReturnType<typeof _useLst>
export const LstContext = createContext<Result | null>(null)

export function LstProvider({ children }: PropsWithChildren) {
  const Lst = _useLst()

  return <LstContext.Provider value={Lst}>{children}</LstContext.Provider>
}

export const useLst = (): Result => useMandatoryContext(LstContext, 'Lst')
