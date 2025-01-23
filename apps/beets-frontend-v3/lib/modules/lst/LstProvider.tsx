/* eslint-disable max-len */
'use client'

import { useState, PropsWithChildren, createContext, useMemo } from 'react'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { ButtonGroupOption } from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { useLstStakeStep } from './hooks/useLstStakeStep'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import sonicNetworkConfig from '@repo/lib/config/networks/sonic'
import { useLstUnstakeStep } from './hooks/useLstUnstakeStep'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { LABELS } from '@repo/lib/shared/labels'
import { bn } from '@repo/lib/shared/utils/numbers'
import { isDisabledWithReason } from '@repo/lib/shared/utils/functions/isDisabledWithReason'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { PaginationState } from '@repo/lib/shared/components/pagination/pagination.types'
import { useLstWithdrawStep } from './hooks/useLstWithdrawStep'
import { useTokenInputsValidation } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { formatUnits, parseUnits } from 'viem'
import { useGetRate } from './hooks/useGetRate'

const CHAIN = GqlChain.Sonic
const WITHDRAW_DELAY = 1209600 // 14 days in seconds

export function _useLst() {
  const [activeTab, setActiveTab] = useState<ButtonGroupOption>()
  const [amountAssets, setAmountAssets] = useState('')
  const [amountShares, setAmountShares] = useState('')
  const [amountWithdraw, setAmountWithdraw] = useState(0n)
  const [first, setFirst] = useState(5)
  const [skip, setSkip] = useState(0)
  const [withdrawId, setWithdrawId] = useState<bigint>(0n)
  const { isConnected } = useUserAccount()
  const { getToken } = useTokens()
  const { hasValidationError, getValidationError } = useTokenInputsValidation()

  function setPagination(pagination: PaginationState) {
    setFirst(pagination.pageSize)
    setSkip(pagination.pageIndex * pagination.pageSize)
  }

  const pagination: PaginationState = {
    pageIndex: skip / first,
    pageSize: first,
  }

  const isStakeTab = activeTab?.value === '0'
  const isUnstakeTab = activeTab?.value === '1'
  const isWithdrawTab = activeTab?.value === '2'

  const nativeAsset = getToken(sonicNetworkConfig.tokens.nativeAsset.address, CHAIN)
  const stakedAsset = getToken(sonicNetworkConfig.tokens.stakedAsset?.address || '', CHAIN)

  const { step: stakeStep } = useLstStakeStep(amountAssets, CHAIN, isStakeTab)
  const stakeTransactionSteps = useTransactionSteps([stakeStep], false)
  const lstStakeTxHash = stakeTransactionSteps.lastTransaction?.result?.data?.transactionHash
  const lstStakeTxConfirmed = stakeTransactionSteps.lastTransactionConfirmed

  const { step: unstakeStep } = useLstUnstakeStep(amountShares, CHAIN, isUnstakeTab)
  const unstakeTransactionSteps = useTransactionSteps([unstakeStep], false)
  const lstUnstakeTxHash = unstakeTransactionSteps.lastTransaction?.result?.data?.transactionHash
  const lstUnstakeTxConfirmed = unstakeTransactionSteps.lastTransactionConfirmed

  const { step: withdrawStep } = useLstWithdrawStep(CHAIN, isWithdrawTab, withdrawId)
  const withdrawTransactionSteps = useTransactionSteps([withdrawStep], false)
  const lstWithdrawTxHash = withdrawTransactionSteps.lastTransaction?.result?.data?.transactionHash
  const lstWithdrawTxConfirmed = withdrawTransactionSteps.lastTransactionConfirmed

  const hasStakedAssetValidationError = hasValidationError(stakedAsset)
  const hasNativeAssetValidationError = hasValidationError(nativeAsset)

  const { data: rate, isLoading: isRateLoading } = useGetRate(CHAIN)

  const getAmountShares = useMemo(() => {
    return (amountAssets: string) => {
      if (amountAssets === '' || !rate) return '0'
      const amountShares = (parseUnits(amountAssets, 18) * 10n ** 18n) / rate
      return formatUnits(amountShares, 18)
    }
  }, [rate])

  const getAmountAssets = useMemo(() => {
    return (amountShares: string) => {
      if (amountShares === '' || !rate) return '0'
      const amountAssets = (parseUnits(amountShares, 18) * rate) / 10n ** 18n
      return formatUnits(amountAssets, 18)
    }
  }, [rate])

  const disabledConditions = useMemo(
    () =>
      [
        [!isConnected, LABELS.walletNotConnected],
        [
          isStakeTab && (!amountAssets || bn(amountAssets).lt(0.01)),
          'Minimum amount to stake is 0.01',
        ],
        [
          isUnstakeTab && (!amountShares || bn(amountShares).lte(0)),
          'Please enter an amount to unstake',
        ],
        [isStakeTab && hasNativeAssetValidationError, getValidationError(nativeAsset)],
        [isUnstakeTab && hasStakedAssetValidationError, getValidationError(stakedAsset)],
        // eslint-disable-next-line react-hooks/exhaustive-deps
      ] as [boolean, string][],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      isConnected,
      isStakeTab,
      isUnstakeTab,
      amountAssets,
      amountShares,
      hasNativeAssetValidationError,
      hasStakedAssetValidationError,
      nativeAsset,
      stakedAsset,
    ]
  )

  const { isDisabled, disabledReason } = useMemo(
    () => isDisabledWithReason(...disabledConditions),
    [disabledConditions]
  )

  return {
    activeTab,
    setActiveTab,
    stakeTransactionSteps,
    amountAssets,
    setAmountAssets,
    amountShares,
    setAmountShares,
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
    withdrawDelay: WITHDRAW_DELAY,
    pagination,
    setPagination,
    first,
    skip,
    withdrawTransactionSteps,
    lstWithdrawTxHash,
    lstWithdrawTxConfirmed,
    withdrawId,
    setWithdrawId,
    getAmountShares,
    getAmountAssets,
    isRateLoading,
    amountWithdraw,
    setAmountWithdraw,
  }
}

export type Result = ReturnType<typeof _useLst>
export const LstContext = createContext<Result | null>(null)

export function LstProvider({ children }: PropsWithChildren) {
  const Lst = _useLst()

  return <LstContext.Provider value={Lst}>{children}</LstContext.Provider>
}

export const useLst = (): Result => useMandatoryContext(LstContext, 'Lst')
