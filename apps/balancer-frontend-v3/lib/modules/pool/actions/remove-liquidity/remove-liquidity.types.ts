import {
  HumanAmount,
  RemoveLiquidityQueryOutput,
  RemoveLiquidityKind as SdkRemoveLiquidityKind,
  TokenAmount,
} from '@balancer/sdk'
import { Address } from 'viem'

// There are other kinds but we only support two of them
export enum RemoveLiquidityType {
  Proportional = SdkRemoveLiquidityKind.Proportional,
  SingleToken = SdkRemoveLiquidityKind.SingleTokenExactIn,
}

/*
  Base interface that every handler must implement.
  - SDK handlers will extend it with sdk fields (see interfaces below).
  - Edge case handlers (i.e. TWAMM handler) that do not use the SDK will just implement this base interface without extending it.
*/
export interface QueryRemoveLiquidityInput {
  humanBptIn: HumanAmount
  tokenOut: Address // Only SingleToken handler uses tokenOut but we define it here to simply optional type handling
}

export type QueryRemoveLiquidityOutput = {
  amountsOut: TokenAmount[]
}

export type BuildRemoveLiquidityInput = {
  account: Address
  slippagePercent: string
  queryOutput: QueryRemoveLiquidityOutput
  relayerApprovalSignature?: Address //only used by Nested Remove Liquidity in signRelayer mode
  wethIsEth?: boolean // only used by single token removal type
}

/*
  SDK interfaces:
  They extend the base QueryAddLiquidityOutput interface above.
  Implemented by the default handlers (i.e. UnbalancedAddLiquidity or NestedAddLiquidityHandler)
  which interact with the SDK to query and build the tx callData.
*/
export interface SdkQueryRemoveLiquidityOutput extends QueryRemoveLiquidityOutput {
  sdkQueryOutput: RemoveLiquidityQueryOutput
}

export interface SdkBuildRemoveLiquidityInput extends BuildRemoveLiquidityInput {
  queryOutput: SdkQueryRemoveLiquidityOutput
}
