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
import { TokenInputs } from './TokenInputs'
import { TokenInputsMaybeProportional } from './TokenInputsMaybeProportional'
const MIN_LIQUIDITY_FOR_BALANCED_ADD = 10000

export function TokenInputsBase({
  nestedAddLiquidityEnabled,
  tokenSelectDisclosure,
  totalUSDValue,
  isProportional,
}: {
  nestedAddLiquidityEnabled: boolean
  tokenSelectDisclosure: UseDisclosureReturn
  totalUSDValue: string
  isProportional: boolean
}) {
  if (nestedAddLiquidityEnabled) {
    return <TokenInputs tokenSelectDisclosureOpen={() => tokenSelectDisclosure.onOpen()} />
  } else {
    return (
      <TokenInputsMaybeProportional
        isProportional={isProportional}
        tokenSelectDisclosureOpen={() => tokenSelectDisclosure.onOpen()}
        totalUSDValue={totalUSDValue}
      />
    )
  }
}

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

  return (
    <VStack>
      <ButtonGroup
        currentOption={options[tabIndex]}
        groupId="my-liquidity"
        onChange={handleTabChanged}
        options={options}
        size="md"
        width="36"
      />
      {tabIndex === 0 ? (
        <TokenInputsBase
          isProportional={false}
          nestedAddLiquidityEnabled={nestedAddLiquidityEnabled}
          tokenSelectDisclosure={tokenSelectDisclosure}
          totalUSDValue={totalUSDValue}
        />
      ) : (
        <TokenInputsBase
          isProportional
          nestedAddLiquidityEnabled={nestedAddLiquidityEnabled}
          tokenSelectDisclosure={tokenSelectDisclosure}
          totalUSDValue={totalUSDValue}
        />
      )}
    </VStack>
  )
}
