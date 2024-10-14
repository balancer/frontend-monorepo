// Helpers for wagmi transactions
import { Address } from 'viem'
import { TransactionBundle } from './contract.types'

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
/* eslint-disable @typescript-eslint/no-unused-vars */
export function getWaitForReceiptTimeout(chainId: number) {
  /* Using an specific timeout was throwing a timeout error after confirmation
     Wagmi bug: https://github.com/wevm/viem/discussions/1351
     Using undefined seems to be more reliable
  */
  return undefined
}
