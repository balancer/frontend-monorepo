import { circOut } from 'framer-motion'

export const staggeredFadeIn = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
      ease: circOut,
      duration: 1,
    },
  },
}

export const staggeredFadeInUp = {
  hidden: { opacity: 0, y: 4 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.02,
      ease: circOut,
      duration: 0.5,
      delay: 0.1,
    },
  },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
}

export const fadeInUp = {
  hidden: { opacity: 0, y: 200, x: 20 },
  show: {
    opacity: 1,
    y: 40,
    x: 0,
    transition: {
      ease: circOut,
      duration: 1,
    },
  },
}

export const pulseOnceWithDelay = {
  opacity: [1, 0, 1],
  transition: {
    delay: 0.75,
    duration: 1,
  },
}
