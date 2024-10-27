// TODO: These types will be exposed by the SDK in 0.29.1 release
import {
  Address,
  ChainId,
  Hex,
  PoolKind,
  PoolType,
  Slippage,
  Token,
  TokenAmount,
} from '@balancer/sdk'

export type AddLiquidityNestedCallAttributes = {
  chainId: ChainId
  wethIsEth?: boolean
  sortedTokens: Token[]
  poolId: Hex
  poolAddress: Address
  poolType: PoolType
  kind: PoolKind
  sender: Address
  recipient: Address
  maxAmountsIn: {
    amount: bigint
    isRef: boolean
  }[]
  minBptOut: bigint
  fromInternalBalance: boolean
  outputReference: bigint
}

export type AddLiquidityNestedQueryOutputV2 = {
  callsAttributes: AddLiquidityNestedCallAttributes[]
  amountsIn: TokenAmount[]
  bptOut: TokenAmount
  protocolVersion: 2
}

export type AddLiquidityNestedCallInputV2 = AddLiquidityNestedQueryOutputV2 & {
  slippage: Slippage
  accountAddress: Address
  relayerApprovalSignature?: Hex
  wethIsEth?: boolean
}
