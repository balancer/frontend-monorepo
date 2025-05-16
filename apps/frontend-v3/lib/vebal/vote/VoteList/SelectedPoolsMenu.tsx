import { useState } from 'react'
import { Box, Button, Divider, HStack, Text, VStack, useColorMode } from '@chakra-ui/react'
import { Maximize2, Minimize2 } from 'react-feather'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { motion, AnimatePresence } from 'framer-motion'

const MIN_VISIBLE_POOLS_COUNT = 0
const MAX_VISIBLE_POOLS_COUNT = 5

interface SelectedPoolsToastProps {
  onAddVotesClick?: () => void
  votingPools: { title: string; description: string }[]
}

export function SelectedPoolsMenu({ onAddVotesClick, votingPools }: SelectedPoolsToastProps) {
  const [expanded, setExpanded] = useState(false)
  const sortedPools = votingPools.toReversed()
  const visiblePools = expanded
    ? sortedPools.slice(0, MAX_VISIBLE_POOLS_COUNT)
    : sortedPools.slice(0, MIN_VISIBLE_POOLS_COUNT)

  const moreCount = sortedPools.length - visiblePools.length
  const { colorMode } = useColorMode()
  const bgBase = colorMode === 'dark' ? '#000' : '#fff'

  const handleGoToVote = () => {
    setExpanded(false)
    setTimeout(() => {
      const target = document.getElementById('my-votes')
      if (target) {
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset
        window.scrollTo({ top: targetPosition - 100, behavior: 'smooth' })
      }
    })
    onAddVotesClick?.()
  }

  return (
    <Box
      animate={{ height: expanded ? 'auto' : 'auto' }}
      as={motion.div}
      backdropFilter="blur(8px)"
      layout
      position="relative"
      rounded="xl"
      shadow="2xl"
      sx={{
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          backgroundColor: bgBase,
          opacity: 0.5,
          zIndex: -1,
          pointerEvents: 'none',
        },
      }}
      // @ts-expect-error Framer Motion handles this transition prop for layout animations
      transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
      w="320px"
    >
      <VStack alignItems="stretch" p="0" rounded="xl" shadow="2xl" spacing="0" w="full">
        <HStack justifyContent="space-between" p="md">
          <Text color="font.maxContrast" flex="1" fontWeight="700">
            Pool selection ({sortedPools.length})
          </Text>
          <HStack gap="ms">
            {onAddVotesClick && (
              <Button gap="0" onClick={handleGoToVote} size="sm" variant="primary">
                Go to vote
              </Button>
            )}
            {sortedPools.length > 1 && (
              <Box
                _hover={{ color: 'font.highlight' }}
                color="font.maxContrast"
                cursor="pointer"
                onClick={() => setExpanded(v => !v)}
                transition="color 0.3s var(--ease-out-cubic)"
              >
                {expanded ? (
                  <FadeInOnView>
                    <Minimize2 size={16} />
                  </FadeInOnView>
                ) : (
                  <FadeInOnView>
                    <Maximize2 size={16} />
                  </FadeInOnView>
                )}
              </Box>
            )}
          </HStack>
        </HStack>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              initial={{ height: 0, opacity: 0 }}
              key="expanded"
              style={{ overflow: 'hidden' }}
              transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
            >
              <Divider />
              <VStack alignItems="start" p="md" spacing="md" w="full">
                {visiblePools.map(pool => (
                  <VStack alignItems="start" key={[pool.title, pool.description].join('-')}>
                    <Text fontSize="sm">{pool.title}</Text>
                  </VStack>
                ))}
                {moreCount > 0 && (
                  <Text fontSize="sm" variant="secondary">
                    Plus {moreCount} more...
                  </Text>
                )}
              </VStack>
            </motion.div>
          )}
        </AnimatePresence>
      </VStack>
    </Box>
  )
}
