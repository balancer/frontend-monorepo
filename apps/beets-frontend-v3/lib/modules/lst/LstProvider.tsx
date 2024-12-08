/* eslint-disable max-len */
'use client'

import { useState, PropsWithChildren, createContext, useEffect } from 'react'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { ButtonGroupOption } from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { useLstStakeStep } from './hooks/useLstStakeStep'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import fantomNetworkConfig from '@repo/lib/config/networks/fantom'
import { useLstUnstakeStep } from './hooks/useLstUnstakeStep'

const TABS: ButtonGroupOption[] = [
  {
    value: '0',
    label: 'Stake',
    disabled: false,
  },
  {
    value: '1',
    label: 'Unstake',
    disabled: false, // TODO: disable when no tokens staked
  },
  {
    value: '2',
    label: 'Withdraw',
    disabled: false, // TODO: disable when no tokens unstaked
  },
]

const CHAIN = GqlChain.Fantom

export function _useLst() {
  const [activeTab, setActiveTab] = useState(TABS[0])
  const [amount, setAmount] = useState('')
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

  return {
    activeTab,
    setActiveTab,
    tabs: TABS,
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
  }
}

export type Result = ReturnType<typeof _useLst>
export const LstContext = createContext<Result | null>(null)

export function LstProvider({ children }: PropsWithChildren) {
  const Lst = _useLst()

  return <LstContext.Provider value={Lst}>{children}</LstContext.Provider>
}

export const useLst = (): Result => useMandatoryContext(LstContext, 'Lst')
