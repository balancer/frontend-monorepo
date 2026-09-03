'use client'

import { useIsSafeApp } from '../../web3/safe.hooks'
import { useEip5792AtomicCapability } from '../../web3/useEip5792Capabilities'
import { useEip5792BatchSubmitter } from './eip5792/useEip5792BatchSubmitter'
import { useSafeBatchSubmitter } from './safe/useSafeBatchSubmitter'
import { BatchSubmitter, ManagedResult, TransactionLabels, TransactionStep } from './lib'

type Props = {
  labels: TransactionLabels
  chainId: number
  currentStep: TransactionStep
  onTransactionChange: (transaction: ManagedResult) => void
}

/*
  Composition root that picks the wallet-specific batch submitter.
  Safe and EIP-5792 submitters stay decoupled from each other; this is the only
  place that knows about both. Both hooks are mounted unconditionally (React rules) but
  only the one matching the connected wallet is returned.
*/
export function useBatchSubmitter(props: Props): BatchSubmitter {
  const isSafeApp = useIsSafeApp()
  const { atomicStatus } = useEip5792AtomicCapability()

  const safeSubmitter = useSafeBatchSubmitter(props)
  const eip5792Submitter = useEip5792BatchSubmitter(props)

  if (isSafeApp) return safeSubmitter

  const isEip5792 = atomicStatus === 'supported' || atomicStatus === 'ready'
  if (isEip5792) return eip5792Submitter

  return safeSubmitter
}
