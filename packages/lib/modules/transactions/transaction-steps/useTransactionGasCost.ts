import { useMemo } from 'react'
import { Address, formatUnits, parseUnits } from 'viem'
import { getGqlChain, getNetworkConfig } from '@repo/lib/config/app.config'
import { useGasPriceQuery } from '@repo/lib/shared/hooks/useGasPrice'
import { ManagedResult } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'

export function useTransactionGasCost(transaction?: ManagedResult) {
  const chain = transaction ? getGqlChain(transaction.chainId) : undefined

  const { gasPrice } = useGasPriceQuery(chain!)
  const { toCurrency } = useCurrency()
  const { usdValueForTokenAddress } = useTokens()

  const estimatedGas = useMemo(() => {
    return (transaction?.simulation?.data as bigint) || 0n
  }, [transaction?.simulation?.data])

  const totalGasCost = useMemo(() => {
    if (!transaction || !estimatedGas || estimatedGas === 0n || !gasPrice) return

    const networkConfig = chain ? getNetworkConfig(chain) : undefined
    const cost = parseUnits(gasPrice, 9) * estimatedGas
    const formattedCost = formatUnits(cost, 18)
    const costUsd =
      chain &&
      usdValueForTokenAddress(
        networkConfig?.tokens?.nativeAsset?.address as Address,
        chain,
        formattedCost
      )

    return {
      cost: cost.toString(),
      formatted: formattedCost,
      symbol: networkConfig?.tokens?.nativeAsset?.symbol || 'ETH',
      estimatedGas: estimatedGas.toString(),
      gasPrice,
      costUsd: costUsd ? toCurrency(costUsd) : undefined,
    }
  }, [transaction, estimatedGas, gasPrice, chain])

  return totalGasCost
}
