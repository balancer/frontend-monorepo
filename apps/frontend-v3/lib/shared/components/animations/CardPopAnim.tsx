import { motion } from 'framer-motion'
import { PropsWithChildren } from 'react'

export function CardPopAnim({ children, ...rest }: PropsWithChildren) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%' }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
