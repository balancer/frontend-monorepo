import { useState } from 'react'
import { Box, Button, Divider, HStack, Text, useToken, VStack } from '@chakra-ui/react'
import { Maximize2, Minimize2 } from 'react-feather'
import tinycolor from 'tinycolor2'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'

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

  const [_bgColor] = useToken('colors', ['background.level0'])
  const bgColor = tinycolor(_bgColor).setAlpha(0.4).toRgbString()

  return (
    <Box backdropFilter="blur(12px)" bg={bgColor} rounded="xl" shadow="2xl" w="320px">
      <VStack alignItems="stretch" p="0" spacing="0" w="full">
        <HStack justifyContent="space-between" p="md">
          <Text color="font.maxContrast" flex="1" fontWeight="700">
            Pool selection ({sortedPools.length})
          </Text>
          <HStack gap="ms">
            {onAddVotesClick && (
              <Button gap="0" onClick={onAddVotesClick} size="sm" variant="primary">
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

        {expanded && (
          <>
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
          </>
        )}
      </VStack>
    </Box>
  )
}
