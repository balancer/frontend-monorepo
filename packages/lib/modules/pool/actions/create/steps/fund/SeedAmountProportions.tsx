import { Box, Card, CardRootProps, HStack, Text, VStack } from '@chakra-ui/react'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { BullseyeIcon } from '@repo/lib/shared/components/icons/BullseyeIcon'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { isWeightedPool, isCowPool } from '../../helpers'
import { useWatch } from 'react-hook-form'

const WEIGHT_DEVIATION_TOLERANCE = 5

const WEIGHT_COLORS = [
  'orange.300',
  'blue.300',
  'green.400',
  'red.300',
  'purple.300',
  'teal.300',
  'pink.300',
  'yellow.300',
]

type Props = { variant?: CardRootProps['variant']; displayAlert?: boolean }

export function SeedAmountProportions({ variant = 'level3', displayAlert = false }: Props) {
  const { poolCreationForm } = usePoolCreationForm()
  const [poolTokens, poolType] = useWatch({
    control: poolCreationForm.control,
    name: ['poolTokens', 'poolType'],
  })
  const { usdValueForTokenAddress } = useTokens()

  const tokenAmountToUsd = poolTokens.map(token => {
    const { data, address, amount } = token
    if (!address || !data) return { symbol: '', usdValue: 0 }
    const { chain, symbol } = data
    const usdValue = Number(usdValueForTokenAddress(address, chain, amount, token.usdPrice))
    return { symbol, usdValue }
  })

  const totalSeedUsdValue = tokenAmountToUsd.reduce((acc, token) => acc + token.usdValue, 0)

  const tokenAmountToUsdWithWeights = tokenAmountToUsd.map(token => ({
    ...token,
    usdWeight: totalSeedUsdValue ? (token.usdValue * 100) / totalSeedUsdValue : 0,
  }))

  const targetWeights = poolTokens.map(t => Number(t.weight))
  const usdWeights = tokenAmountToUsdWithWeights.map(t => t.usdWeight)

  const isAllWeightsCloseToTarget = targetWeights.every((weight, idx) => {
    const usdWeight = usdWeights[idx]
    return Math.abs(weight - usdWeight) < WEIGHT_DEVIATION_TOLERANCE
  })

  const showTargetWeights = isWeightedPool(poolType) || isCowPool(poolType)

  const isGoingToGetRekt =
    showTargetWeights && !isAllWeightsCloseToTarget && poolTokens.every(t => t.amount)

  return (
    <VStack gap="md" w="full">
      {displayAlert && isGoingToGetRekt && (
        <BalAlert
          content="If your deposit amounts don’t match the target pool weights, you risk losing funds to arbitrageurs. To avoid this, seed the pool with amounts in proportion to the target weights."
          status="error"
          title="You are likely to get rekt"
        />
      )}
      <Card.Root
        bg={isGoingToGetRekt ? '#EB3C3C0D' : 'background.level2'}
        border="1px solid"
        borderColor={isGoingToGetRekt ? 'red.400' : 'transparent'}
        shadow="sm"
        variant={variant}
      >
        <Card.Body>
          <VStack gap="md">
            <WeightsPercentageLabels
              tokens={tokenAmountToUsdWithWeights.map(t => ({
                symbol: t.symbol,
                weight: t.usdWeight,
              }))}
            />

            <WeightsBarChart
              height="8px"
              weights={tokenAmountToUsdWithWeights.map(t => t.usdWeight)}
            />

            {showTargetWeights && (
              <>
                <WeightsBarChart
                  height="5px"
                  opacity={0.5}
                  weights={poolTokens.map(t => Number(t.weight))}
                />

                <WeightsPercentageLabels
                  showIcon={true}
                  textColor="font.secondary"
                  tokens={poolTokens.map(t => ({ weight: Number(t.weight) }))}
                />
              </>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  )
}

interface WeightsBarChartProps {
  weights: number[]
  height: string
  opacity?: number
}

function WeightsBarChart({ weights, height, opacity }: WeightsBarChartProps) {
  const allZeroWeights = weights.every(weight => weight === 0)

  return (
    <HStack gap={allZeroWeights ? 0 : 0.5} opacity={opacity} w="full">
      {weights.map((weight, idx) => {
        const isFirst = idx === 0
        const isLast = idx === weights.length - 1
        const color = WEIGHT_COLORS[idx % WEIGHT_COLORS.length]

        return (
          <Box
            bg={allZeroWeights ? 'background.level0' : color}
            borderBottomLeftRadius={isFirst ? 'sm' : 'none'}
            borderBottomRightRadius={isLast ? 'sm' : 'none'}
            borderTopLeftRadius={isFirst ? 'sm' : 'none'}
            borderTopRightRadius={isLast ? 'sm' : 'none'}
            flex={allZeroWeights ? '1' : weight.toString()}
            h={height}
            key={idx}
          />
        )
      })}
    </HStack>
  )
}

interface WeightsPercentageLabelsProps {
  tokens: Array<{ symbol?: string; weight: number }>
  showIcon?: boolean
  textColor?: string
}

function WeightsPercentageLabels({ tokens, showIcon, textColor }: WeightsPercentageLabelsProps) {
  const isMoreThanTwoTokens = tokens.length > 2

  return (
    <HStack gap={0.5} justify="space-between" w="full">
      {tokens.map((token, idx) => {
        const isFirst = idx === 0
        const isLast = idx === tokens.length - 1

        const color = WEIGHT_COLORS[idx % WEIGHT_COLORS.length]
        return (
          <HStack
            align="center"
            gap="xs"
            justify={isFirst ? 'flex-start' : isLast ? 'flex-end' : 'center'}
            key={idx}
          >
            {(!isLast || isMoreThanTwoTokens) && (
              <Box bg={color} borderRadius="full" h="8px" w="8px" />
            )}
            {showIcon && <BullseyeIcon />}
            <Text color={textColor || color}>
              {token.symbol ? `${token.symbol}: ` : ''}
              {token.weight ? token.weight.toFixed(2) : '0.00'}%
            </Text>
            {!isMoreThanTwoTokens && isLast && (
              <Box bg={color} borderRadius="full" h="8px" w="8px" />
            )}
          </HStack>
        )
      })}
    </HStack>
  )
}
