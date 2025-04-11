import { Text, Tag, TagLabel, TagCloseButton } from '@chakra-ui/react'
import { motion } from 'framer-motion'

export function AnimatedTag({ label, onClose }: { label: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 0 }}
      initial={{ opacity: 0, y: 40 }}
      transition={{
        enter: { ease: 'easeOut', duration: 0.15, delay: 0.05 },
        exit: { ease: 'easeIn', duration: 0.05, delay: 0 },
      }}
    >
      <Tag size="lg">
        <TagLabel>
          <Text fontSize="sm" fontWeight="bold">
            {label}
          </Text>
        </TagLabel>
        <TagCloseButton onClick={onClose} />
      </Tag>
    </motion.div>
  )
}
