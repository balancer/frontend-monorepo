/* eslint-disable react-hooks/exhaustive-deps */
import { DependencyList, useEffect, useRef } from 'react'

export function useEffectOnce(effect: () => void) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, [])
}

export function useAsyncEffectOnce(effect: () => Promise<void>, onError?: (error: Error) => void) {
  useEffect(() => {
    effect().catch(onError || (() => null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export function useAsyncEffect(
  effect: () => Promise<void>,
  deps?: DependencyList,
  cleanup?: () => void
) {
  useEffect(() => {
    effect()

    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/**
 * Runs the effect once on mount, after the specified duration. Cleans up on unmount.
 */
export function useTimeout(effect: () => void, duration: number) {
  useEffect(() => {
    const timeout = setTimeout(effect, duration)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef<() => void>()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current()
      }
    }

    if (delay !== null) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}
