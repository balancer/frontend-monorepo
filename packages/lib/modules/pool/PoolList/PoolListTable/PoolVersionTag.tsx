import { Center, Text } from '@chakra-ui/react'
import { BalBadge } from '@repo/lib/shared/components/badges/BalBadge'
import { CowIcon } from '@repo/lib/shared/components/icons/logos/CowIcon'
import { isCowAmmPool } from '../../pool.helpers'
import { PoolListItem } from '../../pool.types'
import { Pool } from '../../pool.types'

function getPoolVersionLabel(pool: Pick<PoolListItem | Pool, 'type' | 'protocolVersion'>) {
  if (isCowAmmPool(pool.type)) {
    return <CowIcon size={18} />
  } else if (pool.protocolVersion === 3) {
    return 'v3'
  } else if (pool.protocolVersion === 2) {
    return 'v2'
  } else {
    return null
  }
}

const v3BadgeStyles = {
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '-1px',
    padding: '1px',
    borderRadius: 'inherit',
    background: 'background.special',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    transition: 'all 0.2s var(--ease-out-cubic)',
    zIndex: '0',
  },
  '[role="group"]:hover &::before': {
    transition: 'all 0.2s var(--ease-out-cubic)',
    padding: '1.5px',
    animation: 'rotateMaskedBg 1s ease-in-out infinite',
  },
  '@keyframes rotateMaskedBg': {
    '0%': {
      transform: 'rotate(0deg)',
      background: 'background.special',
    },
    '25%': {
      background: 'background.special',
    },
    '50%': {
      transform: 'rotate(180deg)',
      background: 'background.special',
    },
    '75%': {
      background: 'background.special',
    },
    '100%': {
      transform: 'rotate(360deg)',
      background: 'background.special',
    },
  },
}

export function PoolVersionTag({
  pool,
  isSmall,
}: {
  pool: Pick<PoolListItem | Pool, 'protocolVersion' | 'type'>
  isSmall?: boolean
}) {
  const label = getPoolVersionLabel(pool)
  if (!label) return null

  const size = isSmall ? '6' : '7'
  const isV3 = pool.protocolVersion === 3
  const isCow = isCowAmmPool(pool.type)

  return (
    <BalBadge
      color="font.secondary"
      fontSize="xs"
      h={size}
      p="0"
      sx={isV3 ? v3BadgeStyles : undefined}
      textTransform="lowercase"
      w={size}
    >
      <Center h="full" w="full">
        <Text
          _groupHover={{
            fontWeight: isV3 ? 'bold' : 'medium',
            background: isCow ? 'auto' : isV3 ? 'background.special' : 'font.maxContrast',
            color: isCow ? 'font.maxContrast' : 'auto',
            backgroundClip: isCow ? 'unset' : 'text',
          }}
          background={isCow ? 'auto' : isV3 ? 'font.special' : 'font.secondary'}
          backgroundClip={isCow ? 'unset' : 'text'}
          fontSize="xs"
          fontWeight="medium"
          transition="all 0.2s var(--ease-out-cubic)"
          zIndex={1}
        >
          {label}
        </Text>
      </Center>
    </BalBadge>
  )
}
