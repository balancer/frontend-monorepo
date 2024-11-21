import {
  AddLiquidityNestedQueryOutputV2,
  AddLiquidityNestedQueryOutputV3,
  AddLiquidityQueryOutput,
  Permit2,
  TokenAmount,
} from '@balancer/sdk'
import { Address } from 'viem'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'

/*
  Base interface that every handler must implement.
  - SDK handlers will extend it with sdk fields (see interfaces below).
  - Edge case handlers (i.e. TWAMM handler) that do not use the SDK will just implement this base interface without extending it.
*/
export interface QueryAddLiquidityOutput {
  bptOut: TokenAmount
  to: Address
}

export interface BuildAddLiquidityInput {
  humanAmountsIn: HumanTokenAmountWithAddress[]
  account: Address
  slippagePercent: string
  queryOutput: QueryAddLiquidityOutput
  relayerApprovalSignature?: Address //only used by Nested Add Liquidity in signRelayer mode
  permit2?: Permit2 //only used by v3 add liquidity
}

/*
  SDK interfaces:
  They extend the base QueryAddLiquidityOutput interface above.
  Implemented by the default handlers (i.e. UnbalancedAddLiquidity or NestedAddLiquidityHandler)
  which interact with the SDK to query and build the tx callData.
*/
export interface SdkQueryAddLiquidityOutput extends QueryAddLiquidityOutput {
  sdkQueryOutput: AddLiquidityQueryOutput
}

export interface NestedQueryAddLiquidityOutputV2 extends QueryAddLiquidityOutput {
  sdkQueryOutput: AddLiquidityNestedQueryOutputV2
}

export interface NestedQueryAddLiquidityOutputV3 extends QueryAddLiquidityOutput {
  sdkQueryOutput: AddLiquidityNestedQueryOutputV3
}

export interface SdkBuildAddLiquidityInput extends BuildAddLiquidityInput {
  queryOutput: SdkQueryAddLiquidityOutput
}
export interface NestedBuildAddLiquidityInput extends BuildAddLiquidityInput {
  queryOutput: NestedQueryAddLiquidityOutputV2
}

export interface NestedBuildAddLiquidityInputV3 extends BuildAddLiquidityInput {
  queryOutput: NestedQueryAddLiquidityOutputV3
}
