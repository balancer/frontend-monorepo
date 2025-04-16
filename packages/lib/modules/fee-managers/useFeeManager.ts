import { useFeeManagers } from './FeeManagersProvider'
import { getChainId } from '@repo/lib/config/app.config'
import { Pool } from '../pool/pool.types'

export function useFeeManager(pool: Pool) {
  const { metadata: feeManagersMetadata } = useFeeManagers()

  const hasFeeManager = !!pool.swapFeeManager
  const chainId = getChainId(pool.chain)

  const feeManager = feeManagersMetadata?.find(metadata => {
    const metadataAddresses = metadata.addresses[chainId.toString()]?.map(address =>
      address.toLowerCase()
    )
    return (
      metadataAddresses &&
      pool.swapFeeManager &&
      metadataAddresses.includes(pool.swapFeeManager.toLowerCase())
    )
  })

  return {
    hasFeeManager,
    feeManager,
  }
}
