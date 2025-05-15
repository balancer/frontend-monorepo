'use client'

import { PropsWithChildren, useRef } from 'react'
import { useInView } from 'framer-motion'

interface FadeInOnViewProps extends PropsWithChildren {
  animateOnce?: boolean
  scaleUp?: boolean
}

function FadeInOnView({ children, animateOnce = true, scaleUp = true }: FadeInOnViewProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: animateOnce })

  const animationClasses = `fade-in-opacity ${scaleUp ? 'fade-in-scale' : ''}`.trim()

  return (
    <div className={`${isInView ? 'visible' : 'hidden'} ${animationClasses}`} ref={ref}>
      {children}
    </div>
  )
}

export default FadeInOnView
