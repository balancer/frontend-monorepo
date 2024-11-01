import { Address } from 'viem'
import { Pool } from '../pool/PoolProvider'
import { useHooks } from './HooksProvider'
import { getChainId } from '@repo/lib/config/app.config'
import { useEffect } from 'react'

export function useHook(pool: Pool) {
  const { metadata } = useHooks()
  const hasHook = !!pool.hook?.address

  const hookAddress = (pool.hook?.address || '0x') as Address

  const hook = metadata?.find(
    metadata => metadata.addresses[getChainId(pool.chain).toString()] === hookAddress
  )

  const hasHookData = !!hook

  useEffect(() => {
    console.log('hook', hook, hasHookData)
  }, [hasHookData, hook])

  return {
    hasHook,
    hookAddress,
    hasHookData,
    hook,
  }
}
