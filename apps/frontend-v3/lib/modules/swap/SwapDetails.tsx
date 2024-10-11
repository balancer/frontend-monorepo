/* eslint-disable react-hooks/exhaustive-deps */
import { NumberText } from '@/lib/shared/components/typography/NumberText'
import { useCurrency } from '@/lib/shared/hooks/useCurrency'
import { bn, fNum } from '@/lib/shared/utils/numbers'
import {
  HStack,
  VStack,
  Text,
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@chakra-ui/react'
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
  const hopCount = queryData ? queryData.routes[0]?.hops?.length : 0

  return (
    <HStack justify="space-between" w="full">
      <Text color="grayText">Order route</Text>
      <HStack>
        <Text color="grayText">
          Bv{orderRouteVersion}: {hopCount} {pluralize('hop', hopCount)}
        </Text>
        <Popover trigger="hover">
          <PopoverTrigger>
            <Box
              opacity="0.5"
              transition="opacity 0.2s var(--ease-out-cubic)"
              _hover={{ opacity: 1 }}
            >
              <InfoIcon />
            </Box>
          </PopoverTrigger>
          <PopoverContent p="sm" w="auto" maxW="300px">
            <Text fontSize="sm" variant="secondary">
              Balancer Vault version and number of swap hops
            </Text>
          </PopoverContent>
        </Popover>
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
    ? 'You will get at least this amount, even if you suffer maximum slippage ' +
      'from unfavorable market price movements before your transaction executes on-chain.'
    : 'At most, you will spend this amount, even if you suffer maximum slippage ' +
      'from unfavortable market price movements before your transaction executes on-chain.'

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
          <Popover trigger="hover">
            <PopoverTrigger>
              {priceImpactLevel === 'low' ? (
                <Box
                  opacity="0.5"
                  transition="opacity 0.2s var(--ease-out-cubic)"
                  _hover={{ opacity: 1 }}
                >
                  <InfoIcon />
                </Box>
              ) : (
                <Box>
                  <PriceImpactIcon priceImpactLevel={priceImpactLevel} />
                </Box>
              )}
            </PopoverTrigger>
            <PopoverContent p="sm">
              <Text fontSize="sm" variant="secondary">
                This is the negative price impact of the swap based on the current market prices of
                the token in vs token out.
              </Text>
            </PopoverContent>
          </Popover>
        </HStack>
      </HStack>
      <HStack justify="space-between" w="full">
        <Text color="grayText">Max slippage</Text>
        <HStack>
          <NumberText color="grayText">
            -{toCurrency(maxSlippageUsd, { abbreviated: false })} (-{fNum('slippage', _slippage)})
          </NumberText>
          <Popover trigger="hover">
            <PopoverTrigger>
              <Box
                opacity="0.5"
                transition="opacity 0.2s var(--ease-out-cubic)"
                _hover={{ opacity: 1 }}
              >
                <InfoIcon />
              </Box>
            </PopoverTrigger>
            <PopoverContent p="sm">
              <Text fontSize="sm" variant="secondary">
                {slippageLabel}
              </Text>
            </PopoverContent>
          </Popover>
        </HStack>
      </HStack>
      <HStack justify="space-between" w="full">
        <Text color="grayText">{limitLabel}</Text>
        <HStack>
          <NumberText color="grayText">
            {fNum('token', limitValue, { abbreviated: false })} {limitToken?.symbol}
          </NumberText>
          <Popover trigger="hover">
            <PopoverTrigger>
              <Box
                opacity="0.5"
                transition="opacity 0.2s var(--ease-out-cubic)"
                _hover={{ opacity: 1 }}
              >
                <InfoIcon />
              </Box>
            </PopoverTrigger>
            <PopoverContent p="sm">
              <Text fontSize="sm" variant="secondary">
                {limitTooltip}
              </Text>
            </PopoverContent>
          </Popover>
        </HStack>
      </HStack>

      {isDefaultSwap && <OrderRoute />}
    </VStack>
  )
}
