import { useEffect } from 'react'
import { Address } from 'viem'
import { useRecentTransactions } from '../../transactions/RecentTransactionsProvider'
import { TransactionLabels } from '../../transactions/transaction-steps/lib'
import { GqlChain } from '../../../shared/services/api/generated/graphql'
import { AnalyticsEvent, trackEvent } from '../../../shared/services/fathom/Fathom'

type NewTrackedTransactionRequest = {
  labels: TransactionLabels
  chain: GqlChain
  hash?: Address
}

export function useOnTransactionSubmission({ labels, hash, chain }: NewTrackedTransactionRequest) {
  const { addTrackedTransaction } = useRecentTransactions()

  // on successful submission to chain, add tx to cache
  useEffect(() => {
    if (hash) {
      trackEvent(AnalyticsEvent.TransactionSubmitted)
      addTrackedTransaction({
        hash,
        chain,
        label: labels.confirming || 'Confirming transaction',
        description: labels.description,
        status: 'confirming',
        timestamp: Date.now(),
        init: labels.init,
        poolId: labels.poolId,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash])
}