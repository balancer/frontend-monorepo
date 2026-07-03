'use client'

import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Flex,
  HStack,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import Link from 'next/link'
import { AlertTriangle, ArrowUpRight, CheckCircle, HelpCircle } from 'react-feather'
import type {
  BufferState,
  GyroEclpTypeState,
  LbpTypeState,
  QuantAmmTypeState,
  ReclammTypeState,
  StableSurgeState,
  StableTypeState,
  WeightedTypeState,
} from '@analytics/lib/pool-state/read'
import type { PoolDetailToken, PoolPageData, PriceRateProviderData } from '../page'
import { getBlockExplorerAddressUrl } from '@analytics/lib/networks/chain-info'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

const ZERO_ADDR = '0x0000000000000000000000000000000000000000'

function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function AddressLink({
  address,
  chain,
  zeroLabel = 'Balancer DAO',
  zeroHint = 'Controlled by the Authorizer (Omni governance)',
}: {
  address: string | null
  chain: string
  /** Label shown when `address` is `0x000…000`. Manager roles delegate
   *  to the DAO Authorizer at the zero address, not "no one"; factories
   *  override this to `"—"` since address(0) there really means missing. */
  zeroLabel?: string
  zeroHint?: string
}): React.JSX.Element {
  if (!address || address.toLowerCase() === ZERO_ADDR) {
    return (
      <Text color="font.secondary" fontSize="sm" title={zeroHint}>
        {zeroLabel}
      </Text>
    )
  }
  // `chain` reaches here as the raw `GqlChain` string from `poolDetail.chain`.
  // Cast back at the call to the shared helper — `getBlockExplorerAddressUrl`
  // tolerates unknown chains by falling through to its mainnet fallback,
  // so an unsupported chain still produces a working (if mainnet-flavoured)
  // link rather than a dead one.
  const href = getBlockExplorerAddressUrl(address, chain as GqlChain)
  const label = shortAddr(address)
  return (
    <Link href={href} rel="noreferrer" target="_blank">
      <Flex
        _hover={{ color: 'font.linkHover' }}
        align="center"
        color="font.link"
        fontFamily="mono"
        fontSize="sm"
        gap="2xs"
        transition="color 0.15s"
      >
        {label}
        <ArrowUpRight size={12} />
      </Flex>
    </Link>
  )
}

// V3 percentages are stored as `1e18`-scaled fixed-point. Divide and format
// as a percentage with up to 4 decimal places (covers down to 0.01 bp).
function formatPercent(value: string | null): string {
  if (value === null) return '—'
  const n = Number(value) / 1e18
  if (!Number.isFinite(n)) return '—'
  return `${(n * 100).toFixed(4).replace(/\.?0+$/, '')}%`
}

function formatAmp(value: string, precision: string): string {
  const v = Number(value)
  const p = Number(precision) || 1
  if (!Number.isFinite(v) || !Number.isFinite(p)) return value
  return (v / p).toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function formatTimestamp(unix: number): string {
  if (!unix) return '—'
  return new Date(unix * 1000).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// 1e18-scaled fixed-point → plain decimal (e.g. ECLP alpha, price ratio).
function formatScaled(value: string, maxFrac = 4): string {
  const n = Number(value) / 1e18
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString(undefined, { maximumFractionDigits: maxFrac })
}

// 1e18-scaled weight → percentage with 2 decimals (e.g. "64.64%").
function formatWeightPct(value: string): string {
  const n = Number(value) / 1e18
  if (!Number.isFinite(n)) return '—'
  return `${(n * 100).toFixed(2).replace(/\.?0+$/, '')}%`
}

function formatDuration(seconds: number): string {
  if (!seconds) return '—'
  const d = seconds / 86400
  return `${seconds.toLocaleString()} s · ~${d.toLocaleString(undefined, { maximumFractionDigits: 1 })} d`
}

// api-v3 returns rate-like values as plain decimal strings (e.g. "1.025"),
// NOT 1e18-scaled. Display with enough significant digits to surface drift
// without rounding away yield in the second decimal.
function formatRate(value: string | null | undefined, sigDigits = 6): string {
  if (value === null || value === undefined || value === '') return '—'
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  if (n === 0) return '0'
  return n.toLocaleString(undefined, { maximumSignificantDigits: sigDigits })
}

// V3 stable pools expose `tokenType` as an enum on `TokenInfo`. The Vault's
// IVault interface defines two values today: STANDARD and WITH_RATE.
// Numbers outside that range render as "?" so future additions don't crash.
function tokenTypeLabel(t: number): string {
  if (t === 0) return 'STANDARD'
  if (t === 1) return 'WITH_RATE'
  return `TYPE ${t}`
}

/**
 * Maps an api-v3 `priceRateProviderData` snapshot to a tri-state status
 * + icon + tooltip text. Mirrors frontend-v3's `getRateProviderIcon` but
 * compressed into a single helper since we don't need the full hover-
 * popover here — the analytics card is denser. */
type RateProviderStatus =
  | { kind: 'safe'; label: string }
  | { kind: 'warning'; label: string }
  | { kind: 'unsafe'; label: string }
  | { kind: 'unreviewed'; label: string }
  | { kind: 'none'; label: string }

function classifyRateProvider(
  provider: string | null,
  data: PriceRateProviderData | null
): RateProviderStatus {
  if (!provider || provider.toLowerCase() === ZERO_ADDR) {
    return { kind: 'none', label: 'No rate provider — Vault treats this token as 1:1.' }
  }
  if (!data) {
    return {
      kind: 'unreviewed',
      label: 'No security review on file for this rate provider.',
    }
  }
  const warnings = (data.warnings ?? []).filter(Boolean)
  const isSafe = data.reviewed && data.summary === 'safe'
  if (isSafe && warnings.length === 0) {
    return { kind: 'safe', label: 'Reviewed and marked safe.' }
  }
  if (isSafe && warnings.length > 0) {
    return {
      kind: 'warning',
      label: `Reviewed safe with warnings: ${warnings.join(', ')}`,
    }
  }
  return {
    kind: 'unsafe',
    label: data.summary
      ? `Review flagged this provider (${data.summary}).`
      : 'Review flagged this provider.',
  }
}

function RateProviderStatusIcon({ status }: { status: RateProviderStatus }): React.JSX.Element {
  // Color + icon mirror frontend-v3's getIconAndLevel: green check for
  // reviewed-safe, amber triangle for warnings or unreviewed, red triangle
  // for an unsafe review. `none` (no rate provider attached) is a soft
  // help icon so the row doesn't look broken on plain-stable tokens.
  if (status.kind === 'safe') {
    return (
      <Tooltip hasArrow label={status.label} openDelay={250} placement="top">
        <Box as="span" color="green.300" cursor="help" display="inline-flex">
          <CheckCircle size={14} />
        </Box>
      </Tooltip>
    )
  }
  if (status.kind === 'warning' || status.kind === 'unreviewed') {
    return (
      <Tooltip hasArrow label={status.label} openDelay={250} placement="top">
        <Box as="span" color="font.warning" cursor="help" display="inline-flex">
          <AlertTriangle size={14} />
        </Box>
      </Tooltip>
    )
  }
  if (status.kind === 'unsafe') {
    return (
      <Tooltip hasArrow label={status.label} openDelay={250} placement="top">
        <Box as="span" color="red.400" cursor="help" display="inline-flex">
          <AlertTriangle size={14} />
        </Box>
      </Tooltip>
    )
  }
  return (
    <Tooltip hasArrow label={status.label} openDelay={250} placement="top">
      <Box as="span" color="font.secondary" cursor="help" display="inline-flex" opacity={0.6}>
        <HelpCircle size={14} />
      </Box>
    </Tooltip>
  )
}

type Token = { symbol: string }

/** Token-labelled weight rows. Falls back to positional labels when the
 *  weight array length doesn't line up with the api-v3 token list.
 *  Rendered as `StateRow`s so weights align on the same value tab as every
 *  other key/value row in the panel. */
function WeightRows({
  weights,
  tokens,
}: {
  weights: string[]
  tokens: Token[]
}): React.JSX.Element {
  return (
    <VStack align="stretch" spacing="sm" w="full">
      {weights.map((w, i) => (
        <StateRow
          key={i}
          label={tokens[i]?.symbol ?? `token ${i}`}
          value={formatWeightPct(w)}
        />
      ))}
    </VStack>
  )
}

/**
 * Flat panel section — no inner Card, no double-border. Adopts the
 * frontend-v3 PoolAttributes pattern: small heading, divider, then a
 * list of key/value rows. Visually distinct from neighbouring sections
 * via the outer Card's divider stack, not an inner border.
 */
/**
 * Self-contained section card. Each section (Fee parameters, Permissions,
 * Weights, ECLP, AutoRange, …) renders as its own free-standing Card so
 * `PoolStatePanel` can lay them out in a `SimpleGrid` — independent
 * grouping, no single-column tower of rows, and visually obvious which
 * params belong together. Sections with `wide` request the full row
 * (both columns on `lg+`) — used for AutoRange where the distribution
 * bar needs horizontal room to read clearly.
 */
function TypeSection({
  title,
  badge,
  wide,
  children,
}: {
  title: string
  badge?: React.ReactNode
  /** When true, the section spans both columns on `lg+`. Other breakpoints
   *  are unaffected (the grid is already single-column on `base`/`md`). */
  wide?: boolean
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <Card
      gridColumn={wide ? { lg: 'span 2' } : undefined}
      h="full"
      overflow="hidden"
      p={{ base: 'md', md: 'md' }}
      variant="subSection"
    >
      <VStack align="stretch" h="full" spacing="sm" w="full">
        <Flex align="center" justify="space-between">
          <Heading fontSize="md" variant="h4">
            {title}
          </Heading>
          {badge}
        </Flex>
        <Divider opacity={0.4} />
        <Stack align="stretch" spacing="sm" w="full">
          {children}
        </Stack>
      </VStack>
    </Card>
  )
}

// ── Manage-parameters deep links to ops.balancer.fi ──────────────────
//
// Builders shipped by the Balancer ops team. Per-pool links carry both
// the network slug (lowercase GqlChain — matches ops.balancer.fi's
// convention) and the 20-byte address.

const OPS_BASE = 'https://ops.balancer.fi'

type ManageLink = { label: string; hint: string; href: string }

/** Inline action button — appended after the rows of a section card to
 *  give users a direct deep-link into ops.balancer.fi's payload builder
 *  for whatever that section controls. Looks like a standard Chakra
 *  outline Button (label left, external-link icon right). */
function ManageButton({ link }: { link: ManageLink }): React.JSX.Element {
  return (
    // `alignSelf='flex-start'` keeps the button content-width — the parent
    // section Stack is `align='stretch'`, which would otherwise force it to
    // span the whole card. `tertiary` is the monorepo's neutral action
    // variant (background.level3 + shadow); reads as a real button against
    // the subSection card.
    <Button
      alignSelf="flex-start"
      as="a"
      fontWeight={500}
      href={link.href}
      rel="noreferrer"
      rightIcon={<ArrowUpRight size={14} />}
      size="sm"
      target="_blank"
      title={link.hint}
      variant="tertiary"
    >
      {link.label}
    </Button>
  )
}

/**
 * Permissions + deployment metadata sourced from api-v3 (factory,
 * swapFeeManager, pauseManager, poolCreator, version). Always renders
 * for a successfully resolved pool — answers "who can change what?"
 * which the existing "current values" cards above don't.
 */
function PermissionsSection({
  poolDetail,
}: {
  poolDetail: PoolPageData['poolDetail']
}): React.JSX.Element {
  const chain = poolDetail.chain as string
  const showVersion = typeof poolDetail.version === 'number' && poolDetail.version > 0
  return (
    // Single-column inside the section card — Permissions sits in a
    // half-width grid cell on lg+, so a 2-column inner grid would push
    // labels and addresses uncomfortably tight.
    <TypeSection title="Permissions & deployment">
      {showVersion && (
        <StateRow
          hint="protocol sub-version"
          label="Version"
          value={`v${poolDetail.protocolVersion}.${poolDetail.version}`}
        />
      )}
      <StateRow
        hint="deployer contract"
        label="Factory"
        value={
          <AddressLink
            address={poolDetail.factory}
            chain={chain}
            zeroHint="No factory recorded"
            zeroLabel="—"
          />
        }
      />
      <StateRow
        hint="can change the swap fee"
        label="Swap-fee manager"
        value={<AddressLink address={poolDetail.swapFeeManager} chain={chain} />}
      />
      <StateRow
        hint="can pause the pool"
        label="Pause manager"
        value={<AddressLink address={poolDetail.pauseManager} chain={chain} />}
      />
      <StateRow
        hint="original creator"
        label="Pool creator"
        value={<AddressLink address={poolDetail.poolCreator} chain={chain} />}
      />
    </TypeSection>
  )
}

function WeightedSection({
  weighted,
  tokens,
}: {
  weighted: WeightedTypeState
  tokens: Token[]
}): React.JSX.Element {
  return (
    <TypeSection title="Weights">
      <WeightRows tokens={tokens} weights={weighted.normalizedWeights} />
    </TypeSection>
  )
}

function GyroEclpSection({ eclp }: { eclp: GyroEclpTypeState }): React.JSX.Element {
  return (
    <TypeSection title="ECLP parameters">
      <StateRow hint="lower price bound" label="alpha" value={formatScaled(eclp.alpha)} />
      <StateRow hint="upper price bound" label="beta" value={formatScaled(eclp.beta)} />
      <StateRow hint="stretching factor" label="lambda" value={formatScaled(eclp.lambda)} />
      <StateRow hint="rotation cos" label="c" value={formatScaled(eclp.c)} />
      <StateRow hint="rotation sin" label="s" value={formatScaled(eclp.s)} />
    </TypeSection>
  )
}

// ── AutoRange math — margin balances in scaled-balance space ───────────
//
// Direct port of frontend-v3's `reclAmmMath.ts` (calculateLower/UpperMargin).
// These compute the *balances* of token A at which centeredness equals the
// configured margin from above and below; in price space (via `invariant /
// balance²`) those map to the "low target" and "high target" edges of the
// in-range green band on the distribution bar. Pure functions.
function autoRangeLowerMarginBalance(
  marginPercentage: number,
  invariant: number,
  vA: number,
  vB: number
): number {
  const m = marginPercentage / 100
  const b = vA + m * vA
  const c = m * (vA * vA - (invariant * vA) / vB)
  return vA + (-b + Math.sqrt(b * b - 4 * c)) / 2
}
function autoRangeUpperMarginBalance(
  marginPercentage: number,
  invariant: number,
  vA: number,
  vB: number
): number {
  const m = marginPercentage / 100
  const b = (vA + m * vA) / m
  const c = (vA * vA - (vA * invariant) / vB) / m
  return vA + (-b + Math.sqrt(b * b - 4 * c)) / 2
}

const autoRangePriceFmt = (n: number): string => {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString(undefined, { maximumSignificantDigits: 4 })
}

/**
 * Concentrated-liquidity distribution bar. Three proportional segments
 * across the full active range [min, max]:
 *
 *     [orange margin] [GREEN target] [orange margin]
 *                            ●
 *
 * Each segment's width tracks the actual price gap it covers. A vertical
 * marker overlays the current spot price; its color reflects status
 * (green in target, orange in margin, red if the spot escapes [min,max]).
 *
 * Boundary labels live OUTSIDE this component — surfaced in the section
 * card as a clean horizontal strip. Keeping the bar visualization-only
 * is what makes it readable inside a card's tight footprint.
 */
function AutoRangeDistroBar({
  minPrice,
  lowTarget,
  highTarget,
  maxPrice,
  spotPrice,
  isInRange,
}: {
  minPrice: number
  /** Lower edge of the green band ("Low target"). Comes from
   *  `invariant / upperMarginBalance²`. */
  lowTarget: number
  /** Upper edge of the green band ("High target"). */
  highTarget: number
  maxPrice: number
  spotPrice: number
  isInRange: boolean
}): React.JSX.Element {
  const range = maxPrice - minPrice
  const hasData =
    Number.isFinite(minPrice) &&
    Number.isFinite(maxPrice) &&
    Number.isFinite(lowTarget) &&
    Number.isFinite(highTarget) &&
    range > 0 &&
    lowTarget >= minPrice &&
    highTarget <= maxPrice &&
    lowTarget <= highTarget

  const leftOrangeW = hasData ? ((lowTarget - minPrice) / range) * 100 : 100 / 3
  const greenW = hasData ? ((highTarget - lowTarget) / range) * 100 : 100 / 3
  const rightOrangeW = hasData ? ((maxPrice - highTarget) / range) * 100 : 100 / 3

  const spotInside =
    Number.isFinite(spotPrice) && spotPrice >= minPrice && spotPrice <= maxPrice
  const spotPct = !Number.isFinite(spotPrice)
    ? null
    : spotPrice < minPrice
      ? 0
      : spotPrice > maxPrice
        ? 100
        : ((spotPrice - minPrice) / range) * 100

  const markerColor = !spotInside
    ? 'red.400'
    : isInRange
      ? 'green.300'
      : 'orange.300'

  return (
    <Box h="36px" position="relative" w="full">
      {/* The bar — taller (24px) so the colored segments read at a glance. */}
      <Flex
        borderColor="background.level0"
        borderWidth="1px"
        h="24px"
        overflow="hidden"
        position="absolute"
        rounded="md"
        top="6px"
        w="full"
      >
        <Box
          bgGradient="linear(to-b, orange.300, orange.500)"
          h="full"
          w={`${leftOrangeW}%`}
        />
        <Box
          bgGradient="linear(to-b, green.300, green.500)"
          h="full"
          w={`${greenW}%`}
        />
        <Box
          bgGradient="linear(to-b, orange.300, orange.500)"
          h="full"
          w={`${rightOrangeW}%`}
        />
      </Flex>
      {/* Spot marker — a thin vertical line capped with a dot on top.
          The dot's color signals status without needing text. */}
      {spotPct !== null && (
        <>
          <Box
            bg={markerColor}
            boxShadow="0 0 0 1px var(--chakra-colors-background-level0)"
            h="36px"
            left={`${spotPct}%`}
            position="absolute"
            rounded="sm"
            top="0"
            transform="translateX(-50%)"
            w="2px"
            zIndex={1}
          />
          <Box
            bg={markerColor}
            border="2px solid"
            borderColor="background.level0"
            boxShadow="md"
            h="10px"
            left={`${spotPct}%`}
            position="absolute"
            rounded="full"
            top="-2px"
            transform="translateX(-50%)"
            w="10px"
            zIndex={2}
          />
        </>
      )}
    </Box>
  )
}

/** Compact boundary chip — small "label · value" pair shown beneath the
 *  distribution bar. Four of these line up in a SimpleGrid so prices are
 *  readable at-a-glance without crowding the bar itself. */
function BoundaryChip({
  label,
  value,
  unit,
  emphasis,
}: {
  label: string
  value: number
  unit: string
  /** Spot price gets a colored value to match the bar's marker — every
   *  other chip stays neutral so the spot is the visual lead. */
  emphasis?: 'spot' | 'in-range' | 'out-of-range' | 'out-of-bounds'
}): React.JSX.Element {
  const valueColor =
    emphasis === 'out-of-bounds'
      ? 'red.400'
      : emphasis === 'in-range'
        ? 'green.300'
        : emphasis === 'out-of-range'
          ? 'orange.300'
          : undefined
  return (
    <VStack align="flex-start" spacing="2xs">
      <Text color="font.secondary" fontSize="xs">
        {label}
      </Text>
      <HStack align="baseline" spacing="xs">
        <Text color={valueColor} fontFamily="mono" fontSize="sm" fontWeight={500}>
          {autoRangePriceFmt(value)}
        </Text>
        <Text color="font.secondary" fontSize="2xs">
          {unit}
        </Text>
      </HStack>
    </VStack>
  )
}

function AutoRangeSection({
  rc,
  tokens,
  manageButton,
}: {
  rc: ReclammTypeState
  /** Pool tokens in registration order — tokens[0] = A, tokens[1] = B.
   *  Drives the unit label on the boundary chips (e.g. "USDC per WETH"). */
  tokens: Token[]
  manageButton?: React.ReactNode
}): React.JSX.Element {
  const updateActive =
    rc.priceRatio.endTime > 0 && rc.priceRatio.start !== rc.priceRatio.end

  // Convert all contract values to plain numbers in their natural units.
  // Live + virtual balances are 1e18-scaled by the Vault's internal
  // accounting; descaling once at the boundary lets the math read like
  // ordinary algebra. Centeredness margin is also 1e18-scaled; the math
  // function expects percent units, so divide by 1e16.
  const liveA = Number(rc.liveBalanceA) / 1e18
  const liveB = Number(rc.liveBalanceB) / 1e18
  const vA = Number(rc.virtualBalanceA) / 1e18
  const vB = Number(rc.virtualBalanceB) / 1e18
  const minPrice = Number(rc.minPrice) / 1e18
  const maxPrice = Number(rc.maxPrice) / 1e18
  const marginPct = Number(rc.centerednessMargin) / 1e16
  // Derive spot from the AMM curve: for a 50/50 weighted pool, spot price
  // (B per A) is `(liveB + virtualB) / (liveA + virtualA)`. Matches what
  // frontend-v3 does — and reliably avoids the `computeCurrentSpotPrice`
  // RPC call, which is absent on some older AutoRange deployments.
  const totalA = liveA + vA
  const totalB = liveB + vB
  const spotPrice = totalA > 0 ? totalB / totalA : NaN

  const invariant = (liveA + vA) * (liveB + vB)
  const lowerMarginBal =
    Number.isFinite(invariant) && vA > 0 && vB > 0 && marginPct > 0
      ? autoRangeLowerMarginBalance(marginPct, invariant, vA, vB)
      : NaN
  const upperMarginBal =
    Number.isFinite(invariant) && vA > 0 && vB > 0 && marginPct > 0
      ? autoRangeUpperMarginBalance(marginPct, invariant, vA, vB)
      : NaN
  // Lower balance of A → higher price ("High target", upper edge of green
  // band). Upper balance of A → lower price ("Low target", lower edge).
  const highTargetPrice = Number.isFinite(lowerMarginBal)
    ? invariant / (lowerMarginBal * lowerMarginBal)
    : NaN
  const lowTargetPrice = Number.isFinite(upperMarginBal)
    ? invariant / (upperMarginBal * upperMarginBal)
    : NaN

  const symbolA = tokens[0]?.symbol ?? 'A'
  const symbolB = tokens[1]?.symbol ?? 'B'
  const unit = `${symbolB} / ${symbolA}`

  const spotInside =
    Number.isFinite(spotPrice) &&
    Number.isFinite(minPrice) &&
    Number.isFinite(maxPrice) &&
    spotPrice >= minPrice &&
    spotPrice <= maxPrice
  const spotEmphasis: Parameters<typeof BoundaryChip>[0]['emphasis'] = !spotInside
    ? 'out-of-bounds'
    : rc.isWithinTargetRange
      ? 'in-range'
      : 'out-of-range'

  return (
    <TypeSection
      badge={
        <Badge colorScheme={rc.isWithinTargetRange ? 'green' : 'orange'} size="sm">
          {rc.isWithinTargetRange ? 'in range' : 'out of range'}
        </Badge>
      }
      title="AutoRange"
      wide
    >
      {/* Distribution bar — one big visual element, no labels on it. */}
      <AutoRangeDistroBar
        highTarget={highTargetPrice}
        isInRange={rc.isWithinTargetRange}
        lowTarget={lowTargetPrice}
        maxPrice={maxPrice}
        minPrice={minPrice}
        spotPrice={spotPrice}
      />

      {/* Five boundary chips — Min · Low target · Spot · High target · Max.
          SimpleGrid collapses to 3 columns on narrow widths so the spot
          stays prominent on every breakpoint. */}
      <SimpleGrid columns={{ base: 2, sm: 3, md: 5 }} spacing="sm" w="full">
        <BoundaryChip label="Min" unit={unit} value={minPrice} />
        <BoundaryChip label="Low target" unit={unit} value={lowTargetPrice} />
        <BoundaryChip
          emphasis={spotEmphasis}
          label="Spot"
          unit={unit}
          value={spotPrice}
        />
        <BoundaryChip label="High target" unit={unit} value={highTargetPrice} />
        <BoundaryChip label="Max" unit={unit} value={maxPrice} />
      </SimpleGrid>

      <Divider opacity={0.4} />

      {/* Parameter rows — standard StateRow layout matches every other
          section card so the page reads consistently. */}
      <StateRow
        hint="ratio of max to min price"
        label="Price ratio"
        value={formatScaled(rc.currentPriceRatio)}
      />
      <StateRow
        hint="threshold below which the pool starts shifting to recenter"
        label="Centeredness margin"
        value={formatWeightPct(rc.centerednessMargin)}
      />
      <StateRow
        hint="cap on daily drift of the bounds when out-of-center"
        label="Daily price shift"
        value={formatWeightPct(rc.dailyPriceShiftExponent)}
      />
      {rc.lastTimestamp > 0 && (
        <StateRow
          hint="bounds only update on interactions"
          label="Last interaction"
          value={formatTimestamp(rc.lastTimestamp)}
        />
      )}
      {updateActive && (
        <>
          <StateRow
            hint="price-ratio update start"
            label="Update from"
            value={`${formatScaled(rc.priceRatio.start)} · ${formatTimestamp(rc.priceRatio.startTime)}`}
          />
          <StateRow
            hint="price-ratio update target"
            label="Update to"
            value={`${formatScaled(rc.priceRatio.end)} · ${formatTimestamp(rc.priceRatio.endTime)}`}
          />
        </>
      )}
      {manageButton}
    </TypeSection>
  )
}

function LbpSection({
  lbp,
  tokens,
}: {
  lbp: LbpTypeState
  tokens: Token[]
}): React.JSX.Element {
  const hasSchedule = lbp.update.startTime > 0
  return (
    <TypeSection
      badge={
        <Badge colorScheme={lbp.swapEnabled ? 'green' : 'gray'} size="sm">
          {lbp.swapEnabled ? 'swaps enabled' : 'swaps disabled'}
        </Badge>
      }
      title="LBP weights"
    >
      <Box>
        <Text fontSize="xs" mb="xs" variant="secondary">
          Current
        </Text>
        <WeightRows tokens={tokens} weights={lbp.normalizedWeights} />
      </Box>
      {hasSchedule && (
        <Box>
          <Text fontSize="xs" mb="sm" variant="secondary">
            Gradual update · {formatTimestamp(lbp.update.startTime)} →{' '}
            {formatTimestamp(lbp.update.endTime)}
          </Text>
          <VStack align="stretch" spacing="sm" w="full">
            {lbp.update.startWeights.map((sw, i) => (
              <StateRow
                key={i}
                label={tokens[i]?.symbol ?? `token ${i}`}
                value={`${formatWeightPct(sw)} → ${formatWeightPct(lbp.update.endWeights[i] ?? '0')}`}
              />
            ))}
          </VStack>
        </Box>
      )}
    </TypeSection>
  )
}

function QuantAmmSection({
  qa,
  tokens,
}: {
  qa: QuantAmmTypeState
  tokens: Token[]
}): React.JSX.Element {
  return (
    <TypeSection
      badge={
        <Badge colorScheme={qa.withinFixWindow ? 'purple' : 'gray'} size="sm">
          {qa.withinFixWindow ? 'in fix window' : 'free'}
        </Badge>
      }
      title="QuantAMM weights"
    >
      <Box>
        <Text fontSize="xs" mb="xs" variant="secondary">
          Current (dynamic)
        </Text>
        <WeightRows tokens={tokens} weights={qa.normalizedWeights} />
      </Box>
      <StateRow
        hint="oracle staleness threshold"
        label="Oracle window"
        value={formatDuration(qa.oracleStalenessThreshold)}
      />
    </TypeSection>
  )
}

// ── StableSurge math — derives "is surging?" + estimated fee ─────────────
//
// Port of `calculateStableSurgeBalanceMetrics` from balancer-ops-frontend
// (commit 67fefe1, lib/utils/calculateStableSurgeBalanceMetrics.ts). The
// algorithm is pure client-side derivation from per-token `balanceUSD`
// shares + the hook's threshold/max-fee params — no extra RPC reads.
type SurgeMetrics = {
  /** Per-token TVL share, in percent (0–100). */
  tokenPercentages: { symbol: string; pct: number }[]
  /** Reference centroid used to compute deviations. For 2-token pools this
   *  is always 50; for 3+ tokens it's the median of the per-token shares
   *  (matches ops behavior — `median` is more robust than `mean` against a
   *  single outlier token blowing up the imbalance signal). */
  median: number
  /** Sum of absolute deviations from the median, in percentage points. */
  totalImbalance: number
  /** Hook threshold expressed in percentage points (5e16 wei → 5). */
  surgeThresholdPct: number
  /** Hook max swap fee expressed in percentage points. */
  maxSurgeFeePct: number
  /** True when totalImbalance has crossed the threshold — pool charges
   *  a higher swap fee in this state. */
  isInSurgeMode: boolean
  /** Linear estimate of the current dynamic swap fee. Zero when not
   *  surging; ramps from 0 → maxSurgeFee as the imbalance overshoots
   *  the threshold by 0 → 100% (clamped). */
  estimatedSurgeFeePct: number
}

function computeSurgeMetrics(
  ss: StableSurgeState,
  tokens: PoolDetailToken[]
): SurgeMetrics {
  let tvl = 0
  const balancesUsd = tokens.map(t => {
    const b = Number(t.balanceUSD) || 0
    tvl += b
    return b
  })
  const tokenPercentages = balancesUsd.map((b, i) => ({
    symbol: tokens[i].symbol,
    pct: tvl > 0 ? (b / tvl) * 100 : 0,
  }))

  let median: number
  if (tokens.length === 2) {
    median = 50
  } else {
    const sorted = tokenPercentages.map(t => t.pct).sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    median =
      sorted.length === 0
        ? 0
        : sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid]
  }

  const totalImbalance = tokenPercentages.reduce(
    (acc, t) => acc + Math.abs(t.pct - median),
    0
  )
  const surgeThresholdPct = (Number(ss.surgeThresholdPercentage) / 1e18) * 100
  const maxSurgeFeePct = (Number(ss.maxSurgeFeePercentage) / 1e18) * 100
  const isInSurgeMode = totalImbalance > surgeThresholdPct

  let estimatedSurgeFeePct = 0
  if (isInSurgeMode && surgeThresholdPct > 0) {
    const intensity = Math.min(
      (totalImbalance - surgeThresholdPct) / surgeThresholdPct,
      1
    )
    estimatedSurgeFeePct = intensity * maxSurgeFeePct
  }

  return {
    tokenPercentages,
    median,
    totalImbalance,
    surgeThresholdPct,
    maxSurgeFeePct,
    isInSurgeMode,
    estimatedSurgeFeePct,
  }
}

/** Horizontal imbalance gauge — green zone up to threshold, red zone past
 *  it. Marker shows the current totalImbalance position. Scale auto-sizes
 *  so the threshold + current marker always sit in a readable region of
 *  the bar (a 5% threshold doesn't get visually squashed against the left
 *  edge of a 0–100% track). */
function SurgeImbalanceBar({
  imbalance,
  threshold,
  isInSurgeMode,
}: {
  imbalance: number
  threshold: number
  isInSurgeMode: boolean
}): React.JSX.Element {
  // Scale so the bar's right edge is comfortably past whichever is bigger
  // — the threshold or the current imbalance — but never under 10 (so a
  // tiny threshold like 1% still has visible resolution).
  const scaleMax = Math.max(threshold * 3, imbalance * 1.2, 10)
  const thresholdPos = Math.min((threshold / scaleMax) * 100, 100)
  const currentPos = Math.min((imbalance / scaleMax) * 100, 100)
  const markerColor = isInSurgeMode ? 'red.400' : 'green.300'
  return (
    <VStack align="stretch" spacing="2xs" w="full">
      <Box h="14px" position="relative" w="full">
        <Flex
          borderColor="background.level0"
          borderWidth="1px"
          h="10px"
          overflow="hidden"
          position="absolute"
          rounded="sm"
          top="2px"
          w="full"
        >
          <Box
            bgGradient="linear(to-b, green.300, green.500)"
            h="full"
            w={`${thresholdPos}%`}
          />
          <Box
            bgGradient="linear(to-b, red.300, red.500)"
            h="full"
            w={`${100 - thresholdPos}%`}
          />
        </Flex>
        {/* Marker — vertical pill at the current imbalance position. */}
        <Box
          bg={markerColor}
          boxShadow="0 0 0 1px var(--chakra-colors-background-level0)"
          h="14px"
          left={`${currentPos}%`}
          position="absolute"
          rounded="sm"
          top="0"
          transform="translateX(-50%)"
          w="3px"
          zIndex={1}
        />
      </Box>
      <Flex justify="space-between">
        <Text color="font.secondary" fontFamily="mono" fontSize="2xs">
          0%
        </Text>
        <Text color="orange.300" fontFamily="mono" fontSize="2xs">
          threshold {threshold.toFixed(2)}%
        </Text>
        <Text color="font.secondary" fontFamily="mono" fontSize="2xs">
          {scaleMax.toFixed(0)}%
        </Text>
      </Flex>
    </VStack>
  )
}

function StableSurgeSection({
  ss,
  tokens,
  manageButton,
}: {
  ss: StableSurgeState
  /** Pool tokens with `balanceUSD` populated — used to derive the
   *  current per-token shares the hook compares against the threshold. */
  tokens: PoolDetailToken[]
  manageButton?: React.ReactNode
}): React.JSX.Element {
  const m = computeSurgeMetrics(ss, tokens)
  const deviationFmt = (n: number) =>
    `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`

  return (
    <TypeSection
      badge={
        <Badge colorScheme={m.isInSurgeMode ? 'red' : 'green'} size="sm">
          {m.isInSurgeMode ? 'surging' : 'stable'}
        </Badge>
      }
      title="StableSurge hook"
    >
      <StateRow
        hint="sum of absolute token-share deviations from the median"
        label="Current imbalance"
        value={
          <VStack align="stretch" spacing="xs" w="full">
            <HStack align="baseline" spacing="sm">
              <Text
                color={m.isInSurgeMode ? 'red.300' : 'font.primary'}
                fontFamily="mono"
                fontSize="md"
                fontWeight={600}
              >
                {m.totalImbalance.toFixed(2)}%
              </Text>
              <Text color="font.secondary" fontFamily="mono" fontSize="xs">
                vs threshold {m.surgeThresholdPct.toFixed(2)}%
              </Text>
            </HStack>
            <SurgeImbalanceBar
              imbalance={m.totalImbalance}
              isInSurgeMode={m.isInSurgeMode}
              threshold={m.surgeThresholdPct}
            />
          </VStack>
        }
      />
      <StateRow
        hint="imbalance above which surge applies"
        label="Surge threshold"
        value={formatPercent(ss.surgeThresholdPercentage)}
      />
      <StateRow
        hint="max swap fee while surging"
        label="Max surge fee"
        value={formatPercent(ss.maxSurgeFeePercentage)}
      />
      {m.isInSurgeMode && (
        <StateRow
          hint="current dynamic swap fee derived from how far past the threshold the imbalance is"
          label="Estimated surge fee"
          value={
            <Text color="red.300" fontFamily="mono" fontSize="sm" fontWeight={600}>
              {m.estimatedSurgeFeePct.toFixed(3)}%
            </Text>
          }
        />
      )}
      <Divider opacity={0.4} />
      <Box>
        <Text color="font.secondary" fontSize="xs" mb="xs">
          Balance distribution
        </Text>
        <VStack align="stretch" spacing="2xs" w="full">
          {m.tokenPercentages.map((t, i) => {
            const dev = t.pct - m.median
            const devAbs = Math.abs(dev)
            // Color the deviation if it's a meaningful contributor to imbalance.
            // Use the threshold as the "this matters" yardstick — a deviation
            // larger than the threshold is by definition pushing the pool
            // toward surge.
            const devColor =
              devAbs >= m.surgeThresholdPct ? 'red.300' : devAbs >= 1 ? 'orange.300' : 'font.secondary'
            return (
              <HStack justify="space-between" key={i} spacing="sm" w="full">
                <Text fontFamily="mono" fontSize="sm">
                  {t.symbol}
                </Text>
                <HStack spacing="md">
                  <Text fontFamily="mono" fontSize="sm">
                    {t.pct.toFixed(2)}%
                  </Text>
                  <Text color={devColor} fontFamily="mono" fontSize="xs" minW="60px" textAlign="right">
                    {deviationFmt(dev)}
                  </Text>
                </HStack>
              </HStack>
            )
          })}
        </VStack>
      </Box>
      {manageButton}
    </TypeSection>
  )
}

// ── ERC4626 buffer section ─────────────────────────────────────────────
//
// One TypeSection per wrapped token. Each surfaces the Vault buffer's
// internal composition (underlying vs wrapped held by the buffer) plus
// the ERC4626 wrapper's own deposit/withdraw caps — both pieces are
// "current state" of how the pool can route swaps through this token.

const tokenCompact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 2,
})

function formatTokenCompact(amount: number): string {
  if (!Number.isFinite(amount)) return '—'
  if (amount === 0) return '0'
  return tokenCompact.format(amount)
}

function parseNum(s: string | null | undefined): number {
  if (s == null) return NaN
  const n = Number(s)
  return Number.isFinite(n) ? n : NaN
}

/** Convert a raw u256 string to a human number using `decimals`. Loses
 *  precision past 2^53 but the display values we surface (USD-stable-
 *  pool buffers, ETH-likes) live well below that ceiling. */
function rawToHuman(raw: string | null, decimals: number): number {
  if (!raw || decimals < 0 || !Number.isFinite(decimals)) return NaN
  try {
    return Number(BigInt(raw)) / 10 ** decimals
  } catch {
    return NaN
  }
}

/** Tight horizontal capacity bar — fits inside a StateRow value column.
 *  Shows what fraction of the wrapper's cap the pool's current position
 *  occupies, with a small percentage readout above and the cap value
 *  beneath. Red when the pool position exceeds the cap (a full one-shot
 *  unwind would not fit). */
function CapacityBar({
  positionLabel,
  position,
  cap,
  unit,
}: {
  positionLabel: string
  position: number
  cap: number
  unit: string
}): React.JSX.Element {
  const hasData = Number.isFinite(position) && Number.isFinite(cap) && cap >= 0
  const overflow = hasData && cap > 0 ? position > cap : false
  const pct = !hasData
    ? 0
    : cap <= 0
      ? position > 0
        ? 100
        : 0
      : Math.min((position / cap) * 100, 100)
  return (
    <VStack align="stretch" spacing="2xs" w="full">
      <Flex align="center" justify="space-between">
        <Text color={overflow ? 'red.400' : 'font.secondary'} fontFamily="mono" fontSize="xs">
          {hasData ? `${pct.toFixed(1)}%` : '—'}
        </Text>
        <Text color="font.secondary" fontFamily="mono" fontSize="2xs">
          cap {formatTokenCompact(cap)} {unit}
        </Text>
      </Flex>
      <Box bg="background.level3" h="6px" overflow="hidden" rounded="sm" w="full">
        <Box
          bg={overflow ? 'red.500' : 'primary.500'}
          h="full"
          transition="width 0.3s ease"
          w={`${pct}%`}
        />
      </Box>
      <Text color="font.secondary" fontSize="2xs">
        {positionLabel}
      </Text>
    </VStack>
  )
}

/** Buffer composition bar — left segment = underlying balance, right =
 *  wrapped balance (converted to underlying units via priceRate).
 *  Surfaces the imbalance % so a reader can scan whether the next swap
 *  is likely to trigger a real wrap/unwrap on-chain. */
function BufferSplitBar({
  underlyingAmount,
  underlyingSymbol,
  wrappedAmountAsUnderlying,
  wrappedSymbol,
}: {
  underlyingAmount: number
  underlyingSymbol: string
  wrappedAmountAsUnderlying: number
  wrappedSymbol: string
}): React.JSX.Element {
  const total = underlyingAmount + wrappedAmountAsUnderlying
  const hasData = Number.isFinite(total) && total > 0
  const underlyingPct = hasData ? (underlyingAmount / total) * 100 : 0
  const wrappedPct = hasData ? 100 - underlyingPct : 0
  const imbalance = hasData ? Math.abs(underlyingPct - 50) : null
  const imbalanceColor =
    imbalance == null
      ? 'font.secondary'
      : imbalance >= 25
        ? 'red.400'
        : imbalance >= 10
          ? 'yellow.400'
          : 'green.400'
  return (
    <VStack align="stretch" spacing="2xs" w="full">
      <Flex align="center" justify="space-between">
        <Text color="font.secondary" fontFamily="mono" fontSize="xs">
          {hasData ? `${formatTokenCompact(total)} ${underlyingSymbol}` : '—'}
        </Text>
        <Text color={imbalanceColor} fontFamily="mono" fontSize="2xs">
          {imbalance == null ? '' : `${imbalance.toFixed(1)}% off 50/50`}
        </Text>
      </Flex>
      <Box bg="background.level3" h="8px" overflow="hidden" rounded="sm" w="full">
        <Flex h="full" w="full">
          <Box bg="primary.400" h="full" transition="width 0.3s ease" w={`${underlyingPct}%`} />
          <Box bg="purple.400" h="full" transition="width 0.3s ease" w={`${wrappedPct}%`} />
        </Flex>
      </Box>
      <HStack justify="space-between" spacing="xs">
        <HStack spacing="2xs">
          <Box bg="primary.400" h="2" rounded="sm" w="2" />
          <Text color="font.secondary" fontSize="2xs">
            {formatTokenCompact(underlyingAmount)} {underlyingSymbol}
          </Text>
        </HStack>
        <HStack spacing="2xs">
          <Box bg="purple.400" h="2" rounded="sm" w="2" />
          <Text color="font.secondary" fontSize="2xs">
            {formatTokenCompact(wrappedAmountAsUnderlying)} as {wrappedSymbol}
          </Text>
        </HStack>
      </HStack>
    </VStack>
  )
}

function BufferSection({
  token,
  buffer,
  manageButton,
}: {
  token: PoolDetailToken
  buffer: BufferState | null
  manageButton: React.ReactNode
}): React.JSX.Element {
  const priceRate = parseNum(token.priceRate)
  const balanceWrapped = parseNum(token.balance)
  const positionInUnderlying =
    Number.isFinite(balanceWrapped) && Number.isFinite(priceRate)
      ? balanceWrapped * priceRate
      : NaN
  const maxDeposit = parseNum(token.maxDeposit ?? '')
  const maxWithdraw = parseNum(token.maxWithdraw ?? '')
  const underlyingSymbol = token.underlyingToken?.symbol ?? '—'
  const underlyingDecimals = token.underlyingToken?.decimals ?? token.decimals

  const bufferUnderlying = buffer
    ? rawToHuman(buffer.underlyingBalanceRaw, underlyingDecimals)
    : NaN
  const bufferWrapped = buffer ? rawToHuman(buffer.wrappedBalanceRaw, token.decimals) : NaN
  const bufferWrappedAsUnderlying =
    Number.isFinite(bufferWrapped) && Number.isFinite(priceRate)
      ? bufferWrapped * priceRate
      : NaN

  const review = (token.erc4626ReviewData?.summary ?? '').toLowerCase()
  const reviewBadge =
    review === 'safe' ? (
      <Badge colorScheme="green" size="sm">
        safe
      </Badge>
    ) : review === 'unsafe' ? (
      <Badge colorScheme="red" size="sm">
        unsafe
      </Badge>
    ) : review ? (
      <Badge colorScheme="yellow" size="sm">
        {review}
      </Badge>
    ) : null

  const uninitialized = buffer?.isInitialized === false
  const initBadge = uninitialized ? (
    <Badge colorScheme="red" size="sm">
      uninitialized
    </Badge>
  ) : null

  // Filter out empty / null entries — api-v3 occasionally returns a
  // single `""` placeholder in the warnings array, which used to render
  // the row with a label but no value. Real warnings stay; empties drop
  // so the row hides entirely when there's nothing to surface.
  const warnings = (token.erc4626ReviewData?.warnings ?? []).filter(
    w => typeof w === 'string' && w.trim().length > 0
  )

  return (
    <TypeSection
      badge={
        <HStack spacing="xs">
          {initBadge}
          {reviewBadge}
        </HStack>
      }
      title={`Buffer: ${token.symbol} ↔ ${underlyingSymbol}`}
    >
      <StateRow
        hint="balanced 50/50 means most swaps avoid wrapping on-chain"
        label="Composition"
        value={
          buffer ? (
            <BufferSplitBar
              underlyingAmount={bufferUnderlying}
              underlyingSymbol={underlyingSymbol}
              wrappedAmountAsUnderlying={bufferWrappedAsUnderlying}
              wrappedSymbol={token.symbol}
            />
          ) : (
            'buffer read unavailable'
          )
        }
      />
      <StateRow
        hint="how much underlying the pool's wrapped position represents"
        label="Pool position"
        value={`${formatTokenCompact(positionInUnderlying)} ${underlyingSymbol}`}
      />
      <StateRow
        hint="how much can be deposited into the ERC4626 vault right now"
        label="Deposit headroom"
        value={
          <CapacityBar
            cap={maxDeposit}
            position={positionInUnderlying}
            positionLabel={`pool position ${formatTokenCompact(positionInUnderlying)} ${underlyingSymbol}`}
            unit={underlyingSymbol}
          />
        }
      />
      <StateRow
        hint="how much can be withdrawn from the ERC4626 vault right now"
        label="Withdraw headroom"
        value={
          <CapacityBar
            cap={maxWithdraw}
            position={positionInUnderlying}
            positionLabel={`pool position ${formatTokenCompact(positionInUnderlying)} ${underlyingSymbol}`}
            unit={underlyingSymbol}
          />
        }
      />
      {warnings.length > 0 && (
        <StateRow
          label="Warnings"
          value={
            <Text fontSize="xs" wordBreak="break-word">
              {warnings.join(' · ')}
            </Text>
          }
        />
      )}
      {manageButton}
    </TypeSection>
  )
}

// Fixed pixel width for the label column on `md+`. Using exact width
// (not `minWidth`) so every section's rows align to the same x-position
// regardless of label content. 180px comfortably fits every label we
// render today (longest are ~130px — "Pool-creator yield", "Swap-fee
// manager", "Aggregate swap fee") with extra breathing room before the
// value column.
const STATE_LABEL_WIDTH = '280px'

function StateRow({
  label,
  value,
  hint,
}: {
  label: string
  value: string | React.ReactNode
  hint?: string
}): React.JSX.Element {
  // Mirrors frontend-v3 `PoolAttributes` row exactly: `direction='row'`
  // on `md+` with no `align` prop (Chakra's default `flex-start` lines
  // the value's first text line up with the label's first text line),
  // a fixed-width label box on `md+`, `:` suffix on the label, and the
  // value sitting flush after a `1.3rem` spacing gap (md + 30%). No `flex`
  // or `textAlign='right'` on the value — values therefore start at the
  // same x position across every row.
  return (
    <Stack
      direction={{ base: 'column', md: 'row' }}
      spacing={{ base: '2xs', md: '1.3rem' }}
      w="full"
    >
      <Box flexShrink={0} w={{ md: STATE_LABEL_WIDTH }}>
        <Text color="font.secondary" fontSize="sm">
          {label}:
        </Text>
        {hint && (
          <Text color="font.secondary" fontSize="2xs" opacity={0.7}>
            {hint}
          </Text>
        )}
      </Box>
      {typeof value === 'string' ? (
        <Text fontFamily="mono" fontSize="sm" minW={0} wordBreak="break-word">
          {value}
        </Text>
      ) : (
        <Box fontFamily="mono" fontSize="sm" minW={0}>
          {value}
        </Box>
      )}
    </Stack>
  )
}

/**
 * Amp factor + ramp schedule rows. Shared between V3 and V2 stable pools
 * since the `StableTypeState` shape is identical — V2 just synthesizes a
 * degenerate ramp (start == end, both times 0) which the ramp-schedule
 * block conditionally hides.
 */
function AmpFactorRows({ stable: s }: { stable: StableTypeState }): React.JSX.Element {
  const showRamp =
    s.amplificationState.endTime > 0 &&
    s.amplificationState.startValue !== s.amplificationState.endValue
  const precision = s.amplificationParameter.precision
  return (
    <>
      <Divider />
      <StateRow
        hint={s.amplificationParameter.isUpdating ? 'ramping' : 'static'}
        label="Amp factor"
        value={
          <HStack spacing="xs">
            <Text fontFamily="mono" fontSize="sm">
              {formatAmp(s.amplificationParameter.value, precision)}
            </Text>
            {s.amplificationParameter.isUpdating && (
              <Badge colorScheme="purple" size="sm">
                updating
              </Badge>
            )}
          </HStack>
        }
      />
      {/* Ramp start/target as plain StateRows so their values sit on the same
          160px tab as every other row (was a flush-right space-between block,
          which pushed the values far to the right of the tab). */}
      {showRamp && (
        <>
          <StateRow
            hint="ramp start"
            label="Ramp from"
            value={`${formatAmp(s.amplificationState.startValue, precision)} · ${formatTimestamp(s.amplificationState.startTime)}`}
          />
          <StateRow
            hint="ramp target"
            label="Ramp to"
            value={`${formatAmp(s.amplificationState.endValue, precision)} · ${formatTimestamp(s.amplificationState.endTime)}`}
          />
        </>
      )}
    </>
  )
}

/**
 * Per-token rate providers + review status. Visible whenever at least one
 * token has a non-zero `priceRateProvider` (boosted pools, LST stable
 * pools, etc.). Each row shows: token symbol · current rate · provider
 * address (linked) · STANDARD / WITH_RATE chip · "yield-fee" pill ·
 * security review icon. Mirrors frontend-v3's `PoolContracts` rate-
 * provider row but uses the analytics `StateRow` grammar so labels line
 * up with the rest of the panel.
 */
function RateProvidersSection({
  tokens,
  tokenInfo,
  chain,
}: {
  tokens: PoolDetailToken[]
  /** Per-token info from the V3 Vault. Order-aligned with `tokens`. `null`
   *  when the on-chain read wasn't available (V2 pool, archive miss). */
  tokenInfo: StableTypeState['tokenInfo']
  chain: string
}): React.JSX.Element {
  return (
    <TypeSection title="Rate providers">
      <VStack align="stretch" spacing="sm" w="full">
        {tokens.map((t, i) => {
          const status = classifyRateProvider(t.priceRateProvider, t.priceRateProviderData)
          const info = tokenInfo?.[i] ?? null
          return (
            <StateRow
              key={t.address}
              label={t.symbol}
              value={
                <VStack align="stretch" spacing="2xs">
                  <HStack flexWrap="wrap" gap="xs">
                    <Text fontFamily="mono" fontSize="sm">
                      {formatRate(t.priceRate)}
                    </Text>
                    {t.priceRateProvider && t.priceRateProvider.toLowerCase() !== ZERO_ADDR ? (
                      <AddressLink address={t.priceRateProvider} chain={chain} />
                    ) : (
                      <Text color="font.secondary" fontSize="sm">
                        no provider
                      </Text>
                    )}
                    <RateProviderStatusIcon status={status} />
                  </HStack>
                  {(info || t.isErc4626) && (
                    <HStack flexWrap="wrap" gap="2xs">
                      {info && (
                        <Badge fontSize="2xs" size="sm" variant="outline">
                          {tokenTypeLabel(info.tokenType)}
                        </Badge>
                      )}
                      {t.isErc4626 && (
                        <Badge colorScheme="purple" fontSize="2xs" size="sm" variant="subtle">
                          ERC4626
                        </Badge>
                      )}
                      {info?.paysYieldFees && (
                        <Tooltip
                          hasArrow
                          label="The Vault charges a yield fee on this token's rate-provider yield."
                          openDelay={250}
                        >
                          <Badge
                            colorScheme="orange"
                            cursor="help"
                            fontSize="2xs"
                            size="sm"
                            variant="subtle"
                          >
                            yield fee
                          </Badge>
                        </Tooltip>
                      )}
                    </HStack>
                  )}
                  {status.kind === 'warning' && (t.priceRateProviderData?.warnings ?? []).length > 0 && (
                    <Text color="font.warning" fontSize="2xs" opacity={0.85}>
                      {(t.priceRateProviderData?.warnings ?? []).join(' · ')}
                    </Text>
                  )}
                </VStack>
              }
            />
          )
        })}
      </VStack>
    </TypeSection>
  )
}

/**
 * Composition + imbalance card. Surfaces per-token USD share alongside a
 * weight-aware imbalance metric.
 *
 * The naive `max_share / min_share` reading breaks on weighted pools — an
 * 80/20 pool sitting perfectly on design reads as 4.00× even though it's
 * not imbalanced at all. The correct framing is **deviation from target
 * weight**: each token's `actual_share / target_weight` should be 1.0
 * when on-design, regardless of what the design is. The card's headline
 * ratio is then `max(actual/target) / min(actual/target)` — 1.00× means
 * the pool is sitting exactly on its design weights; higher means
 * directional flow has tilted the composition relative to the design.
 *
 * Target weight per token:
 *   - Weighted pools (incl. 80/20 etc.): the on-chain normalised weight
 *     from `pool.tokens[i].weight` (fractional decimal, e.g. `"0.8"`).
 *   - Stable / CoW / weight-less pools: implicit equal share `1/N`.
 *   - Mixed (some weights null): defensive fall-through to equal share.
 */
function PoolBalancesSection({
  tokens,
}: {
  tokens: PoolDetailToken[]
}): React.JSX.Element | null {
  const shares = tokens
    .map(t => ({ token: t, balanceUSD: Number(t.balanceUSD) }))
    .filter(s => Number.isFinite(s.balanceUSD))
  const total = shares.reduce((acc, s) => acc + s.balanceUSD, 0)
  if (total <= 0 || shares.length === 0) return null

  // Detect whether the pool ships explicit weights. We require every
  // token to expose a positive weight before trusting them — a mixed
  // payload (some null, some set) usually means BPT or a sentinel row;
  // safer to fall through to equal-share than to compute against partial
  // weights.
  const parsedWeights = shares.map(s => Number(s.token.weight ?? ''))
  const hasExplicitWeights =
    parsedWeights.every(w => Number.isFinite(w) && w > 0) &&
    Math.abs(parsedWeights.reduce((a, b) => a + b, 0) - 1) < 0.02
  const fallbackWeight = 1 / shares.length

  const enriched = shares.map((s, i) => {
    const share = s.balanceUSD / total
    const targetWeight = hasExplicitWeights ? parsedWeights[i] : fallbackWeight
    // `actual / target` — 1.0 means the token sits on its design weight,
    // <1 means depleted vs design, >1 means accumulated vs design.
    const ratioToTarget = targetWeight > 0 ? share / targetWeight : NaN
    return { ...s, share, targetWeight, ratioToTarget }
  })
  const validRatios = enriched
    .map(e => e.ratioToTarget)
    .filter(r => Number.isFinite(r) && r > 0)
  const ratio =
    validRatios.length >= 2
      ? Math.max(...validRatios) / Math.min(...validRatios)
      : NaN

  const tooltipLabel = hasExplicitWeights
    ? 'Largest (actual share / target weight) divided by smallest. 1.00× means the pool sits on its design weights (e.g. 80/20 with each side exactly on target); higher means flow has tilted composition relative to design.'
    : 'Largest token share divided by smallest. 1.00× means perfectly balanced; higher means one side is being depleted by directional flow.'

  return (
    <TypeSection
      badge={
        <Tooltip hasArrow label={tooltipLabel} openDelay={250}>
          <Badge
            colorScheme={ratio < 1.25 ? 'green' : ratio < 1.75 ? 'orange' : 'red'}
            cursor="help"
            fontSize="xs"
          >
            {Number.isFinite(ratio) ? `${ratio.toFixed(2)}×` : '—'}
          </Badge>
        </Tooltip>
      }
      title="Composition & imbalance"
    >
      <VStack align="stretch" spacing="sm" w="full">
        {enriched.map(({ token, share, balanceUSD, targetWeight, ratioToTarget }) => {
          const pctText = `${(share * 100).toFixed(2)}%`
          // Highlight the bar color when the token has drifted noticeably
          // off its target weight — soft amber past ±25% relative
          // deviation, plain accent otherwise. Reads identically on
          // weighted and stable pools because the metric is normalized.
          const deviation = Number.isFinite(ratioToTarget) ? Math.abs(ratioToTarget - 1) : 0
          const barColor = deviation > 0.25 ? 'orange.300' : 'green.300'
          // For weighted pools we surface the target weight inline so the
          // operator can read "actual 81% / target 80%" at a glance.
          const targetText = hasExplicitWeights
            ? `target ${(targetWeight * 100).toFixed(0)}%`
            : null
          return (
            <Box key={token.address}>
              <HStack justify="space-between" mb="2xs">
                <HStack spacing="xs">
                  <Text fontSize="sm">{token.symbol}</Text>
                  {targetText && (
                    <Text color="font.secondary" fontSize="xs" opacity={0.7}>
                      · {targetText}
                    </Text>
                  )}
                </HStack>
                <HStack spacing="xs">
                  <Text color="font.secondary" fontFamily="mono" fontSize="xs">
                    ${balanceUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Text>
                  <Text fontFamily="mono" fontSize="sm">
                    {pctText}
                  </Text>
                </HStack>
              </HStack>
              <Box bg="background.level0" borderRadius="full" h="6px" overflow="hidden" position="relative">
                <Box
                  bg={barColor}
                  borderRadius="full"
                  h="100%"
                  transition="width 0.2s"
                  w={`${share * 100}%`}
                />
                {/* Target-weight marker — a faint vertical tick at the
                    token's design weight. On a balanced 80/20 pool it
                    sits exactly at the end of the bar; on a stable pool
                    it sits at the equal-share centroid. */}
                <Box
                  bg="font.secondary"
                  h="100%"
                  left={`${targetWeight * 100}%`}
                  opacity={0.5}
                  position="absolute"
                  top={0}
                  w="1px"
                />
              </Box>
            </Box>
          )
        })}
      </VStack>
    </TypeSection>
  )
}

export function PoolStatePanel({
  poolDetail,
  state,
}: {
  poolDetail: PoolPageData['poolDetail']
  state: PoolPageData['state']
}): React.JSX.Element {
  const u = state.universal
  const v2 = state.v2Base
  const s = state.stable
  const isV3 = poolDetail.protocolVersion === 3
  const isV2 = poolDetail.protocolVersion === 2

  // Surface paused / recovery / active across both protocol versions. V2
  // pre-fork pools have `isInRecoveryMode: null` (the call reverted), so we
  // only show the recovery badge when the value is unambiguously true.
  const isPaused = u?.isPaused ?? v2?.isPaused ?? false
  const isInRecovery = u?.isInRecoveryMode ?? v2?.isInRecoveryMode ?? false
  const hasAnyState = u || v2

  // ── Inline manage buttons (ops.balancer.fi payload builders) ────────
  // Previously these lived in a dedicated "Manage parameters" card;
  // pulled into the relevant section cards now (fee setter → Fee
  // parameters, surge tuning → StableSurge hook, AutoRange payload →
  // AutoRange) so the card grid stays compact and each action sits next
  // to the values it changes.
  const opsNetwork = poolDetail.chain.toLowerCase()
  // All four payload builders below now accept `?network=&pool=` query
  // params to preload the target pool. Keep this consistent across every
  // ManageButton so users land on the correct pool's form, not an empty one.
  const opsQuery = `?network=${opsNetwork}&pool=${poolDetail.address}`
  const feeSetterButton = (
    <ManageButton
      link={
        poolDetail.protocolVersion === 3
          ? {
              label: 'Set static swap fee',
              hint: 'V3 fee-setter payload builder',
              href: `${OPS_BASE}/payload-builder/fee-setter-v3${opsQuery}`,
            }
          : {
              label: 'Set static swap fee',
              hint: 'V2 fee-setter payload builder',
              href: `${OPS_BASE}/payload-builder/fee-setter${opsQuery}`,
            }
      }
    />
  )
  const surgeManageButton = state.stableSurge ? (
    <ManageButton
      link={{
        label: 'Tune StableSurge thresholds',
        hint: 'Surge hook payload builder',
        href: `${OPS_BASE}/hooks/stable-surge${opsQuery}`,
      }}
    />
  ) : null
  const autoRangeManageButton = state.reclamm ? (
    <ManageButton
      link={{
        label: 'Manage AutoRange',
        hint: 'AutoRange payload builder',
        href: `${OPS_BASE}/payload-builder/autorange${opsQuery}`,
      }}
    />
  ) : null
  // Amp-factor update is V3 STABLE-only.
  const ampUpdateButton =
    isV3 && s ? (
      <ManageButton
        link={{
          label: 'Update amp factor',
          hint: 'V3 amplification-factor update payload builder',
          href: `${OPS_BASE}/payload-builder/amp-factor-update-v3${opsQuery}`,
        }}
      />
    ) : null

  // Buffer sections — one section per ERC4626 token. The buffer-state
  // RPC read fires on the page and resolves to `null` for chains without
  // a VaultExplorer entry; the section renders capacity-bars-only in
  // that case so users still see maxDeposit/maxWithdraw context.
  const wrappedTokens = isV3 ? poolDetail.tokens.filter(t => t.isErc4626) : []
  const buffersByAddress = new Map<string, BufferState>()
  if (state.bufferStates) {
    for (const b of state.bufferStates) buffersByAddress.set(b.wrappedToken.toLowerCase(), b)
  }
  const bufferSections = wrappedTokens.map(token => (
    <BufferSection
      buffer={buffersByAddress.get(token.address.toLowerCase()) ?? null}
      key={token.address}
      manageButton={
        <ManageButton
          link={{
            label: 'Manage buffer',
            hint: 'Buffer management payload builder on ops.balancer.fi',
            href: `${OPS_BASE}/payload-builder/manage-buffer?network=${opsNetwork}&token=${token.address}`,
          }}
        />
      }
      token={token}
    />
  ))

  // Each `state.*` slot is at most one block per pool — gather the
  // type-specific Card to render in the grid as a single ReactNode so
  // the grid composition stays declarative below.
  let typeSpecificCard: React.ReactNode = null
  if (state.weighted) {
    typeSpecificCard = (
      <WeightedSection tokens={poolDetail.tokens} weighted={state.weighted} />
    )
  } else if (state.gyroEclp) {
    typeSpecificCard = <GyroEclpSection eclp={state.gyroEclp} />
  } else if (state.reclamm) {
    typeSpecificCard = (
      <AutoRangeSection
        manageButton={autoRangeManageButton}
        rc={state.reclamm}
        tokens={poolDetail.tokens}
      />
    )
  } else if (state.lbp) {
    typeSpecificCard = <LbpSection lbp={state.lbp} tokens={poolDetail.tokens} />
  } else if (state.quantAmm) {
    typeSpecificCard = <QuantAmmSection qa={state.quantAmm} tokens={poolDetail.tokens} />
  }

  return (
    // No outer Card — the heading floats above a grid of independent
    // section cards (frontend-v3 PoolInfo pattern). Manage stays
    // full-width because its action rows benefit from horizontal space;
    // the rest live in a 2-column grid that wraps on narrow viewports.
    <VStack align="stretch" spacing="md" w="full">
      <Flex align="center" justify="space-between">
        <Heading fontSize="1.25rem" variant="h4">
          Current state
        </Heading>
        {hasAnyState && (
          <HStack spacing="xs">
            {isPaused && <Badge colorScheme="red">paused</Badge>}
            {isInRecovery && <Badge colorScheme="orange">recovery</Badge>}
            {!isPaused && !isInRecovery && <Badge colorScheme="green">active</Badge>}
          </HStack>
        )}
      </Flex>

      {isV3 && !u && (
        <Text color="font.secondary" fontSize="sm">
          Current state unavailable — VaultExplorer not configured for {poolDetail.chain}.
        </Text>
      )}

      {isV2 && !v2 && (
        <Text color="font.secondary" fontSize="sm">
          Current state unavailable — V2 pool reads failed.
        </Text>
      )}

      {/* Section cards — each is a peer in the 2-col grid. Manage
          actions live inside the section they affect rather than in a
          separate Manage card (fee setter → Fee parameters; surge
          tuning → StableSurge hook; AutoRange payload → AutoRange). */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing="md" w="full">
        {u && (
          <TypeSection
            badge={
              poolDetail.disableUnbalancedLiquidity ? (
                <Tooltip
                  hasArrow
                  label="This pool only accepts proportional add / remove liquidity. Unbalanced operations are rejected by the pool's LiquidityManagement config."
                  openDelay={250}
                >
                  <Badge colorScheme="purple" cursor="help" fontSize="xs">
                    proportional only
                  </Badge>
                </Tooltip>
              ) : undefined
            }
            title="Fee parameters"
          >
            <StateRow
              hint={
                s && (s.swapFeeMin || s.swapFeeMax)
                  ? `bounds: ${formatPercent(s.swapFeeMin)} – ${formatPercent(s.swapFeeMax)}`
                  : undefined
              }
              label="Swap fee"
              value={formatPercent(u.swapFeePercentage)}
            />
            <StateRow
              hint="protocol + creator on swaps"
              label="Aggregate swap fee"
              value={formatPercent(u.aggregateSwapFeePercentage)}
            />
            <StateRow
              hint="protocol + creator on rate-provider yield"
              label="Aggregate yield fee"
              value={formatPercent(u.aggregateYieldFeePercentage)}
            />
            {poolDetail.bptPriceRate && (
              <StateRow
                hint="LP token share price (rate-provider scaled)"
                label="BPT rate"
                value={formatRate(poolDetail.bptPriceRate)}
              />
            )}
            {s && <AmpFactorRows stable={s} />}
            {(u.poolCreatorSwapFeePercentage !== null ||
              u.poolCreatorYieldFeePercentage !== null) && (
              <>
                <StateRow
                  label="Pool-creator swap"
                  value={formatPercent(u.poolCreatorSwapFeePercentage)}
                />
                <StateRow
                  label="Pool-creator yield"
                  value={formatPercent(u.poolCreatorYieldFeePercentage)}
                />
              </>
            )}
            {feeSetterButton}
            {ampUpdateButton}
          </TypeSection>
        )}

        {v2 && (
          <TypeSection title="Fee parameters">
            <StateRow label="Swap fee" value={formatPercent(v2.swapFeePercentage)} />
            {v2.protocolSwapFeeCache !== null && (
              <StateRow
                hint="last cached value on this pool"
                label="Protocol swap fee"
                value={formatPercent(v2.protocolSwapFeeCache)}
              />
            )}
            {v2.protocolYieldFeeCache !== null && v2.protocolYieldFeeCache !== '0' && (
              <StateRow
                hint="last cached value on this pool"
                label="Protocol yield fee"
                value={formatPercent(v2.protocolYieldFeeCache)}
              />
            )}
            {v2.pauseWindowEndTime > 0 && (
              <StateRow
                hint="emergency pause is available until"
                label="Pause window ends"
                value={formatTimestamp(v2.pauseWindowEndTime)}
              />
            )}
            {s && <AmpFactorRows stable={s} />}
            {feeSetterButton}
          </TypeSection>
        )}

        <PermissionsSection poolDetail={poolDetail} />

        {/* Composition + rate providers — most informative on stable pools
            but cheap on every type, so we render whenever the underlying
            data is present. Composition runs off api-v3's balanceUSD;
            rate providers gate on at least one non-zero provider so plain
            weighted pools don't get an empty card. */}
        {hasAnyRateProvider(poolDetail.tokens) && (
          <RateProvidersSection
            chain={poolDetail.chain as string}
            tokenInfo={s?.tokenInfo ?? null}
            tokens={poolDetail.tokens}
          />
        )}

        <PoolBalancesSection tokens={poolDetail.tokens} />

        {typeSpecificCard}

        {state.stableSurge && (
          <StableSurgeSection
            manageButton={surgeManageButton}
            ss={state.stableSurge}
            tokens={poolDetail.tokens}
          />
        )}

        {bufferSections}
      </SimpleGrid>
    </VStack>
  )
}

/** Any non-zero rate provider gates the Rate providers section so plain
 *  weighted pools — which leave every token's `priceRateProvider` at the
 *  zero address — don't render an empty card. */
function hasAnyRateProvider(tokens: PoolDetailToken[]): boolean {
  return tokens.some(
    t => t.priceRateProvider && t.priceRateProvider.toLowerCase() !== ZERO_ADDR
  )
}
