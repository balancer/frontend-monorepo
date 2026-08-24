'use client'

import { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'

interface FadeInOnViewProps extends PropsWithChildren {
  animateOnce?: boolean
  scaleUp?: boolean
}

function getHashId() {
  if (typeof window === 'undefined') return ''
  return window.location.hash.slice(1)
}

function containsHashTarget(container: HTMLElement | null, hashId: string) {
  if (!container || !hashId) return false
  if (container.id === hashId) return true
  return Boolean(container.querySelector(`#${CSS.escape(hashId)}`))
}

function FadeInOnView({ children, animateOnce = true, scaleUp = true }: FadeInOnViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: animateOnce })
  const [forceVisible, setForceVisible] = useState(false)

  useEffect(() => {
    const syncHashVisibility = () => {
      const hashId = getHashId()
      if (!containsHashTarget(ref.current, hashId)) return

      setForceVisible(true)

      // Wait a frame so forced visibility can paint, then scroll to the target.
      requestAnimationFrame(() => {
        document.getElementById(hashId)?.scrollIntoView()
      })
    }

    syncHashVisibility()
    window.addEventListener('hashchange', syncHashVisibility)
    return () => window.removeEventListener('hashchange', syncHashVisibility)
  }, [])

  const animationClasses = `fade-in-opacity ${scaleUp ? 'fade-in-scale' : ''}`.trim()
  const isVisible = forceVisible || isInView

  return (
    <div className={`${isVisible ? 'visible' : 'hidden'} ${animationClasses}`} ref={ref}>
      {children}
    </div>
  )
}

export default FadeInOnView
