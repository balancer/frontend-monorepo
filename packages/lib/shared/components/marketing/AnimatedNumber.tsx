// components/AnimatedNumber.tsx
import { motion, useSpring, useTransform, useInView } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface AnimatedNumberProps {
  value: number
  formatValue?: (value: number) => string
}

export function AnimatedNumber({ value, formatValue }: AnimatedNumberProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: true,
    amount: 0.1,
  })

  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 })
  const display = useTransform(spring, current =>
    formatValue ? formatValue(Math.round(current)) : Math.round(current).toLocaleString()
  )

  useEffect(() => {
    if (isInView) {
      spring.set(value)
    }
  }, [spring, value, isInView])

  return (
    <motion.span className="home-stats" ref={ref}>
      {display}
    </motion.span>
  )
}
