'use client'

import { Flex, Box } from '@chakra-ui/react'
import Image from 'next/image'
import { PoolVersionTag } from '../../PoolList/PoolListTable/PoolVersionTag'
import { PoolListTokenPills } from '../../PoolList/PoolListTokenPills'
import { usePool } from '../../PoolProvider'
import { shouldHideSwapFee } from '../../pool.utils'
import { PoolHookTag } from '../PoolHookTag'
import { PoolTypeTag } from '../PoolTypeTag'
import { PoolSwapFees } from './PoolSwapFees'
import { TooltipWithTouch } from '@repo/lib/shared/components/tooltips/TooltipWithTouch'
import { getChainShortName } from '@repo/lib/config/app.config'

export default function PoolMetaBadges() {
  const { pool, chain } = usePool()
  const chainName = getChainShortName(chain)

  return (
    <Flex alignItems="center" gap={{ base: 'xs', sm: '6px' }} wrap="wrap">
      <TooltipWithTouch label={chainName}>
        <Image
          alt={`Chain icon for ${chain.toLowerCase()}`}
          height={24}
          src={`/images/chains/${chain}.svg`}
          width={24}
        />
      </TooltipWithTouch>
      <Box pr="xxs">
        <PoolVersionTag isSmall pool={pool} />
      </Box>

      <PoolListTokenPills pool={pool} px="sm" py="2" />

      <PoolTypeTag pool={pool} />
      <PoolHookTag pool={pool} />
      {!shouldHideSwapFee(pool.type) && <PoolSwapFees pool={pool} />}
    </Flex>
  )
}
