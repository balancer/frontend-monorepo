import { NumberText } from '@repo/lib/shared/components/typography/NumberText'
import { fNum, bn } from '@repo/lib/shared/utils/numbers'
import {
  HStack,
  VStack,
  Text,
  Icon,
  Box,
  Skeleton,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@chakra-ui/react'
import { usePriceImpact } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { usePool } from '../PoolProvider'
import { ArrowRight } from 'react-feather'
import { calcFutureUserShareOfPool, calcUserShareOfPool } from '../pool.helpers'
import { isNumber } from 'lodash'
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'
import { formatUnits } from 'viem'
import { BPT_DECIMALS } from '../pool.constants'

interface PoolActionsPriceImpactDetailsProps {
  bptAmount: bigint | undefined
  totalUSDValue: string
  slippage: string
  isAddLiquidity?: boolean
  isLoading?: boolean
  isSummary?: boolean
}

export function PoolActionsPriceImpactDetails({
  bptAmount,
  totalUSDValue,
  slippage,
  isAddLiquidity = false,
  isLoading = false,
  isSummary = false,
}: PoolActionsPriceImpactDetailsProps) {
  const { toCurrency } = useCurrency()
  const { pool } = usePool()

  const { priceImpactLevel, priceImpactColor, PriceImpactIcon, priceImpact } = usePriceImpact()

  const priceImpactLabel = isNumber(priceImpact) ? fNum('priceImpact', priceImpact) : '-'

  const priceImpactUsd = bn(priceImpact || 0).times(totalUSDValue)
  const maxSlippageUsd = bn(slippage).div(100).times(totalUSDValue)

  const currentShareOfPool = calcUserShareOfPool(pool)

  const futureShareOfPool = calcFutureUserShareOfPool(
    pool,
    bn(bptAmount || 0n).multipliedBy(isAddLiquidity ? 1 : -1)
  )

  const priceImpactTooltip =
    priceImpactLevel === 'unknown'
      ? 'The price impact cannot be calculated. This may be a temporary issue related to a pricing provider or unknown token. Only proceed if you understand and accept the risks.'
      : 'In general, adding or removing liquidity in proportional amounts to the token  weights of the pool incur low price impact. Adding custom token amounts (non-proportionally) causes the internal prices of the pool to change, as if you were swapping tokens, which incurs a higher price impact.'

  return (
    <VStack align="start" fontSize="sm" spacing="sm" w="full">
      <HStack justify="space-between" w="full">
        <Text color="grayText">Price impact</Text>
        <HStack>
          {isLoading ? (
            <Skeleton h="16px" w="40px" />
          ) : priceImpactLevel === 'unknown' ? (
            <Text>Unknown</Text>
          ) : (
            <NumberText color={priceImpactColor}>
              {toCurrency(priceImpactUsd, { abbreviated: false })} ({priceImpactLabel})
            </NumberText>
          )}
          <Popover trigger="hover">
            <PopoverTrigger>
              {priceImpactLevel === 'low' ? (
                <Box
                  _hover={{ opacity: 1 }}
                  opacity="0.5"
                  transition="opacity 0.2s var(--ease-out-cubic)"
                >
                  <InfoIcon />
                </Box>
              ) : (
                <Box>
                  <PriceImpactIcon priceImpactLevel={priceImpactLevel} />
                </Box>
              )}
            </PopoverTrigger>
            <PopoverContent maxW="300px" p="sm" w="auto">
              <Text fontSize="sm" variant="secondary">
                {priceImpactTooltip}
              </Text>
            </PopoverContent>
          </Popover>
        </HStack>
      </HStack>
      <HStack justify="space-between" w="full">
        <Text color="grayText">Max slippage</Text>
        <HStack>
          {isLoading ? (
            <Skeleton h="16px" w="40px" />
          ) : (
            <NumberText color="grayText">
              {toCurrency(maxSlippageUsd, { abbreviated: false })} ({fNum('slippage', slippage)})
            </NumberText>
          )}
          <Popover trigger="hover">
            <PopoverTrigger>
              <Box
                _hover={{ opacity: 1 }}
                opacity="0.5"
                transition="opacity 0.2s var(--ease-out-cubic)"
              >
                <InfoIcon />
              </Box>
            </PopoverTrigger>
            <PopoverContent maxW="300px" p="sm" w="auto">
              <Text fontSize="sm" variant="secondary">
                Slippage occurs when market conditions change between the time your order is
                submitted and the time it gets executed on-chain. Slippage tolerance is the maximum
                change in price you are willing to accept.
              </Text>
            </PopoverContent>
          </Popover>
        </HStack>
      </HStack>
      {isAddLiquidity && !isSummary && (
        <HStack justify="space-between" w="full">
          <Text color="grayText">LP tokens (if no slippage)</Text>
          <HStack>
            <HStack gap="0.5">
              {isLoading || !bptAmount ? (
                <Skeleton h="16px" w="40px" />
              ) : (
                <NumberText color="grayText">
                  {fNum('token', formatUnits(bptAmount, BPT_DECIMALS))}
                </NumberText>
              )}
            </HStack>
            <Popover trigger="hover">
              <PopoverTrigger>
                <Box
                  _hover={{ opacity: 1 }}
                  opacity="0.5"
                  transition="opacity 0.2s var(--ease-out-cubic)"
                >
                  <InfoIcon />
                </Box>
              </PopoverTrigger>
              <PopoverContent maxW="300px" p="sm" w="auto">
                <Text fontSize="sm" variant="secondary">
                  LP tokens are digital assets which are issued to Liquidity Providers to represent
                  their share of the pool. LP tokens can be redeemed to reclaim the original tokens
                  plus certain types of accumulated yield (like swap fees).
                </Text>
              </PopoverContent>
            </Popover>
          </HStack>
        </HStack>
      )}
      <HStack justify="space-between" w="full">
        <Text color="grayText">Share of pool</Text>
        <HStack>
          <HStack gap="0.5">
            {isLoading ? (
              <Skeleton h="16px" w="40px" />
            ) : (
              <>
                <NumberText color="grayText">{fNum('sharePercent', currentShareOfPool)}</NumberText>
                <Icon as={ArrowRight} color="grayText" />
                <NumberText color="grayText">{fNum('sharePercent', futureShareOfPool)}</NumberText>
              </>
            )}
          </HStack>
          <Popover trigger="hover">
            <PopoverTrigger>
              <Box
                _hover={{ opacity: 1 }}
                opacity="0.5"
                transition="opacity 0.2s var(--ease-out-cubic)"
              >
                <InfoIcon />
              </Box>
            </PopoverTrigger>
            <PopoverContent maxW="300px" p="sm" w="auto">
              <Text fontSize="sm" variant="secondary">
                The percentage of the pool that you will own after this transaction.
              </Text>
            </PopoverContent>
          </Popover>
        </HStack>
      </HStack>
    </VStack>
  )
}
