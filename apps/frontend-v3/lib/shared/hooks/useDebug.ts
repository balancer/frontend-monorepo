/* eslint-disable react-hooks/exhaustive-deps */
import { DependencyList, EffectCallback, useEffect } from 'react'

/*
  This hook works exactly like useEffect but it clearly states that it is being used for debugging purposes and should be deleted when the debug finishes
*/
export function useDebug(effectCallback: EffectCallback, deps: DependencyList) {
  return useEffect(effectCallback, deps)
}
