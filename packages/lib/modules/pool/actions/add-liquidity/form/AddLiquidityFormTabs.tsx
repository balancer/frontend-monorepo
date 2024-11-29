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

export function TokenInputsBase({
  nestedAddLiquidityEnabled,
  tokenSelectDisclosure,
  totalUSDValue,
  isProportionalInput,
}: {
  nestedAddLiquidityEnabled: boolean
  tokenSelectDisclosure: UseDisclosureReturn
  totalUSDValue: string
  isProportionalInput: boolean
}) {
  if (nestedAddLiquidityEnabled) {
    return <TokenInputs tokenSelectDisclosureOpen={() => tokenSelectDisclosure.onOpen()} />
  } else {
    return (
      <TokenInputsWithAddable
        isProportionalInput={isProportionalInput}
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
}: {
  pool: Pool
  tokenSelectDisclosure: UseDisclosureReturn
  totalUSDValue: string
  nestedAddLiquidityEnabled: boolean
}) {
  const isDisabledUnbalancedTab = requiresProportionalInput(pool)
  const isDisabledBalancedTab = nestedAddLiquidityEnabled

  return (
    <Tabs colorScheme="brown" isFitted variant="soft-rounded">
      <TabList>
        <Tooltip
          label={
            isDisabledUnbalancedTab
              ? 'This pool requires liquidity to be added proportionally'
              : undefined
          }
        >
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
            isProportionalInput={false}
            nestedAddLiquidityEnabled={nestedAddLiquidityEnabled}
            tokenSelectDisclosure={tokenSelectDisclosure}
            totalUSDValue={totalUSDValue}
          />
        </TabPanel>
        <TabPanel>
          <TokenInputsBase
            isProportionalInput
            nestedAddLiquidityEnabled={nestedAddLiquidityEnabled}
            tokenSelectDisclosure={tokenSelectDisclosure}
            totalUSDValue={totalUSDValue}
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}
