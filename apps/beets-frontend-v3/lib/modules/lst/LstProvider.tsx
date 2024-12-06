/* eslint-disable max-len */
import { useState, PropsWithChildren, createContext } from 'react'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { ButtonGroupOption } from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { useLstStakeStep } from './useLstStakeStep'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

const TABS: ButtonGroupOption[] = [
  {
    value: '0',
    label: 'Stake',
    disabled: false,
    iconTooltipLabel:
      'Enter any amount for each token manually. Balances are independent, and no automatic adjustments will be made.',
  },
  {
    value: '1',
    label: 'Unstake',
    disabled: false,
    iconTooltipLabel:
      "When you enter an amount for one token, the others are automatically adjusted to maintain the pool's proportional balance.",
  },
  {
    value: '2',
    label: 'Withdraw',
    disabled: false,
    iconTooltipLabel:
      "When you enter an amount for one token, the others are automatically adjusted to maintain the pool's proportional balance.",
  },
]

export function _useLst() {
  const [activeTab, setActiveTab] = useState(TABS[0])
  const [amount, setAmount] = useState('0')
  const { step: stakeStep } = useLstStakeStep(activeTab.value)
  const stakeTransactionSteps = useTransactionSteps([stakeStep], false)

  const chain = GqlChain.Fantom

  return { activeTab, setActiveTab, TABS, stakeTransactionSteps, amount, setAmount, chain }
}

export type Result = ReturnType<typeof _useLst>
export const LstContext = createContext<Result | null>(null)

export function LstProvider({ children }: PropsWithChildren) {
  const Lst = _useLst()

  return <LstContext.Provider value={Lst}>{children}</LstContext.Provider>
}

export const useLst = (): Result => useMandatoryContext(LstContext, 'Lst')
