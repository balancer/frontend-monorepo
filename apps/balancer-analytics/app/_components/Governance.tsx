'use client'

import {
  Badge,
  Box,
  Card,
  Flex,
  HStack,
  Heading,
  IconButton,
  Progress,
  Skeleton,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { ExternalLink } from 'react-feather'
import { useGovernance, type GovernanceProposal } from '@analytics/lib/hooks/useGovernance'

const STATE_COLOR: Record<GovernanceProposal['state'], string> = {
  active: 'green',
  pending: 'orange',
  closed: 'gray',
}

function relativeFromNow(unixSec: number): string {
  const diff = unixSec - Math.floor(Date.now() / 1000)
  const abs = Math.abs(diff)
  const suffix = diff >= 0 ? 'in ' : ''
  const past = diff < 0 ? ' ago' : ''
  let value: string
  if (abs < 60) value = `${abs}s`
  else if (abs < 3600) value = `${Math.floor(abs / 60)}m`
  else if (abs < 86400) value = `${Math.floor(abs / 3600)}h`
  else value = `${Math.floor(abs / 86400)}d`
  return `${suffix}${value}${past}`
}

function leadingChoice(p: GovernanceProposal): { label: string; pct: number } | null {
  if (!p.scores.length || !p.choices.length) return null
  let topIdx = 0
  for (let i = 1; i < p.scores.length; i++) {
    if (p.scores[i] > p.scores[topIdx]) topIdx = i
  }
  const label = p.choices[topIdx] ?? '—'
  const pct = p.scoresTotal > 0 ? (p.scores[topIdx] / p.scoresTotal) * 100 : 0
  return { label, pct }
}

export function Governance() {
  const { items, loading, error } = useGovernance()

  return (
    <Card variant="level1">
      <Flex align="center" justify="space-between" mb="md">
        <HStack spacing="sm">
          <Heading size="h6">Governance</Heading>
          <Badge colorScheme="purple" size="sm" variant="subtle">
            balancer.eth
          </Badge>
        </HStack>
        <Text color="font.secondary" fontSize="xs">
          last 5 proposals
        </Text>
      </Flex>

      {error ? (
        <Text color="red.300" fontSize="sm">
          Failed to load: {error.message}
        </Text>
      ) : loading && items.length === 0 ? (
        <VStack align="stretch" spacing="xs">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton h="56px" key={i} />
          ))}
        </VStack>
      ) : items.length === 0 ? (
        <Text color="font.secondary" fontSize="sm">
          No recent proposals.
        </Text>
      ) : (
        <VStack align="stretch" spacing={0}>
          {items.map((p, i) => (
            <ProposalRow isLast={i === items.length - 1} key={p.id} proposal={p} />
          ))}
        </VStack>
      )}
    </Card>
  )
}

function ProposalRow({
  proposal,
  isLast,
}: {
  proposal: GovernanceProposal
  isLast: boolean
}) {
  const leader = leadingChoice(proposal)
  const timeLabel =
    proposal.state === 'active'
      ? `closes ${relativeFromNow(proposal.end)}`
      : proposal.state === 'pending'
        ? `opens ${relativeFromNow(proposal.start)}`
        : `closed ${relativeFromNow(proposal.end)}`

  return (
    <Flex
      align="flex-start"
      borderBottom={isLast ? 'none' : '1px dashed'}
      borderColor="border.subduedZen"
      gap="ms"
      py="ms"
    >
      <Box flex={1} minW={0}>
        <HStack mb="xxs" spacing="xs">
          <Badge colorScheme={STATE_COLOR[proposal.state]} size="sm" variant="subtle">
            {proposal.state}
          </Badge>
          <Text color="font.secondary" fontSize="xs">
            {timeLabel}
          </Text>
        </HStack>

        <Text
          color="font.primary"
          fontSize="sm"
          fontWeight="medium"
          lineHeight="short"
          noOfLines={2}
        >
          {proposal.title}
        </Text>

        {leader ? (
          <Box mt="xs">
            <Flex align="center" justify="space-between" mb="2px">
              <Text color="font.secondary" fontSize="2xs" noOfLines={1}>
                Leading: {leader.label}
              </Text>
              <Text color="font.secondary" fontSize="2xs" fontWeight="medium">
                {leader.pct.toFixed(1)}%
              </Text>
            </Flex>
            <Progress
              borderRadius="full"
              colorScheme={STATE_COLOR[proposal.state]}
              size="xs"
              value={leader.pct}
            />
          </Box>
        ) : null}
      </Box>

      <Tooltip label="Open on Snapshot" openDelay={250} placement="top">
        <IconButton
          _hover={{ color: 'font.maxContrast', bg: 'background.level3' }}
          aria-label="Open proposal on Snapshot"
          as="a"
          color="font.secondary"
          href={proposal.link}
          icon={<ExternalLink size={14} />}
          rel="noopener noreferrer"
          size="xs"
          target="_blank"
          variant="ghost"
        />
      </Tooltip>
    </Flex>
  )
}
