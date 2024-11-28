'use client'

import {
  Badge,
  Flex,
  HStack,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@chakra-ui/react'
import { usePool } from '../../PoolProvider'
import Image from 'next/image'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { Repeat } from 'react-feather'
import { PoolListTokenPills } from '../../PoolList/PoolListTokenPills'
import { shouldHideSwapFee } from '../../pool.utils'
import { getChainShortName } from '@repo/lib/config/app.config'
import { PoolTypeTag } from '../PoolTypeTag'
import { PoolVersionTag } from '../../PoolList/PoolListTable/PoolVersionTag'
import { PoolHookTag } from '../PoolHookTag'
import { GqlPoolTokenDetail } from '@repo/lib/shared/services/api/generated/graphql'

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
      <PoolHookTag
        chain={pool.chain}
        poolHook={pool.hook}
        poolTokens={pool.poolTokens as GqlPoolTokenDetail[]}
      />
      {!shouldHideSwapFee(pool.type) && (
        <Popover trigger="hover">
          <PopoverTrigger>
            <Badge
              alignItems="center"
              background="background.level2"
              border="1px solid"
              borderColor="border.base"
              display="flex"
              fontWeight="normal"
              h={{ base: '28px' }}
              px="sm"
              py="sm"
              rounded="full"
              shadow="sm"
            >
              <HStack color="font.primary">
                <Repeat size={12} />
                <Text fontSize="xs">{fNum('feePercent', pool.dynamicData.swapFee)}</Text>
              </HStack>
            </Badge>
          </PopoverTrigger>
          <PopoverContent maxW="300px" p="sm" w="auto">
            <Text fontSize="sm" variant="secondary">
              The swap fee rate earned by Liquidity Providers anytime a swap is routed through this
              pool. These fees automatically accumulate into each LP&rsquo;s position.
            </Text>
          </PopoverContent>
        </Popover>
      )}
    </Flex>
  )
}
