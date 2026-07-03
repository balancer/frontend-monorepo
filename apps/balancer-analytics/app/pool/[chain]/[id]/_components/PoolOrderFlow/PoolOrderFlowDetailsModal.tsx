'use client'

import { CopyIcon } from '@chakra-ui/icons'
import {
  HStack,
  IconButton,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Tooltip,
  VStack,
  useClipboard,
  useToast,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { getBlockExplorerAddressUrl } from '@repo/lib/shared/utils/blockExplorer'
import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import type { GqlChainValues } from '@repo/lib/config/networks'
import type { SankeyGraph } from './buildSankeyGraph'
import {
  formatCategory,
  formatPct,
  formatSourceId,
  formatUsdCompact,
  formatUsdFull,
  shortenAddress,
} from './format'
import type { TokenMap } from './PoolOrderFlowSankey'
import type { LabeledSwap } from './types'

/** ECharts emits a `name` for nodes and a `data.source`/`data.target` for
 *  edges. We normalize to a discriminated union the drawer can switch on. */
export type SankeySelection =
  | { kind: 'node'; nodeName: string }
  | { kind: 'edge'; source: string; target: string }

type Props = {
  selection: SankeySelection | null
  graph: SankeyGraph
  swaps: readonly LabeledSwap[]
  tokenMap: TokenMap
  periodVolumeUsd: number
  chain: GqlChainValues
  onClose: () => void
}

const MAX_CONTRIBUTORS = 25

type Contributor = {
  address: string
  valueUsd: number
  swapCount: number
  /** Most recent swap's tx hash — a representative for the "view on explorer" link. */
  exampleTxHash: string
}

/** Map a chart node `name` to a predicate against raw swap data, accounting
 *  for the unknown-split / Other-rollup decisions made by the builder. */
function predicateFor(
  nodeName: string,
  graph: SankeyGraph
): ((s: LabeledSwap) => boolean) | null {
  if (nodeName.startsWith('src:')) {
    const id = nodeName.slice(4)
    if (id.startsWith('unknown:')) {
      // Specific split-out unknown sender
      const addr = id.slice('unknown:'.length)
      return s => s.source.category === 'unknown' && s.sender.toLowerCase() === addr
    }
    if (id === 'unknown') {
      // Generic Unknown bucket — unknowns whose sender did NOT cross the split threshold
      return s =>
        s.source.category === 'unknown' &&
        !graph.splitUnknownSenders.has(s.sender.toLowerCase())
    }
    if (id === 'other') {
      // Synthetic Other rollup: labeled sources that fell under the share threshold
      return s => graph.rolledUpSourceIds.has(s.source.id)
    }
    // Labeled source id (e.g. '1inch', 'mev_bot', 'balancer'): match the raw id
    // BUT exclude rolled-up entries (they live under 'other').
    return s => s.source.id === id && !graph.rolledUpSourceIds.has(s.source.id)
  }
  if (nodeName.startsWith('tin:')) {
    const addr = nodeName.slice('tin:'.length)
    return s => s.tokenIn.address.toLowerCase() === addr
  }
  if (nodeName.startsWith('tout:')) {
    const addr = nodeName.slice('tout:'.length)
    return s => s.tokenOut.address.toLowerCase() === addr
  }
  return null
}

function predicateForEdge(
  source: string,
  target: string,
  graph: SankeyGraph
): ((s: LabeledSwap) => boolean) | null {
  const srcPred = predicateFor(source, graph)
  const tgtPred = predicateFor(target, graph)
  if (!srcPred || !tgtPred) return null
  return s => srcPred(s) && tgtPred(s)
}

function aggregateBySender(swaps: readonly LabeledSwap[]): Contributor[] {
  const m = new Map<string, Contributor>()
  for (const s of swaps) {
    const addr = s.sender.toLowerCase()
    const row = m.get(addr) ?? { address: addr, valueUsd: 0, swapCount: 0, exampleTxHash: s.tx }
    row.valueUsd += s.valueUSD
    row.swapCount += 1
    // Track the highest-USD swap as the representative tx for the explorer link.
    if (s.valueUSD > 0 && (row.exampleTxHash === s.tx || s.valueUSD >= row.valueUsd / row.swapCount)) {
      row.exampleTxHash = s.tx
    }
    m.set(addr, row)
  }
  return [...m.values()].sort((a, b) => b.valueUsd - a.valueUsd)
}

function describeSelection(
  sel: SankeySelection,
  graph: SankeyGraph,
  tokenMap: TokenMap
): { title: string; subtitle: string } {
  const decode = (name: string): string => {
    if (name.startsWith('src:')) return formatSourceId(name.slice(4))
    if (name.startsWith('tin:')) {
      const addr = name.slice(4)
      return tokenMap[addr]?.symbol ?? shortenAddress(addr)
    }
    if (name.startsWith('tout:')) {
      const addr = name.slice(5)
      return tokenMap[addr]?.symbol ?? shortenAddress(addr)
    }
    return name
  }
  if (sel.kind === 'node') {
    const node = graph.nodes.find(n => n.name === sel.nodeName)
    const title = decode(sel.nodeName)
    const subtitle = node
      ? node.kind === 'source' && node.source
        ? formatCategory(node.source.category)
        : node.kind === 'tokenIn'
          ? 'Token in'
          : 'Token out'
      : ''
    return { title, subtitle }
  }
  return {
    title: `${decode(sel.source)} → ${decode(sel.target)}`,
    subtitle: 'Flow',
  }
}

export function PoolOrderFlowDetailsModal({
  selection,
  graph,
  swaps,
  tokenMap,
  periodVolumeUsd,
  chain,
  onClose,
}: Props) {
  const isOpen = selection !== null

  // Compute contributing swaps + aggregate by sender. Empty when no selection.
  const { contributors, matchedSwaps } = useMemo(() => {
    if (!selection) return { contributors: [] as Contributor[], matchedSwaps: [] as LabeledSwap[] }
    const pred =
      selection.kind === 'node'
        ? predicateFor(selection.nodeName, graph)
        : predicateForEdge(selection.source, selection.target, graph)
    if (!pred) return { contributors: [], matchedSwaps: [] }
    const matched = swaps.filter(pred)
    return { contributors: aggregateBySender(matched), matchedSwaps: matched }
  }, [selection, graph, swaps])

  const totalUsd = matchedSwaps.reduce((a, s) => a + s.valueUSD, 0)
  const periodPct = periodVolumeUsd > 0 ? totalUsd / periodVolumeUsd : 0

  const header = selection
    ? describeSelection(selection, graph, tokenMap)
    : { title: '', subtitle: '' }

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      size={{ base: 'sm', md: 'lg' }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>
          <VStack align="flex-start" spacing="xs">
            <Text fontSize="lg" fontWeight="bold">
              {header.title}
            </Text>
            <Text color="font.secondary" fontSize="xs">
              {header.subtitle}
              {' · '}
              {formatUsdCompact(totalUsd)} ({formatPct(periodPct)} of period)
              {' · '}
              {matchedSwaps.length.toLocaleString()} swap
              {matchedSwaps.length === 1 ? '' : 's'}
            </Text>
          </VStack>
        </ModalHeader>
        <ModalBody pb={6}>
          {contributors.length === 0 ? (
            <Text color="font.secondary" fontSize="sm">
              No contributing swaps in scope. (This usually means the
              selection straddles two columns that don&apos;t share any
              flow — e.g. the link between a source and a token that
              swapped only the other direction.)
            </Text>
          ) : (
            <VStack align="stretch" spacing={2}>
              <Text color="font.secondary" fontSize="xs">
                Top {Math.min(contributors.length, MAX_CONTRIBUTORS)} of{' '}
                {contributors.length} contributing sender
                {contributors.length === 1 ? '' : 's'} (by USD):
              </Text>
              {contributors.slice(0, MAX_CONTRIBUTORS).map(c => (
                <ContributorRow
                  chain={chain}
                  contributor={c}
                  key={c.address}
                  totalUsd={totalUsd}
                />
              ))}
              {contributors.length > MAX_CONTRIBUTORS && (
                <Text color="font.secondary" fontSize="xs" pt="sm">
                  +{contributors.length - MAX_CONTRIBUTORS} more (long tail)
                </Text>
              )}
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

function ContributorRow({
  chain,
  contributor,
  totalUsd,
}: {
  chain: GqlChainValues
  contributor: Contributor
  totalUsd: number
}) {
  const { onCopy } = useClipboard(contributor.address)
  const toast = useToast()
  const pct = totalUsd > 0 ? contributor.valueUsd / totalUsd : 0
  const explorerUrl = getBlockExplorerAddressUrl(contributor.address, chain as GqlChain)

  return (
    <HStack
      align="center"
      borderColor="border.base"
      borderRadius="md"
      borderWidth="1px"
      justify="space-between"
      p={2}
      spacing={3}
    >
      <VStack align="flex-start" flex="1" minW={0} spacing={0}>
        <Link
          fontFamily="ui-monospace, SFMono-Regular, monospace"
          fontSize="xs"
          href={explorerUrl}
          isExternal
        >
          {shortenAddress(contributor.address)}
        </Link>
        <Text color="font.secondary" fontSize="2xs">
          {formatUsdFull(contributor.valueUsd)} ({formatPct(pct)}) ·{' '}
          {contributor.swapCount.toLocaleString()} swap
          {contributor.swapCount === 1 ? '' : 's'}
        </Text>
      </VStack>
      <Tooltip label="Copy full address">
        <IconButton
          aria-label="Copy address"
          icon={<CopyIcon />}
          onClick={() => {
            onCopy()
            toast({
              title: 'Address copied',
              description: contributor.address,
              status: 'success',
              duration: 2500,
              isClosable: true,
              position: 'bottom-right',
            })
          }}
          size="sm"
          variant="ghost"
        />
      </Tooltip>
    </HStack>
  )
}
