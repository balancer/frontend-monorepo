'use client'

import { Badge, Flex, HStack, Text, Tooltip } from '@chakra-ui/react'
import { usePool } from '../../PoolProvider'
import Image from 'next/image'
import { fNum } from '@/lib/shared/utils/numbers'
import { Repeat } from 'react-feather'
import { PoolListTokenPills } from '../../PoolList/PoolListTokenPills'
import { shouldHideSwapFee } from '../../pool.utils'
import { getChainShortName } from '@/lib/config/app.config'

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
      {!shouldHideSwapFee(pool.type) && (
        <Tooltip label="Swap fee">
          <Badge
            alignItems="center"
            background="background.level2"
            border="1px solid"
            borderColor="border.base"
            display="flex"
            fontWeight="normal"
            h={{ base: '28px' }}
            px="sm"
            py="xs"
            rounded="full"
            shadow="sm"
          >
            <HStack color="font.primary">
              <Repeat size={12} />
              <Text fontSize="sm">{fNum('feePercent', pool.dynamicData.swapFee)}</Text>
            </HStack>
          </Badge>
        </Tooltip>
      )}
    </Flex>
  )
}
