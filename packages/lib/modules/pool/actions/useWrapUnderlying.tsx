import { useState } from 'react'
import { getDefaultWrapUnderlying } from '../pool-tokens.utils'
import { Pool } from '../pool.types'

// Used by boosted adds and removes to determine if the underlying tokens should be wrapped
export function useWrapUnderlying(pool: Pool) {
  const [wrapUnderlying, setWrapUnderlying] = useState<boolean[]>(getDefaultWrapUnderlying(pool))

  function setWrapUnderlyingByIndex(index: number, value: boolean) {
    const newWrapUnderlying = wrapUnderlying.map((v, i) => (i === index ? value : v))
    setWrapUnderlying(newWrapUnderlying)
    return newWrapUnderlying
  }

  return {
    wrapUnderlying,
    setWrapUnderlyingByIndex,
  }
}
