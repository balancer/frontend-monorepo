import {
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  UseDisclosureReturn,
  Tooltip,
} from '@chakra-ui/react'
import { requiresProportionalInput } from '../../LiquidityActionHelpers'
import { TokenInputs } from './TokenInputs'
import { TokenInputsWithAddable } from './TokenInputsWithAddable'
import { Pool } from '../../../PoolProvider'
import { bn } from '@repo/lib/shared/utils/numbers'
import { useEffect } from 'react'
import { useProportionalInputs } from './useProportionalInputs'

const MIN_LIQUIDITY_FOR_BALANCED_ADD = 50000

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
      <TokenInputsWithAddable
        isProportional={isProportional}
        tokenSelectDisclosureOpen={() => tokenSelectDisclosure.onOpen()}
        totalUSDValue={totalUSDValue}
      />
    )
  }
}

export function AddLiquidityFormTabs({
  pool,
  tokenSelectDisclosure,
  totalUSDValue,
  nestedAddLiquidityEnabled,
  tabIndex,
  setTabIndex,
}: {
  pool: Pool
  tokenSelectDisclosure: UseDisclosureReturn
  totalUSDValue: string
  nestedAddLiquidityEnabled: boolean
  tabIndex: number
  setTabIndex: (index: number) => void
}) {
  const { clearAmountsIn } = useProportionalInputs()

  const isBelowMinTvlThreshold = bn(pool.dynamicData.totalLiquidity).lt(
    bn(MIN_LIQUIDITY_FOR_BALANCED_ADD)
  )

  const isDisabledUnbalancedTab = requiresProportionalInput(pool) || isBelowMinTvlThreshold
  const isDisabledBalancedTab = nestedAddLiquidityEnabled

  const UnbalancedTabTooltipLabel = isBelowMinTvlThreshold
    ? 'Liquidity must be added proportionally until the pool TVL is greater than $50000'
    : 'This pool requires liquidity to be added proportionally'

  const handleTabsChange = (index: number) => {
    clearAmountsIn()
    setTabIndex(index)
  }

  useEffect(() => {
    if (isDisabledUnbalancedTab) {
      setTabIndex(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDisabledUnbalancedTab])

  return (
    <Tabs
      colorScheme="brown"
      index={tabIndex}
      isFitted
      onChange={handleTabsChange}
      variant="soft-rounded"
    >
      <TabList>
        <Tooltip label={UnbalancedTabTooltipLabel}>
          <Tab isDisabled={isDisabledUnbalancedTab}>Unbalanced</Tab>
        </Tooltip>
        <Tooltip
          label={
            isDisabledBalancedTab
              ? 'This pool does not support liquidity to be added proportionally'
              : undefined
          }
        >
          <Tab isDisabled={isDisabledBalancedTab}>Balanced</Tab>
        </Tooltip>
      </TabList>
      <TabPanels>
        <TabPanel>
          <TokenInputsBase
            isProportional={false}
            nestedAddLiquidityEnabled={nestedAddLiquidityEnabled}
            tokenSelectDisclosure={tokenSelectDisclosure}
            totalUSDValue={totalUSDValue}
          />
        </TabPanel>
        <TabPanel>
          <TokenInputsBase
            isProportional
            nestedAddLiquidityEnabled={nestedAddLiquidityEnabled}
            tokenSelectDisclosure={tokenSelectDisclosure}
            totalUSDValue={totalUSDValue}
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}
