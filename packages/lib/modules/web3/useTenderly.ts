import { useBlockNumber, useGasPrice } from 'wagmi'
import { TransactionConfig } from './contracts/contract.types'
/*
  Checks the current blocknumber and gasPrice for the given chainId and provides a function to build a Tenderly simulation URL
  Used in sentry metadata to be able to simulate tx from Sentry issues in Tenderly
*/
export function useTenderly({ chainId }: { chainId: number }) {
  const { data: blockNumber } = useBlockNumber({ chainId })
  const { data: gasPrice } = useGasPrice({ chainId })

  const _buildTenderlyUrl = (txConfig?: TransactionConfig) =>
    buildTenderlyUrl({ txConfig, blockNumber, gasPrice })

  return { blockNumber, gasPrice, buildTenderlyUrl: _buildTenderlyUrl }
}

export function buildTenderlyUrl({
  txConfig,
  blockNumber,
  gasPrice,
}: {
  txConfig?: TransactionConfig
  blockNumber?: bigint
  gasPrice?: bigint
}): string | undefined {
  if (!txConfig) return
  const { chainId, account, to, data, value } = txConfig

  const txValue = value ? value.toString() : '0'
  const blockNumberString = blockNumber ? blockNumber.toString() : '0'
  const gasPriceString = gasPrice ? gasPrice.toString() : '0'

  return `https://dashboard.tenderly.co/balancer/v2/simulator/new?rawFunctionInput=${data}&block=${blockNumberString}&blockIndex=0&from=${account}&gas=8000000&gasPrice=${gasPriceString}&value=${txValue}&contractAddress=${to}&network=${chainId}`
}
