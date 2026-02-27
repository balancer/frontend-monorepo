import { useEffect, useState } from 'react'

const MAIN_NAVBAR_SELECTOR = '[data-main-navbar="true"]'

export function useStickyTopOffset() {
  const [stickyTopOffset, setStickyTopOffset] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let frameId: number | undefined

    const updateStickyTopOffset = () => {
      const navbar = document.querySelector<HTMLElement>(MAIN_NAVBAR_SELECTOR)

      if (!navbar) {
        setStickyTopOffset(0)
        return
      }

      const nextOffset = Math.max(0, Math.round(navbar.getBoundingClientRect().bottom))
      setStickyTopOffset(previousOffset =>
        previousOffset === nextOffset ? previousOffset : nextOffset
      )
    }

    const scheduleUpdate = () => {
      if (frameId !== undefined) return

      frameId = window.requestAnimationFrame(() => {
        frameId = undefined
        updateStickyTopOffset()
      })
    }

    scheduleUpdate()

    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    document.addEventListener('scroll', scheduleUpdate, { capture: true, passive: true })
    window.addEventListener('resize', scheduleUpdate)

    const navbar = document.querySelector<HTMLElement>(MAIN_NAVBAR_SELECTOR)
    const resizeObserver = new ResizeObserver(scheduleUpdate)

    if (navbar) {
      resizeObserver.observe(navbar)
    }

    return () => {
      if (frameId !== undefined) {
        window.cancelAnimationFrame(frameId)
      }

      resizeObserver.disconnect()
      window.removeEventListener('scroll', scheduleUpdate)
      document.removeEventListener('scroll', scheduleUpdate, true)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [])

  return stickyTopOffset
}
