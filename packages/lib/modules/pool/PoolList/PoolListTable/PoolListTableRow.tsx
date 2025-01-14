import { Badge, Box, Grid, GridItem, GridProps, HStack, Text, Image } from '@chakra-ui/react'
import { PollListTableDetailsCell } from '@repo/lib/modules/pool/PoolList/PoolListTable/PollListTableDetailsCell'
import { TokenIcon } from '@repo/lib/modules/tokens/TokenIcon'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import MainAprTooltip from '@repo/lib/shared/components/tooltips/apr-tooltip/MainAprTooltip'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import Link from 'next/link'
import { memo } from 'react'
import { usePoolMetadata } from '../../metadata/usePoolMetadata'
import { POOL_TAG_MAP, PoolListDisplayType, PoolListItem } from '../../pool.types'
import { getPoolPath } from '../../pool.utils'
import { getUserTotalBalanceUsd } from '../../user-balance.helpers'
import { usePoolList } from '../PoolListProvider'
import { PoolListTokenPills } from '../PoolListTokenPills'
import { getUserReferenceTokens } from '../../pool-tokens.utils'

interface Props extends GridProps {
  pool: PoolListItem
  keyValue: number
  needsMarginForPoints?: boolean
}

const MemoizedMainAprTooltip = memo(MainAprTooltip)

function PoolName({ pool }: { pool: PoolListItem }) {
  const isFirstToken = (index: number) => index === 0
  const displayTokens = getUserReferenceTokens(pool)
  const zIndices = Array.from({ length: displayTokens.length }, (_, index) => index).reverse()

  return (
    <HStack>
      {displayTokens.map((token, i) => (
        <Box key={token.address} ml={isFirstToken(i) ? 0 : -3} zIndex={zIndices[i]}>
          <TokenIcon
            address={token.address}
            alt={token.symbol}
            chain={pool.chain}
            size={20}
            weight={token.weight}
          />
        </Box>
      ))}
      <Text fontWeight="medium" textAlign="left">
        {pool.name}
      </Text>
    </HStack>
  )
}

export function PoolListTableRow({ pool, keyValue, needsMarginForPoints, ...rest }: Props) {
  const {
    queryState: { userAddress },
    displayType,
  } = usePoolList()
  const { name } = usePoolMetadata(pool)
  const { toCurrency } = useCurrency()

  const hasPoints = pool.tags?.some(tag => tag && POOL_TAG_MAP.POINTS.includes(tag))

  return (
    <FadeInOnView>
      <Box
        _hover={{
          bg: 'background.level0',
        }}
        key={keyValue}
        px={{ base: '0', sm: 'md' }}
        rounded="md"
        transition="all 0.2s ease-in-out"
        w="full"
      >
        <Link href={getPoolPath(pool)} prefetch>
          <Grid {...rest} pr="4" py={{ base: 'ms', md: 'md' }}>
            <GridItem>
              <NetworkIcon chain={pool.chain} size={6} />
            </GridItem>
            <GridItem>
              {displayType === PoolListDisplayType.TokenPills && (
                <PoolListTokenPills
                  h={['32px', '36px']}
                  iconSize={name ? 24 : 20}
                  nameSize="sm"
                  p={['xxs', 'sm']}
                  pool={pool}
                  pr={[1.5, 'ms']}
                />
              )}
              {displayType === PoolListDisplayType.Name && <PoolName pool={pool} />}
            </GridItem>
            <GridItem minW="32">
              <PollListTableDetailsCell pool={pool} />
            </GridItem>
            {userAddress ? (
              <GridItem>
                <Text fontWeight="medium" textAlign="right">
                  {toCurrency(getUserTotalBalanceUsd(pool), { abbreviated: false })}
                </Text>
              </GridItem>
            ) : null}
            <GridItem>
              <Text
                fontWeight="medium"
                textAlign="right"
                title={toCurrency(pool.dynamicData.totalLiquidity, { abbreviated: false })}
              >
                {toCurrency(pool.dynamicData.totalLiquidity)}
              </Text>
            </GridItem>
            <GridItem textAlign="right">
              <Text
                fontWeight="medium"
                textAlign="right"
                title={toCurrency(pool.dynamicData.volume24h, { abbreviated: false })}
              >
                {toCurrency(pool.dynamicData.volume24h)}
              </Text>
            </GridItem>
            <GridItem justifySelf="end" pr={{ base: 'md', xl: '0' }}>
              <HStack gap="xxs" mr={needsMarginForPoints && !hasPoints ? '30px' : '0'}>
                <MemoizedMainAprTooltip
                  aprItems={pool.dynamicData.aprItems}
                  height="auto"
                  pool={pool}
                  poolId={pool.id}
                  textProps={{ fontWeight: 'medium', textAlign: 'right' }}
                />
                {hasPoints && (
                  <Badge
                    alignItems="center"
                    bg="background.level2"
                    // borderColor="border.base"
                    borderRadius="full"
                    // borderWidth={1}
                    display="flex"
                    p="xxs"
                    shadow="sm"
                    textTransform="none"
                  >
                    <Image alt="points" h="6" src="/images/icons/pool-points.svg" w="6" />
                  </Badge>
                )}
              </HStack>
            </GridItem>
          </Grid>
        </Link>
      </Box>
    </FadeInOnView>
  )
}
