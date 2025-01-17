'use client'

// eslint-disable-next-line max-len
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import ClaimNetworkPoolsLayoutWrapper from '@repo/lib/modules/portfolio/PortfolioClaim/ClaimNetworkPools/ClaimNetworkPoolsLayoutWrapper'

export default function NetworkClaim() {
  return (
    <TransactionStateProvider>
      <ClaimNetworkPoolsLayoutWrapper />
    </TransactionStateProvider>
  )
}
