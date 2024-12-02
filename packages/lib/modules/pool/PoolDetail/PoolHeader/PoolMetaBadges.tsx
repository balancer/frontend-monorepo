'use client'

import { Badge, Flex } from '@chakra-ui/react'
import { usePool } from '../../PoolProvider'
import Image from 'next/image'
import { PoolListTokenPills } from '../../PoolList/PoolListTokenPills'
import { shouldHideSwapFee } from '../../pool.utils'
import { getChainShortName } from '@repo/lib/config/app.config'
import { PoolTypeTag } from '../PoolTypeTag'
import { PoolVersionTag } from '../../PoolList/PoolListTable/PoolVersionTag'
import { PoolHookTag } from '../PoolHookTag'
import { PoolSwapFees } from './PoolSwapFees'

export default function PoolMetaBadges() {
  const { pool, chain } = usePool()

  return (
    <Flex alignItems="center" gap={{ base: 'xs', sm: 'sm' }} wrap="wrap">
      <Badge
        background="background.level2"
        border="1px solid"
        borderColor="border.base"
        px="2.5"
        py="2.5"
        rounded="full"
        shadow="sm"
        title={getChainShortName(chain)}
      >
        <Image
          alt={`Chain icon for ${chain.toLowerCase()}`}
          height={20}
          src={`/images/chains/${chain}.svg`}
          width={20}
        />
      </Badge>
      <PoolListTokenPills pool={pool} px="sm" py="2" />
      <PoolVersionTag isSmall pool={pool} />
      <PoolTypeTag pool={pool} />
      <PoolHookTag />
      {!shouldHideSwapFee(pool.type) && <PoolSwapFees pool={pool} />}
    </Flex>
  )
}
