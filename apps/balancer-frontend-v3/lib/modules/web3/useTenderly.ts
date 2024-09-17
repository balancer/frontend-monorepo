import { useBlockNumber, useGasPrice } from 'wagmi'
import { TransactionConfig } from './contracts/contract.types'
/*
  Checks the current blocknumber and gasPrice for the given chainId and provides a function to build a Tenderly simulation URL
  Used in sentry metadata to be able to simulate tx from Sentry issues in Tenderly
*/
export function useTenderly({ chainId }: { chainId: number }) {
  const { data: _blockNumber } = useBlockNumber({ chainId })
  const { data: _gasPrice } = useGasPrice({ chainId })

  function buildTenderlyUrl(txConfig?: TransactionConfig) {
    if (!txConfig) return
    const { chainId: buildCallChainId, account, to, data, value } = txConfig
    if (chainId !== buildCallChainId) {
      throw new Error(
        `Chain Id mismatch (${buildCallChainId} VS ${chainId}) when building Tenderly simulation URL`
      )
    }

    const txValue = value ? value.toString() : '0'
    const blockNumber = _blockNumber ? _blockNumber.toString() : '0'
    const gasPrice = _gasPrice ? _gasPrice.toString() : '0'

    return `https://dashboard.tenderly.co/balancer/v2/simulator/new?rawFunctionInput=${data}&block=${blockNumber}&blockIndex=0&from=${account}&gas=8000000&gasPrice=${gasPrice}&value=${txValue}&contractAddress=${to}&network=${chainId}`
  }

  return { buildTenderlyUrl }
}
