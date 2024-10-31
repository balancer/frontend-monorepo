import { Pool } from '../pool/PoolProvider'

export function useHook(pool: Pool) {
  const hasHook = pool.hook?.address

  return {
    hasHook,
  }
}
