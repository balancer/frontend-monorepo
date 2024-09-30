'use client'

import { PoolListItem } from '../../pool.types'
import { useClaimAllRewardsSteps } from './useClaimAllRewardsSteps'
import { useClaimsData } from './useClaimsData'
import { useDisclosure } from '@chakra-ui/hooks'
import { createContext, PropsWithChildren } from 'react'
import { Pool } from '../../PoolProvider'
import { LABELS } from '../../../../shared/labels'
import { useMandatoryContext } from '../../../../shared/utils/contexts'
import { isDisabledWithReason } from '../../../../shared/utils/functions/isDisabledWithReason'
import { useTransactionSteps } from '../../../transactions/transaction-steps/useTransactionSteps'
import { useUserAccount } from '../../../web3/UserAccountProvider'

export type ClaimablePool = Pool | PoolListItem

export function _useClaim(pools: ClaimablePool[]) {
  const { isConnected } = useUserAccount()
  const previewModalDisclosure = useDisclosure()
  const { isDisabled, disabledReason } = isDisabledWithReason([
    !isConnected,
    LABELS.walletNotConnected,
  ])

  const claimsData = useClaimsData(pools)

  const {
    claimableBalancesQuery,
    balTokenRewardsQuery,
    isLoading: isLoadingData,
    ...claimsState
  } = claimsData

  const { steps, isLoading: isLoadingSteps } = useClaimAllRewardsSteps({
    pools,
    claimableBalancesQuery,
    balTokenRewardsQuery,
  })
  const transactionSteps = useTransactionSteps(steps, isLoadingSteps)

  const claimTxHash = transactionSteps.lastTransaction?.result?.data?.transactionHash

  return {
    isLoading: isLoadingData || isLoadingSteps,
    transactionSteps,
    claimTxHash,
    isDisabled,
    disabledReason,
    previewModalDisclosure,
    ...claimsState,
  }
}

export type UseClaimProviderResponse = ReturnType<typeof _useClaim>
export const ClaimProviderContext = createContext<UseClaimProviderResponse | null>(null)

type Props = PropsWithChildren<{
  pools: ClaimablePool[]
}>

export function ClaimProvider({ pools, children }: Props) {
  const hook = _useClaim(pools)
  return <ClaimProviderContext.Provider value={hook}>{children}</ClaimProviderContext.Provider>
}

export const useClaim = (): UseClaimProviderResponse =>
  useMandatoryContext(ClaimProviderContext, 'Claim')
