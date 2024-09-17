// Helpers for wagmi transactions
import { Address } from 'viem'
import { TransactionBundle } from './contract.types'
import { polygon } from 'viem/chains'
import { secs } from '@/lib/shared/utils/time'

export function getHashFromTransaction(transactionBundle?: TransactionBundle): Address | undefined {
  if (!transactionBundle) return
  if (transactionBundle.execution) return transactionBundle.execution.data
}

export const noUserAddress = '0xNoUser' // We use this value to avoid TS inference problems in wagmi hooks
export const nullAddress = '0xNull'
export const emptyAddress = '' as Address

export function isValidUserAddress(userAddress?: Address) {
  if (!userAddress) return false
  if (userAddress === noUserAddress) return false
  return true
}

/*
  Returns timeout to be used in useWaitForTransactionReceipt options
  By default all react queries retry 3 times
  More info: https://tanstack.com/query/v5/docs/framework/react/guides/query-retries
 */
export function getWaitForReceiptTimeout(chainId: number) {
  // In polygon there will be 3 retries of 25 seconds until we throw the timeout error
  if (chainId === polygon.id) return secs(25).toMs()

  // In other chains there will be 3 retries of 15 seconds until we throw the timeout error
  return secs(15).toMs()
}
