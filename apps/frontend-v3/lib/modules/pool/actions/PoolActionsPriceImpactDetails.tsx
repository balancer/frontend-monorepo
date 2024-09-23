import { NumberText } from '@/lib/shared/components/typography/NumberText'
import { fNum, bn } from '@/lib/shared/utils/numbers'
import { HStack, VStack, Text, Tooltip, Icon, Box, Skeleton } from '@chakra-ui/react'
import { usePriceImpact } from '@/lib/modules/price-impact/PriceImpactProvider'
import { useUserSettings } from '@/lib/modules/user/settings/UserSettingsProvider'
import { useCurrency } from '@/lib/shared/hooks/useCurrency'
import { usePool } from '../PoolProvider'
import { ArrowRight } from 'react-feather'
import { calcShareOfPool, calcUserShareOfPool } from '../pool.helpers'
import { isNumber } from 'lodash'
import { InfoIcon } from '@/lib/shared/components/icons/InfoIcon'

interface PoolActionsPriceImpactDetailsProps {
  bptAmount: bigint | undefined
  totalUSDValue: string
  isAddLiquidity?: boolean
  isLoading?: boolean
}

export function PoolActionsPriceImpactDetails({
  bptAmount,
  totalUSDValue,
  isAddLiquidity = false,
  isLoading = false,
}: PoolActionsPriceImpactDetailsProps) {
  const { slippage } = useUserSettings()
  const { toCurrency } = useCurrency()
  const { pool } = usePool()

  const { priceImpactLevel, priceImpactColor, PriceImpactIcon, priceImpact } = usePriceImpact()

  const priceImpactLabel = isNumber(priceImpact) ? fNum('priceImpact', priceImpact) : '-'

  const priceImpactUsd = bn(priceImpact || 0).times(totalUSDValue)
  const maxSlippageUsd = bn(slippage).div(100).times(totalUSDValue)

  const changedShareOfPool = calcShareOfPool(pool, bptAmount || 0n)
  const currentShareOfPool = calcUserShareOfPool(pool)

  const futureShareOfPool = isAddLiquidity
    ? currentShareOfPool.plus(changedShareOfPool)
    : currentShareOfPool.minus(changedShareOfPool)

  return (
    <VStack spacing="sm" align="start" w="full" fontSize="sm">
      <HStack justify="space-between" w="full">
        <Text color="grayText">Price impact</Text>
        <HStack>
          {isLoading ? (
            <Skeleton w="40px" h="16px" />
          ) : priceImpactLevel === 'unknown' ? (
            <Text>Unknown</Text>
          ) : (
            <NumberText color={priceImpactColor}>
              {toCurrency(priceImpactUsd, { abbreviated: false })} ({priceImpactLabel})
            </NumberText>
          )}
          <Tooltip
            label="In general, adding or removing liquidity in proportional amounts to the token weights
                of the pool incur low price impact. Adding custom token amounts (non-proportionally)
                causes the internal prices of the pool to change, as if you were swapping tokens, which 
                incurs a higher price impact."
            fontSize="sm"
          >
            {priceImpactLevel === 'low' ? (
              <InfoIcon />
            ) : (
              <Box>
                <PriceImpactIcon priceImpactLevel={priceImpactLevel} />
              </Box>
            )}
          </Tooltip>
        </HStack>
      </HStack>
      <HStack justify="space-between" w="full">
        <Text color="grayText">Max slippage</Text>
        <HStack>
          {isLoading ? (
            <Skeleton w="40px" h="16px" />
          ) : (
            <NumberText color="grayText">
              {toCurrency(maxSlippageUsd, { abbreviated: false })} ({fNum('slippage', slippage)})
            </NumberText>
          )}
          <Tooltip
            label="Slippage occurs when market conditions change between the time your order is
                submitted and the time it gets executed on-chain. Slippage tolerance is the
                maximum change in price you are willing to accept."
            fontSize="sm"
          >
            <InfoIcon />
          </Tooltip>
        </HStack>
      </HStack>
      <HStack justify="space-between" w="full">
        <Text color="grayText">Share of pool</Text>
        <HStack>
          <HStack gap="0.5">
            {isLoading ? (
              <Skeleton w="40px" h="16px" />
            ) : (
              <>
                <NumberText color="grayText">{fNum('sharePercent', currentShareOfPool)}</NumberText>
                <Icon as={ArrowRight} color="grayText" />
                <NumberText color="grayText">{fNum('sharePercent', futureShareOfPool)}</NumberText>
              </>
            )}
          </HStack>
          <Tooltip
            label="The percentage of the pool that you will own after this transaction."
            fontSize="sm"
          >
            <InfoIcon />
          </Tooltip>
        </HStack>
      </HStack>
    </VStack>
  )
}
