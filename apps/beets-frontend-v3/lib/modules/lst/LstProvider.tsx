/* eslint-disable max-len */
import { useState, PropsWithChildren, createContext } from 'react'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { ButtonGroupOption } from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { useLstStakeStep } from './hooks/useLstStakeStep'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import fantomNetworkConfig from '@repo/lib/config/networks/fantom'

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

export function _useLst() {
  const [activeTab, setActiveTab] = useState(TABS[0])
  const [amount, setAmount] = useState('')
  const { step: stakeStep } = useLstStakeStep(amount)
  const stakeTransactionSteps = useTransactionSteps([stakeStep], false)

  const nativeAsset = fantomNetworkConfig.tokens.nativeAsset.address
  const stakedAsset = fantomNetworkConfig.tokens.stakedAsset?.address || ''

  const chain = GqlChain.Fantom

  const lstStakeTxHash = stakeTransactionSteps.lastTransaction?.result?.data?.transactionHash
  const lstStakeTxConfirmed = stakeTransactionSteps.lastTransactionConfirmed

  return {
    activeTab,
    setActiveTab,
    TABS,
    stakeTransactionSteps,
    amount,
    setAmount,
    chain,
    lstStakeTxHash,
    lstStakeTxConfirmed,
    nativeAsset,
    stakedAsset,
  }
}

export type Result = ReturnType<typeof _useLst>
export const LstContext = createContext<Result | null>(null)

export function LstProvider({ children }: PropsWithChildren) {
  const Lst = _useLst()

  return <LstContext.Provider value={Lst}>{children}</LstContext.Provider>
}

export const useLst = (): Result => useMandatoryContext(LstContext, 'Lst')
