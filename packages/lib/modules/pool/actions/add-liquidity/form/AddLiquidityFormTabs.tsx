import { UseDisclosureReturn, VStack } from '@chakra-ui/react'
import ButtonGroup, {
  ButtonGroupOption,
} from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { bn } from '@repo/lib/shared/utils/numbers'
import { useEffect } from 'react'
import { usePool } from '../../../PoolProvider'
import {
  requiresProportionalInput,
  supportsProportionalAddLiquidityKind,
} from '../../LiquidityActionHelpers'
import { useAddLiquidity } from '../AddLiquidityProvider'
import { TokenInputsMaybeProportional } from './TokenInputsMaybeProportional'
const MIN_LIQUIDITY_FOR_BALANCED_ADD = 50000

export function AddLiquidityFormTabs({
  tokenSelectDisclosure,
  totalUSDValue,
  nestedAddLiquidityEnabled,
  tabIndex,
  setUnbalancedTab,
  setProportionalTab,
}: {
  tokenSelectDisclosure: UseDisclosureReturn
  totalUSDValue: string
  nestedAddLiquidityEnabled: boolean
  tabIndex: number
  setUnbalancedTab: () => void
  setProportionalTab: () => void
}) {
  const { clearAmountsIn } = useAddLiquidity()
  const { isLoading, pool } = usePool()

  const isDisabledProportionalTab =
    nestedAddLiquidityEnabled || !supportsProportionalAddLiquidityKind(pool)
  /* TODO: test nested unbalanced + proportional calculations
  it does not work now due to "'Reference amount must be relative to a token in the pool or its BPT',"
  cause tokensWithBpt does not contain leaf tokens inside BPT:
  http://localhost:3000/pools/sepolia/v3/0xc9233cc69435591b193b50f702ac31e404a08b10
  */
  // const isDisabledProportionalTab = !supportsProportionalAddLiquidityKind(pool)

  const isBelowMinTvlThreshold =
    !isDisabledProportionalTab &&
    bn(pool.dynamicData.totalLiquidity).lt(bn(MIN_LIQUIDITY_FOR_BALANCED_ADD))

  const isDisabledUnbalancedTab = requiresProportionalInput(pool) || isBelowMinTvlThreshold

  const unbalancedTabTooltipLabel = requiresProportionalInput(pool)
    ? 'This pool requires liquidity to be added proportionally'
    : isBelowMinTvlThreshold
      ? `Liquidity must be added proportionally until the pool TVL is greater than $${MIN_LIQUIDITY_FOR_BALANCED_ADD}`
      : undefined

  function handleTabChanged(option: ButtonGroupOption): void {
    clearAmountsIn()
    option.value === '0' ? setUnbalancedTab() : setProportionalTab()
  }

  const options: ButtonGroupOption[] = [
    {
      value: '0',
      label: 'Flexible',
      disabled: isDisabledUnbalancedTab,
      tooltipLabel: unbalancedTabTooltipLabel,
    },
    {
      value: '1',
      label: 'Proportional',
      disabled: isDisabledProportionalTab,
      tooltipLabel: isDisabledProportionalTab
        ? 'This pool does not support liquidity to be added proportionally'
        : undefined,
    },
  ]

  useEffect(() => {
    if (!isLoading && isDisabledUnbalancedTab) {
      setProportionalTab()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDisabledUnbalancedTab, isLoading])

  const isProportional = tabIndex === 1

  return (
    <VStack>
      <ButtonGroup
        currentOption={options[tabIndex]}
        groupId="my-liquidity"
        hasLargeTextLabel
        isFullWidth
        onChange={handleTabChanged}
        options={options}
        size="md"
        width="50%"
      />
      <TokenInputsMaybeProportional
        isProportional={isProportional}
        tokenSelectDisclosureOpen={() => tokenSelectDisclosure.onOpen()}
        totalUSDValue={totalUSDValue}
      />
    </VStack>
  )
}
