'use client'

import { useRef } from 'react'
import { useInView } from 'framer-motion'

interface FadeInOnViewProps {
  children: React.ReactNode
  animateOnce?: boolean
}

const FadeInOnView: React.FC<FadeInOnViewProps> = ({ children, animateOnce = true }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: animateOnce })

  return (
    <div ref={ref} className={`${isInView ? 'visible' : 'hidden'} fade-in-opacity fade-in-scale`}>
      {children}
    </div>
  )
}

export default FadeInOnView
