'use client'

import { Flex, Box } from '@chakra-ui/react'
import Image from 'next/image'
import { PoolVersionTag } from '../../PoolList/PoolListTable/PoolVersionTag'
import { PoolListTokenPills } from '../../PoolList/PoolListTokenPills'
import { usePool } from '../../PoolProvider'
import { PoolHookTag } from '../PoolHookTag'
import { PoolTypeTag } from '../PoolTypeTag'
import { PoolSwapFees } from './PoolSwapFees'

export default function PoolMetaBadges() {
  const { pool, chain } = usePool()

  return (
    <Flex alignItems="center" gap={{ base: 'xs', sm: '6px' }} wrap="wrap">
      <Image
        alt={`Chain icon for ${chain.toLowerCase()}`}
        height={24}
        src={`/images/chains/${chain}.svg`}
        width={24}
      />
      <Box pr="xxs">
        <PoolVersionTag isSmall pool={pool} />
      </Box>

      <PoolListTokenPills pool={pool} px="sm" py="2" />

      <PoolTypeTag pool={pool} />
      <PoolHookTag pool={pool} />
      {/* {!shouldHideSwapFee(pool.type) && <PoolSwapFees pool={pool} />} */}
    </Flex>
  )
}
