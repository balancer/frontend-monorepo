'use client'
import { Stack } from '@chakra-ui/react'
import { PortfolioSummary } from './PortfolioSummary'
import { PortfolioTable } from './PortfolioTable/PortfolioTable'
import { ClaimNetworkPools } from './PortfolioClaim/ClaimNetworkPools/ClaimNetworkPools'
import { TransactionStateProvider } from '../transactions/transaction-steps/TransactionStateProvider'

export default function Portfolio() {
  return (
    <Stack width="full" gap={20}>
      <PortfolioSummary />
      <TransactionStateProvider>
        <ClaimNetworkPools />
      </TransactionStateProvider>
      <PortfolioTable />
    </Stack>
  )
}
