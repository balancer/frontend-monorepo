/* eslint-disable react-hooks/exhaustive-deps */
import { NumberText } from '@/lib/shared/components/typography/NumberText'
import { useCurrency } from '@/lib/shared/hooks/useCurrency'
import { bn, fNum } from '@/lib/shared/utils/numbers'
import { HStack, VStack, Text, Tooltip, Box } from '@chakra-ui/react'
import { useSwap } from './SwapProvider'
import { GqlSorSwapType } from '@/lib/shared/services/api/generated/graphql'
import { useUserSettings } from '../user/settings/UserSettingsProvider'
import { usePriceImpact } from '@/lib/modules/price-impact/PriceImpactProvider'
import { SdkSimulateSwapResponse } from './swap.types'
import { DefaultSwapHandler } from './handlers/DefaultSwap.handler'
import { useTokens } from '../tokens/TokensProvider'
import { NativeWrapHandler } from './handlers/NativeWrap.handler'
import { InfoIcon } from '@/lib/shared/components/icons/InfoIcon'
import pluralize from 'pluralize'

export function OrderRoute() {
  const { simulationQuery } = useSwap()

  const queryData = simulationQuery.data as SdkSimulateSwapResponse
  const orderRouteVersion = queryData ? queryData.protocolVersion : 2
  const hopCount = queryData?.routes[0]?.hops?.length ?? 0

  return (
    <HStack justify="space-between" w="full">
      <Text color="grayText">Order route</Text>
      <HStack>
        <Text color="grayText">
          BV{orderRouteVersion}: {hopCount} {pluralize('hop', hopCount)}
        </Text>
        <Tooltip label="Balancer vault version and number of hops" fontSize="sm">
          <InfoIcon />
        </Tooltip>
      </HStack>
    </HStack>
  )
}

export function SwapDetails() {
  const { toCurrency } = useCurrency()
  const { slippage, slippageDecimal } = useUserSettings()
  const { usdValueForToken } = useTokens()
  const { tokenInInfo, tokenOutInfo, swapType, tokenIn, tokenOut, handler } = useSwap()

  const { priceImpactLevel, priceImpactColor, PriceImpactIcon, priceImpact } = usePriceImpact()

  const isDefaultSwap = handler instanceof DefaultSwapHandler
  const isNativeWrapOrUnwrap = handler instanceof NativeWrapHandler

  const _slippage = isNativeWrapOrUnwrap ? 0 : slippage
  const _slippageDecimal = isNativeWrapOrUnwrap ? 0 : slippageDecimal

  const returnAmountUsd =
    swapType === GqlSorSwapType.ExactIn
      ? usdValueForToken(tokenOutInfo, tokenOut.amount)
      : usdValueForToken(tokenInInfo, tokenIn.amount)

  const priceImpactLabel = priceImpact ? fNum('priceImpact', priceImpact) : '-'
  const priceImpacUsd = bn(priceImpact || 0).times(returnAmountUsd)
  const maxSlippageUsd = bn(_slippage).div(100).times(returnAmountUsd)

  const isExactIn = swapType === GqlSorSwapType.ExactIn

  const limitLabel = isExactIn ? "You'll get at least" : "You'll pay at most"
  const limitToken = isExactIn ? tokenOutInfo : tokenInInfo
  const limitValue = isExactIn
    ? bn(tokenOut.amount).minus(bn(tokenOut.amount).times(_slippageDecimal)).toString()
    : bn(tokenIn.amount).plus(bn(tokenIn.amount).times(_slippageDecimal)).toString()
  const limitTooltip = isExactIn
    ? 'You will get at least this amount of token out.'
    : 'You will pay at most this amount of token in.'

  const slippageLabel = isExactIn
    ? `This is the maximum slippage that the swap will allow. 
        It is based on the quoted amount out minus your slippage tolerance, using current market prices.
        You can change your slippage tolerance in your settings.`
    : `This is the maximum slippage that the swap will allow. 
        It is based on the quoted amount in plus your slippage tolerance, using current market prices.
        You can change your slippage tolerance in your settings.`

  return (
    <VStack spacing="sm" align="start" w="full" fontSize="sm">
      <HStack justify="space-between" w="full">
        <Text color={priceImpactColor}>Price impact</Text>
        <HStack>
          {priceImpactLevel === 'unknown' ? (
            <Text>Unknown</Text>
          ) : (
            <NumberText color={priceImpactColor}>
              -{toCurrency(priceImpacUsd, { abbreviated: false })} (-{priceImpactLabel})
            </NumberText>
          )}
          <Tooltip
            // eslint-disable-next-line max-len
            label="This is the negative price impact of the swap based on the current market prices of the token in vs token out."
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
          <NumberText color="grayText">
            -{toCurrency(maxSlippageUsd, { abbreviated: false })} (-{fNum('slippage', _slippage)})
          </NumberText>
          <Tooltip label={slippageLabel} fontSize="sm">
            <InfoIcon />
          </Tooltip>
        </HStack>
      </HStack>
      <HStack justify="space-between" w="full">
        <Text color="grayText">{limitLabel}</Text>
        <HStack>
          <NumberText color="grayText">
            {fNum('token', limitValue, { abbreviated: false })} {limitToken?.symbol}
          </NumberText>
          <Tooltip label={limitTooltip} fontSize="sm">
            <InfoIcon />
          </Tooltip>
        </HStack>
      </HStack>

      {isDefaultSwap && <OrderRoute />}
    </VStack>
  )
}
