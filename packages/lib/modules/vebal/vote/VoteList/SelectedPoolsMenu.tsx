import { useState } from 'react'
import { Box, Button, Divider, HStack, Text, useToken, VStack } from '@chakra-ui/react'
import { ChevronDown } from 'react-feather'
import tinycolor from 'tinycolor2'

const MIN_VISIBLE_POOLS_COUNT = 1
const MAX_VISIBLE_POOLS_COUNT = 4

interface SelectedPoolsToastProps {
  onAddVotesClick?: () => void
  votingPools: { title: string; description: string }[]
}

export function SelectedPoolsMenu({ onAddVotesClick, votingPools }: SelectedPoolsToastProps) {
  const [expanded, setExpanded] = useState(false)
  const visiblePools = expanded
    ? votingPools.slice(0, MAX_VISIBLE_POOLS_COUNT)
    : votingPools.slice(0, MIN_VISIBLE_POOLS_COUNT)

  const moreCount = votingPools.length - visiblePools.length

  const [_bgColor] = useToken('colors', ['background.level0'])
  const bgColor = tinycolor(_bgColor).setAlpha(0.4).toRgbString()

  return (
    <Box backdropFilter="blur(36px)" bg={bgColor} rounded="xl" w="320px">
      <VStack alignItems="stretch" p="0" spacing="0" w="full">
        <HStack justifyContent="space-between" p="md">
          <Text color="font.maxContrast" flex="1" fontWeight="700">
            Pool selection ({votingPools.length})
          </Text>
          <HStack>
            {onAddVotesClick && (
              <Button onClick={onAddVotesClick} size="sm" variant="primary">
                Add votes
              </Button>
            )}
            <Box color="font.maxContrast" cursor="pointer" onClick={() => setExpanded(v => !v)}>
              <ChevronDown
                size={20}
                style={{ transition: 'all 0.2s ease-in-out' }}
                transform={expanded ? undefined : 'rotate(180)'}
              />
            </Box>
          </HStack>
        </HStack>
        <Divider />
        <VStack alignItems="start" p="md" spacing="md" w="full">
          {visiblePools.map(pool => (
            <VStack alignItems="start" key={[pool.title, pool.description].join('-')}>
              <Text fontSize="sm" fontWeight="700">
                {pool.title}
              </Text>
              <Text color="font.secondary" fontSize="sm">
                {pool.description}
              </Text>
            </VStack>
          ))}
          {moreCount > 0 && (
            <Text fontSize="sm" fontWeight="700">
              Plus {moreCount} more...
            </Text>
          )}
        </VStack>
      </VStack>
    </Box>
  )
}
