import { ListItem, UnorderedList, VStack } from '@chakra-ui/react'
import ButtonGroup, {
  ButtonGroupOption,
} from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { useEffect } from 'react'
import { usePool } from '../../../PoolProvider'
import {
  requiresProportionalInput,
  supportsProportionalAddLiquidityKind,
} from '../../LiquidityActionHelpers'
import { useAddLiquidity } from '../AddLiquidityProvider'
import { TokenInputsMaybeProportional } from './TokenInputsMaybeProportional'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { isV3Pool, isGyroEPool } from '../../../pool.helpers'
import { useGetPoolTokensWithActualWeights } from '../../../useGetPoolTokensWithActualWeights'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { BalAlertContent } from '@repo/lib/shared/components/alerts/BalAlertContent'
import { useGetECLPLiquidityProfile } from '@repo/lib/modules/eclp/hooks/useGetECLPLiquidityProfile'

const MIN_LIQUIDITY_FOR_BALANCED_ADD = 50000

function PoolWeightsInfo() {
  const { poolTokensWithActualWeights, compositionTokens } = useGetPoolTokensWithActualWeights()

  return (
    <BalAlert
      content={
        <BalAlertContent
          // eslint-disable-next-line max-len
          description="Proportional adds avoid price impact by matching the current ratio of each token's USD value within the pool:"
          forceColumnMode
        >
          <UnorderedList>
            <ListItem color="font.black" fontWeight="medium">
              {compositionTokens
                .map(
                  token =>
                    `${token.symbol}: ${fNum('weight', poolTokensWithActualWeights[token.address], {
                      abbreviated: false,
                    })}`
                )
                .join(', ')}
            </ListItem>
          </UnorderedList>
        </BalAlertContent>
      }
      status="info"
    />
  )
}

function OutOfRangeWarning() {
  return (
    <BalAlert
      content={
        <BalAlertContent
          title="This CLP is currently out of range"
          tooltipLabel="No swap fees accrue when CLP is outside the price range. Fees resume automatically when prices return to the range."
        />
      }
      status="warning"
    />
  )
}

export function AddLiquidityFormTabs({
  totalUSDValue,
  nestedAddLiquidityEnabled,
  tabIndex,
  setFlexibleTab,
  setProportionalTab,
}: {
  totalUSDValue: string
  nestedAddLiquidityEnabled: boolean
  tabIndex: number
  setFlexibleTab: () => void
  setProportionalTab: () => void
}) {
  const { clearAmountsIn } = useAddLiquidity()
  const { isLoading, pool } = usePool()
  const { toCurrency } = useCurrency()
  const { poolIsInRange } = useGetECLPLiquidityProfile(pool)

  const isDisabledProportionalTab =
    nestedAddLiquidityEnabled || !supportsProportionalAddLiquidityKind(pool)

  const isBelowMinTvlThreshold =
    isV3Pool(pool) &&
    !isDisabledProportionalTab &&
    bn(pool.dynamicData.totalLiquidity).lt(bn(MIN_LIQUIDITY_FOR_BALANCED_ADD))

  const isOutOfRange = isGyroEPool(pool) && !poolIsInRange

  const isDisabledFlexibleTab = requiresProportionalInput(pool) || isBelowMinTvlThreshold

  function getFlexibleTabTooltipLabel(): string | undefined {
    if (requiresProportionalInput(pool)) {
      return 'This pool requires liquidity to be added proportionally'
    }
    if (isBelowMinTvlThreshold) {
      return `Liquidity must be added proportionally until the pool TVL is greater than ${toCurrency(MIN_LIQUIDITY_FOR_BALANCED_ADD, { abbreviated: false, noDecimals: true })}`
    }
    return
  }

  function handleTabChanged(option: ButtonGroupOption): void {
    if (tabIndex.toString() === option.value) return // Avoids handling click in the current tab
    clearAmountsIn()
    option.value === '0' ? setFlexibleTab() : setProportionalTab()
  }

  const options: ButtonGroupOption[] = [
    {
      value: '0',
      label: 'Flexible',
      disabled: isDisabledFlexibleTab,
      iconTooltipLabel:
        'Enter any amount for each token manually. Balances are independent, and no automatic adjustments will be made.',
      tabTooltipLabel: getFlexibleTabTooltipLabel(),
    },
    {
      value: '1',
      label: 'Proportional',
      disabled: isDisabledProportionalTab,
      iconTooltipLabel:
        "When you enter an amount for one token, the others are automatically adjusted to maintain the pool's proportional balance.",
      tabTooltipLabel: isDisabledProportionalTab
        ? 'This pool does not support liquidity to be added proportionally'
        : undefined,
    },
  ]

  useEffect(() => {
    if (!isLoading && isDisabledFlexibleTab) {
      setProportionalTab()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDisabledFlexibleTab, isLoading])

  const isProportional = tabIndex === 1

  return (
    <VStack w="full">
      <ButtonGroup
        currentOption={options[tabIndex]}
        groupId="add-liquidity"
        hasLargeTextLabel
        isFullWidth
        onChange={handleTabChanged}
        options={options}
        size="md"
      />
      {isOutOfRange && <OutOfRangeWarning />}
      {isProportional && <PoolWeightsInfo />}
      <TokenInputsMaybeProportional isProportional={isProportional} totalUSDValue={totalUSDValue} />
    </VStack>
  )
}
