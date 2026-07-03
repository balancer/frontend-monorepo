'use client'

import {
  Badge,
  Box,
  Card,
  Flex,
  HStack,
  Heading,
  IconButton,
  Skeleton,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { ExternalLink, MessageSquare, Users } from 'react-feather'
import { useGovernance, type GovernanceProposal } from '@analytics/lib/hooks/useGovernance'

const STATE_COLOR: Record<GovernanceProposal['state'], string> = {
  active: 'green',
  pending: 'orange',
  closed: 'gray',
}

/** Color palette for the per-choice bars. Mirrors the per-state accent —
 *  greens for For / Yes, reds for Against / No, neutral for everything
 *  else so legitimate multi-choice proposals still get distinct bars. */
const NEUTRAL_BAR = 'gray.400'
const POSITIVE_BAR = 'green.300'
const NEGATIVE_BAR = 'red.300'
const ABSTAIN_BAR = 'orange.300'

const POSITIVE_RX = /^\s*(for|yes|approve|in\s*favor)\b/i
const NEGATIVE_RX = /^\s*(against|no|reject)\b/i
const ABSTAIN_RX = /^\s*abstain\b/i

function choiceColor(label: string): string {
  if (POSITIVE_RX.test(label)) return POSITIVE_BAR
  if (NEGATIVE_RX.test(label)) return NEGATIVE_BAR
  if (ABSTAIN_RX.test(label)) return ABSTAIN_BAR
  return NEUTRAL_BAR
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

const intFmt = new Intl.NumberFormat('en-US')
const compactFmt = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

type GovernanceProps = {
  /** Optional override for the card heading — defaults to "Governance".
   *  The dedicated `/governance` page passes a less generic label. */
  title?: string
  /** Optional override for the "last N proposals" hint shown top-right. */
  subtitle?: string
}

export function Governance({
  title = 'Governance',
  subtitle = 'last 10 proposals',
}: GovernanceProps = {}) {
  const { items, loading, error } = useGovernance()

  return (
    <Card variant="level1">
      <Flex align="center" justify="space-between" mb="md">
        <HStack spacing="sm">
          <Heading size="h5">{title}</Heading>
          <Badge colorScheme="purple" size="sm" variant="subtle">
            balancer.eth
          </Badge>
        </HStack>
        <Text color="font.secondary" fontSize="sm">
          {subtitle}
        </Text>
      </Flex>

      {error ? (
        <Text color="red.300" fontSize="sm">
          Failed to load: {error.message}
        </Text>
      ) : loading && items.length === 0 ? (
        <VStack align="stretch" spacing="xs">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton h="80px" key={i} />
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
  const timeLabel =
    proposal.state === 'active'
      ? `closes ${relativeFromNow(proposal.end)}`
      : proposal.state === 'pending'
        ? `opens ${relativeFromNow(proposal.start)}`
        : `closed ${relativeFromNow(proposal.end)}`

  // Strip a leading "BIP-XXX:" / "[BIP-XXX]" prefix from the title since
  // the badge already carries that information. Keeps the headline line
  // free for the actual proposal description.
  const titleWithoutBip = proposal.bipNumber
    ? proposal.title.replace(/^\s*\[?BIP[\s-]*0*\d+\]?\s*[:\-—]?\s*/i, '')
    : proposal.title

  // Quorum is meaningful only when the space defined one AND when the
  // proposal has actual votes (so the ratio isn't 0/0). Closed proposals
  // surface the final quorum hit/miss; active ones surface progress.
  const showQuorum = proposal.quorum > 0
  const quorumPct = showQuorum ? (proposal.scoresTotal / proposal.quorum) * 100 : 0
  const quorumMet = quorumPct >= 100

  return (
    <Flex
      align="flex-start"
      borderBottom={isLast ? 'none' : '1px dashed'}
      borderColor="border.subduedZen"
      gap="ms"
      py="md"
    >
      <Box flex={1} minW={0}>
        <HStack flexWrap="wrap" mb="xs" rowGap="2xs" spacing="xs">
          <Badge colorScheme={STATE_COLOR[proposal.state]} size="sm" variant="subtle">
            {proposal.state}
          </Badge>
          {proposal.bipNumber !== null && (
            <Badge colorScheme="purple" size="sm" variant="outline">
              BIP-{proposal.bipNumber}
            </Badge>
          )}
          <Text color="font.secondary" fontSize="xs">
            {timeLabel}
          </Text>
          <Tooltip
            hasArrow
            label={`${intFmt.format(proposal.votesCount)} unique voters`}
            openDelay={250}
          >
            <HStack color="font.secondary" cursor="help" fontSize="xs" spacing="2xs">
              <Users size={12} />
              <Text>{compactFmt.format(proposal.votesCount)}</Text>
            </HStack>
          </Tooltip>
          {showQuorum && proposal.state !== 'pending' && (
            <Tooltip
              hasArrow
              label={`${compactFmt.format(proposal.scoresTotal)} / ${compactFmt.format(proposal.quorum)} veBAL — ${quorumMet ? 'quorum met' : 'below quorum'}`}
              openDelay={250}
            >
              <Badge
                colorScheme={quorumMet ? 'green' : proposal.state === 'active' ? 'orange' : 'red'}
                cursor="help"
                fontSize="xs"
                variant="subtle"
              >
                quorum {quorumPct >= 100 ? '✓' : `${quorumPct.toFixed(0)}%`}
              </Badge>
            </Tooltip>
          )}
        </HStack>

        <Text
          color="font.maxContrast"
          fontSize="md"
          fontWeight="medium"
          lineHeight="short"
          noOfLines={2}
        >
          {titleWithoutBip}
        </Text>

        <ChoiceBars proposal={proposal} />
      </Box>

      <VStack align="flex-end" spacing="xs">
        <Tooltip label="Open on Snapshot" openDelay={250} placement="top">
          <IconButton
            _hover={{ color: 'font.maxContrast', bg: 'background.level3' }}
            aria-label="Open proposal on Snapshot"
            as="a"
            color="font.secondary"
            href={proposal.link}
            icon={<ExternalLink size={16} />}
            rel="noopener noreferrer"
            size="sm"
            target="_blank"
            variant="ghost"
          />
        </Tooltip>
        {proposal.discussion && (
          <Tooltip label="Open forum discussion" openDelay={250} placement="top">
            <IconButton
              _hover={{ color: 'font.maxContrast', bg: 'background.level3' }}
              aria-label="Open discussion thread"
              as="a"
              color="font.secondary"
              href={proposal.discussion}
              icon={<MessageSquare size={16} />}
              rel="noopener noreferrer"
              size="sm"
              target="_blank"
              variant="ghost"
            />
          </Tooltip>
        )}
      </VStack>
    </Flex>
  )
}

/**
 * Per-choice mini bars — replaces the old "leading choice only" layout so
 * close races (For 51% / Against 49%) read at a glance. Choices are
 * sorted by score descending and capped at three rows so a 5-option
 * proposal stays compact; the rest collapse into a "+N more" footer.
 */
function ChoiceBars({ proposal }: { proposal: GovernanceProposal }) {
  if (!proposal.choices.length || !proposal.scores.length) return null
  const total = proposal.scoresTotal
  if (total <= 0) {
    return (
      <Text color="font.secondary" fontSize="xs" mt="sm">
        No votes yet.
      </Text>
    )
  }

  const ranked = proposal.choices
    .map((label, i) => ({ label, score: proposal.scores[i] ?? 0 }))
    .sort((a, b) => b.score - a.score)
  const shown = ranked.slice(0, 3)
  const hidden = ranked.length - shown.length

  return (
    <VStack align="stretch" mt="sm" spacing="xs">
      {shown.map(({ label, score }) => {
        const pct = (score / total) * 100
        const color = choiceColor(label)
        return (
          <Box key={label}>
            <Flex align="center" justify="space-between" mb="2xs">
              <Text color="font.secondary" fontSize="xs" noOfLines={1}>
                {label}
              </Text>
              <Text color="font.secondary" fontSize="xs" fontWeight="medium">
                {pct.toFixed(1)}%
              </Text>
            </Flex>
            <Box bg="background.level0" borderRadius="full" h="6px" overflow="hidden">
              <Box
                bg={color}
                borderRadius="full"
                h="100%"
                transition="width 0.2s"
                w={`${pct}%`}
              />
            </Box>
          </Box>
        )
      })}
      {hidden > 0 && (
        <Text color="font.secondary" fontSize="xs" opacity={0.7}>
          +{hidden} more choice{hidden === 1 ? '' : 's'}
        </Text>
      )}
    </VStack>
  )
}
