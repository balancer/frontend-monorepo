import { getChainId } from '@repo/lib/config/app.config'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { Address, Hex } from 'viem'
import { useTransaction, useWaitForTransactionReceipt } from 'wagmi'
import {
  ParseReceipt,
  parseAddLiquidityReceipt,
  parseRemoveLiquidityReceipt,
  parseSwapReceipt,
  parseLstStakeReceipt,
  parseLstWithdrawReceipt,
} from './receipt-parsers'
import { ProtocolVersion } from '@repo/lib/modules/pool/pool.types'

type BaseReceiptProps = {
  txHash?: Hex
  userAddress: Address
  chain: GqlChain
  protocolVersion: ProtocolVersion
}

export type ReceiptProps = BaseReceiptProps & { parseReceipt: ParseReceipt }
export type AddLiquidityReceiptResult = ReturnType<typeof useAddLiquidityReceipt>

export function useAddLiquidityReceipt(props: BaseReceiptProps) {
  const result = useTxReceipt({ ...props, parseReceipt: parseAddLiquidityReceipt })

  const data = result.data as ReturnType<typeof parseAddLiquidityReceipt> | undefined

  return {
    ...result,
    sentTokens: data?.sentTokens || [],
    receivedBptUnits: data?.receivedBptUnits || '0',
  }
}

export type RemoveLiquidityReceiptResult = ReturnType<typeof useRemoveLiquidityReceipt>

export function useRemoveLiquidityReceipt(props: BaseReceiptProps) {
  const result = useTxReceipt({ ...props, parseReceipt: parseRemoveLiquidityReceipt })

  const data = result.data as ReturnType<typeof parseRemoveLiquidityReceipt> | undefined

  return {
    ...result,
    receivedTokens: data?.receivedTokens || [],
    sentBptUnits: data?.sentBptUnits || '0',
  }
}

export type SwapReceiptResult = ReturnType<typeof useSwapReceipt>

export function useSwapReceipt(props: BaseReceiptProps) {
  const result = useTxReceipt({ ...props, parseReceipt: parseSwapReceipt })
  const data = result.data as ReturnType<typeof parseSwapReceipt> | undefined

  return {
    ...result,
    sentToken: data?.sentToken,
    receivedToken: data?.receivedToken,
  }
}

export type LstStakeReceiptResult = ReturnType<typeof useLstStakeReceipt>

export function useLstStakeReceipt(props: BaseReceiptProps) {
  const result = useTxReceipt({ ...props, parseReceipt: parseLstStakeReceipt })
  const data = result.data as ReturnType<typeof parseLstStakeReceipt> | undefined

  return {
    ...result,
    receivedToken: data?.receivedToken,
  }
}
export type LstWithdrawReceiptResult = ReturnType<typeof useLstWithdrawReceipt>

export function useLstWithdrawReceipt(props: BaseReceiptProps) {
  const result = useTxReceipt({ ...props, parseReceipt: parseLstWithdrawReceipt })
  const data = result.data as ReturnType<typeof parseLstWithdrawReceipt> | undefined

  return {
    ...result,
    receivedToken: data?.receivedToken,
  }
}

function useTxReceipt({ txHash, chain, userAddress, parseReceipt, protocolVersion }: ReceiptProps) {
  const { getToken, isLoadingTokenPrices } = useTokens()
  const chainId = getChainId(chain)
  // These queries will be cached if we are in the context of a transaction flow
  // or will be fetched if the user is visiting an historic transaction receipt
  const receiptQuery = useWaitForTransactionReceipt({
    chainId,
    hash: txHash,
  })
  const transactionQuery = useTransaction({
    chainId,
    hash: txHash,
    query: {
      enabled: !!txHash,
    },
  })

  const receiptLogs = receiptQuery.data?.logs || []
  const txValue = transactionQuery.data?.value || 0n

  const isLoading = isLoadingTokenPrices || receiptQuery.isLoading || transactionQuery.isLoading
  const error = receiptQuery.error || transactionQuery.error

  const data =
    !isLoading && !error
      ? parseReceipt({
          chain,
          receiptLogs,
          userAddress,
          txValue,
          getToken,
          protocolVersion,
        })
      : undefined

  return {
    isLoading,
    error,
    data,
  }
}
