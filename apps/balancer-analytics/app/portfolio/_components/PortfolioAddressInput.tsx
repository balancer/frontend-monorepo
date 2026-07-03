'use client'

import {
  Box,
  Button,
  Card,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { ChangeEvent, useCallback, useState } from 'react'
import { Search } from 'react-feather'
import { useEnsResolution } from '@analytics/lib/hooks/useEnsResolution'

const EXAMPLES = [
  { label: 'Balancer Innovation fund', address: '0x284a37B375e69c8cB30a5633Ee55f3584dd26808' },
  { label: 'vitalik.eth', address: 'vitalik.eth' },
]

export function PortfolioAddressInput({ initialValue = '' }: { initialValue?: string }) {
  const router = useRouter()
  const [value, setValue] = useState(initialValue)
  const resolution = useEnsResolution(value)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (resolution.status === 'resolved' && resolution.address) {
        router.push(`/portfolio/${resolution.address.toLowerCase()}`)
      }
    },
    [resolution, router]
  )

  const handleExampleClick = useCallback(
    (example: string) => {
      setValue(example)
    },
    [setValue]
  )

  const showStatus = resolution.status !== 'idle' && value.trim().length > 0
  const isReady = resolution.status === 'resolved' && !!resolution.address

  return (
    <Card p={{ base: 'md', md: 'lg' }} variant="level1">
      <Box as="form" onSubmit={handleSubmit}>
      <VStack align="stretch" spacing="md">
        <Box>
          <Text color="font.maxContrast" fontSize="sm" fontWeight="bold" mb="xs">
            Wallet address or ENS name
          </Text>
          <HStack align="center" spacing="sm">
            <InputGroup size="md">
              <InputLeftElement pointerEvents="none">
                <Box color="font.secondary">
                  <Search size={14} />
                </Box>
              </InputLeftElement>
              <Input
                aria-label="Wallet address or ENS name"
                autoComplete="off"
                fontFamily="mono"
                fontSize="sm"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                placeholder="0x… or vitalik.eth"
                spellCheck={false}
                value={value}
              />
            </InputGroup>
            <Button
              isDisabled={!isReady}
              isLoading={resolution.status === 'loading'}
              minW="80px"
              size="md"
              type="submit"
              variant="primary"
            >
              View
            </Button>
          </HStack>
          {showStatus && <StatusLine resolution={resolution} />}
        </Box>

        <HStack flexWrap="wrap" spacing="xs">
          <Text color="font.secondary" fontSize="xs">
            Try:
          </Text>
          {EXAMPLES.map(e => (
            <Button
              fontFamily={e.address.startsWith('0x') ? 'mono' : undefined}
              fontSize="xs"
              fontWeight="medium"
              h="auto"
              key={e.address}
              onClick={() => handleExampleClick(e.address)}
              px="sm"
              py="xs"
              size="xs"
              variant="tertiary"
            >
              {e.label}
            </Button>
          ))}
        </HStack>
      </VStack>
      </Box>
    </Card>
  )
}

function StatusLine({ resolution }: { resolution: ReturnType<typeof useEnsResolution> }) {
  if (resolution.status === 'loading') {
    return (
      <Text color="font.secondary" fontSize="xs" mt="xs">
        Resolving ENS name…
      </Text>
    )
  }
  if (resolution.status === 'resolved' && resolution.address) {
    const isEns = resolution.input?.toLowerCase().endsWith('.eth')
    return (
      <Text color="green.300" fontFamily="mono" fontSize="xs" mt="xs">
        {isEns ? `Resolves to ${resolution.address}` : 'Valid address'}
      </Text>
    )
  }
  if (resolution.status === 'not_found') {
    return (
      <Text color="orange.300" fontSize="xs" mt="xs">
        No address record for that ENS name.
      </Text>
    )
  }
  if (resolution.status === 'invalid') {
    return (
      <Text color="orange.300" fontSize="xs" mt="xs">
        Enter a 0x… address or an ENS name ending in .eth.
      </Text>
    )
  }
  if (resolution.status === 'error') {
    return (
      <Text color="red.300" fontSize="xs" mt="xs">
        Resolution failed. Try again in a moment.
      </Text>
    )
  }
  return null
}
