import { Address } from 'viem'
import { Pool } from '../pool/PoolProvider'

export function useHook(pool: Pool) {
  const hasHook = !!pool.hook?.address

  const hookAddress = (pool.hook?.address || '0x') as Address

  return {
    hasHook,
    hookAddress,
  }
}
