import { useEffect, useRef } from 'react'
import {
  motion,
  animate,
  useMotionValue,
  useTransform,
  AnimationPlaybackControls,
} from 'framer-motion'
import { fNumCustom } from '../../utils/numbers'

type AnimatedNumberProps = {
  value: number
  formatOptions: string
}

export function AnimatedNumber({ value, formatOptions }: AnimatedNumberProps) {
  const motionValue = useMotionValue(value)
  const isInitialRenderRef = useRef(true)
  const controlsRef = useRef<AnimationPlaybackControls | null>(null)

  const formattedValue = useTransform(motionValue, latest => {
    const num = Number.isFinite(latest) ? latest : 0
    return fNumCustom(num, formatOptions)
  })

  useEffect(() => {
    if (isInitialRenderRef.current) {
      motionValue.set(value * 0.75)
      isInitialRenderRef.current = false
    }

    controlsRef.current = animate(motionValue, value, {
      duration: 1.5,
      ease: 'easeOut',
    })

    return () => controlsRef.current?.stop()
  }, [value, motionValue])

  return <motion.span>{formattedValue}</motion.span>
}
