'use client'

import { PropsWithChildren, useRef } from 'react'
import { useInView } from 'framer-motion'

interface FadeInOnViewProps extends PropsWithChildren {
  animateOnce?: boolean
}

function FadeInOnView({ children, animateOnce = true }: FadeInOnViewProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: animateOnce })

  return (
    <div className={`${isInView ? 'visible' : 'hidden'} fade-in-opacity fade-in-scale`} ref={ref}>
      {children}
    </div>
  )
}

export default FadeInOnView
