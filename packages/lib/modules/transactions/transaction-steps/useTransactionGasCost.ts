import { Address, formatUnits } from 'viem'
import { getGqlChain, getNetworkConfig } from '@repo/lib/config/app.config'
import { useGasPriceQuery } from '@repo/lib/shared/hooks/useGasPrice'
import { ManagedResult } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export function useTransactionGasCost(transaction?: ManagedResult) {
  const chain = transaction ? getGqlChain(transaction.chainId) : PROJECT_CONFIG.defaultNetwork

  const { data: gasPrice } = useGasPriceQuery(chain)
  const { toCurrency } = useCurrency()
  const { usdValueForTokenAddress } = useTokens()

  let actualGasData = null

  if (transaction?.result?.data?.gasUsed && transaction?.result?.data?.effectiveGasPrice) {
    const gasUsed = transaction.result.data.gasUsed
    const effectiveGasPrice = transaction.result.data.effectiveGasPrice
    const l1Fee = (transaction.result.data as any).l1Fee || 0n // cast as any because l1Fee is not available on all chains

    const networkConfig = chain ? getNetworkConfig(chain) : undefined
    const totalGasCost = gasUsed * effectiveGasPrice + l1Fee
    const formattedCost = formatUnits(totalGasCost, 18)

    const costUsd =
      chain &&
      usdValueForTokenAddress(
        networkConfig?.tokens?.nativeAsset?.address as Address,
        chain,
        formattedCost
      )

    actualGasData = {
      cost: totalGasCost.toString(),
      formatted: formattedCost,
      symbol: networkConfig?.tokens?.nativeAsset?.symbol || 'ETH',
      gasUsed: gasUsed.toString(),
      gasPrice: effectiveGasPrice.toString(),
      l1Fee: l1Fee.toString(),
      costUsd: costUsd ? toCurrency(costUsd) : undefined,
      isActual: true,
    }
  }

  const data = transaction?.simulation?.data
  const estimatedGas = typeof data === 'bigint' ? data : 0n

  let estimatedGasCost = undefined

  if (transaction && estimatedGas && estimatedGas !== 0n && gasPrice) {
    const networkConfig = chain ? getNetworkConfig(chain) : undefined
    const cost = gasPrice * estimatedGas
    const formattedCost = formatUnits(cost, 18)

    const costUsd =
      chain &&
      usdValueForTokenAddress(
        networkConfig?.tokens?.nativeAsset?.address as Address,
        chain,
        formattedCost
      )

    estimatedGasCost = {
      cost: cost.toString(),
      formatted: formattedCost,
      symbol: networkConfig?.tokens?.nativeAsset?.symbol || 'ETH',
      estimatedGas: estimatedGas.toString(),
      gasPrice,
      costUsd: costUsd ? toCurrency(costUsd) : undefined,
      isActual: false,
    }
  }

  const totalGasCost = actualGasData || estimatedGasCost

  return totalGasCost
}
