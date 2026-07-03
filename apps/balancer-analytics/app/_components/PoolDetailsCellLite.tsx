'use client'

import { Box, HStack, Text } from '@chakra-ui/react'
import { GqlPoolTypeValues } from '@repo/lib/shared/services/api/graphql-enums'
import { BalBadge } from '@repo/lib/shared/components/badges/BalBadge'
import { PoolVersionTag } from '@repo/lib/modules/pool/PoolList/PoolListTable/PoolVersionTag'
import { getPoolTypeLabel } from '@repo/lib/modules/pool/pool.utils'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { BoostedIcon } from '@repo/lib/shared/components/icons/BoostedIcon'
import { HookIcon } from '@repo/lib/shared/components/icons/HookIcon'
import { ProtocolIcon } from '@repo/lib/shared/components/icons/ProtocolIcon'
import { Protocol } from '@repo/lib/modules/protocols/useProtocols'
import { TooltipWithTouch } from '@repo/lib/shared/components/tooltips/TooltipWithTouch'
import { isBoosted, isGyro, isQuantAmmPool } from '@repo/lib/modules/pool/pool.helpers'
import type { EnrichedPool, ExplorerPool } from '@analytics/lib/hooks/usePoolExplorer'

const HOOK_LABEL: Record<string, string> = {
  STABLE_SURGE: 'StableSurge',
  MEV_TAX: 'MEV tax',
  FEE_TAKING: 'Fee taking',
  EXIT_FEE: 'Exit fee',
  DIRECTIONAL_FEE: 'Directional fee',
  AKRON: 'Akron',
  LBP: 'LBP',
  FIXED_LBP: 'Fixed LBP',
  LOTTERY: 'Lottery',
  NFTLIQUIDITY_POSITION: 'NFT liquidity',
  RECLAMM: 'AutoRange',
  VEBAL_DISCOUNT: 'veBAL discount',
}

function formatHookLabel(type: string | null): string {
  if (!type) return ''
  return (
    HOOK_LABEL[type] ??
    type
      .split('_')
      .map(p => p.charAt(0) + p.slice(1).toLowerCase())
      .join(' ')
  )
}

// Local rebrand override — keeps in lockstep with PoolExplorerFilters.
function formatPoolTypeLabel(t: GqlPoolType | string): string {
  if (t === GqlPoolTypeValues.Reclamm) return 'AutoRange'
  return getPoolTypeLabel(t as GqlPoolType)
}

// Accepts either the explorer's `EnrichedPool` (carries `_hookType`) or any
// `GetPoolsQuery['pools'][number]` shape directly. The portfolio table
// reuses this cell against raw query rows, which don't go through `enrich()`.
type PoolDetailsInput = (ExplorerPool | EnrichedPool) & { _hookType?: string | null }

// Mirrors `PoolListTableDetailsCell` in `@repo/lib`: version tag · type label ·
// boosted/gyro/quantamm icons · hook chip. Uses `PoolHookTag` would need
// HooksProvider, so we render a lightweight hook chip from `pool.hook.type`.
export function PoolDetailsCellLite({ pool }: { pool: PoolDetailsInput }) {
  const hookType = pool._hookType ?? pool.hook?.type ?? null
  const hookLabel = formatHookLabel(hookType)
  const showGyro = isGyro(pool.type)
  const showQuant = isQuantAmmPool(pool.type)
  const showBoosted = isBoosted(pool)
  const hasIcon = showGyro || showQuant || showBoosted

  return (
    <HStack gap="0.25rem" wrap="wrap">
      <Box pr="0.1875rem">
        <PoolVersionTag isSmall pool={pool} />
      </Box>
      <Text fontWeight="medium" textAlign="left">
        {formatPoolTypeLabel(pool.type)}
      </Text>
      {hasIcon && (
        <HStack gap="0.25rem">
          {showGyro && (
            <TooltipWithTouch label="Built by Gyroscope">
              <Box h="18px" rounded="full" shadow="md" w="18px">
                <ProtocolIcon
                  protocol={Protocol.Gyro}
                  size={18}
                  sx={{ rounded: 'full', shadow: 'md' }}
                />
              </Box>
            </TooltipWithTouch>
          )}
          {showQuant && (
            <TooltipWithTouch label="Built by QuantAMM">
              <Box rounded="full" shadow="md">
                <ProtocolIcon
                  protocol={Protocol.QuantAmm}
                  size={18}
                  sx={{ rounded: 'full', shadow: 'md' }}
                />
              </Box>
            </TooltipWithTouch>
          )}
          {showBoosted && (
            <TooltipWithTouch label="Boosted (ERC-4626)">
              <Box rounded="full" shadow="md">
                <BoostedIcon size={18} />
              </Box>
            </TooltipWithTouch>
          )}
        </HStack>
      )}
      {hookType && (
        <>
          <Text color="border.base" fontSize="0.5rem">
            •
          </Text>
          <TooltipWithTouch label={`${hookLabel} hook`}>
            <BalBadge
              color="font.secondary"
              fontSize="xs"
              gap="xs"
              h="20px"
              px="xs"
              py="0"
            >
              <HookIcon size={12} />
              <Text color="font.secondary" fontSize="xs">
                {hookLabel}
              </Text>
            </BalBadge>
          </TooltipWithTouch>
        </>
      )}
    </HStack>
  )
}
