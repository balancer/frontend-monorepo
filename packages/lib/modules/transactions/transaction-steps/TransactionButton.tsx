/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect } from 'react'
import {
  ManagedErc20TransactionInput,
  useManagedErc20Transaction,
} from '../../web3/contracts/useManagedErc20Transaction'
import {
  ManagedSendTransactionInput,
  useManagedSendTransaction,
} from '../../web3/contracts/useManagedSendTransaction'
import {
  ManagedTransactionInput,
  useManagedTransaction,
} from '../../web3/contracts/useManagedTransaction'
import { TransactionStepButton } from './TransactionStepButton'

export function ManagedTransactionButton({
  id,
  ...params
}: { id: string } & ManagedTransactionInput) {
  const transaction = useManagedTransaction(params)

  useEffect(() => {
    params.onTransactionChange(transaction)
  }, [id, transaction.execution.status, transaction.simulation.status, transaction.result.status])

  return <TransactionStepButton step={{ labels: params.labels, ...transaction }} />
}

export function ManagedSendTransactionButton({
  id,
  ...params
}: { id: string } & ManagedSendTransactionInput) {
  const transaction = useManagedSendTransaction(params)

  useEffect(() => {
    params.onTransactionChange(transaction)
  }, [id, transaction.execution.status, transaction.simulation.status, transaction.result.status])

  return <TransactionStepButton step={{ labels: params.labels, ...transaction }} />
}

export function ManagedErc20TransactionButton({
  id,
  ...params
}: { id: string } & ManagedErc20TransactionInput) {
  const transaction = useManagedErc20Transaction(params)

  useEffect(() => {
    params.onTransactionChange(transaction)
  }, [id, transaction.execution.status, transaction.simulation.status, transaction.result.status])

  return (
    <TransactionStepButton
      step={{
        labels: params.labels,
        isComplete: params.isComplete,
        ...transaction,
      }}
    />
  )
}
