import { vi } from 'vitest'
import type { GqlChain, GqlSorSwapType } from '@repo/lib/shared/services/api/generated/graphql'
import { GqlChainValues, GqlSorSwapTypeValues } from '@repo/lib/shared/services/api/generated/graphql-enums'
import type {
  BuildSwapInputs,
  SdkBuildSwapInputs,
  SdkSimulateSwapResponse,
  SimulateSwapInputs,
  AuraBalBuildSwapInputs,
  AuraBalSimulateSwapResponse,
} from '../../modules/swap/swap.types'
import type { Address } from 'viem'

export const TEST_ADDRESSES = {
  eth: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  dai: '0x6b175474e89094c44da98b954eedeac495271d0f',
  bal: '0xba100000625a3754423978a60c9317c58a424e3d',
  auraBal: '0x616e8bfa43f920657b3497dbf40d6b1a02d4608d',
  steth: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
  wsteth: '0x7f39c581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
  vaultV2: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
} as const

export const TEST_ACCOUNT = '0x1111111111111111111111111111111111111111' as Address

export function createMockSdkSimulateSwapResponse(overrides?: {
  protocolVersion?: number
  callData?: string
  permit2CallData?: string
  router?: Address
}): {
  simulateResponse: SdkSimulateSwapResponse
  mockBuildCall: ReturnType<typeof vi.fn>
  mockBuildCallWithPermit2: ReturnType<typeof vi.fn>
} {
  const protocolVersion = overrides?.protocolVersion ?? 2
  const callData = overrides?.callData ?? '0xdefault_tx_data'
  const permit2CallData = overrides?.permit2CallData ?? '0xpermit2_tx_data'
  const router = overrides?.router ?? TEST_ADDRESSES.vaultV2

  const mockBuildCall = vi.fn().mockReturnValue({
    callData,
    value: BigInt(0),
    to: router,
  })
  const mockBuildCallWithPermit2 = vi.fn().mockReturnValue({
    callData: permit2CallData,
    value: BigInt(0),
    to: router,
  })

  const simulateResponse: SdkSimulateSwapResponse = {
    swap: {
      buildCall: mockBuildCall,
      buildCallWithPermit2: mockBuildCallWithPermit2,
    } as unknown as SdkSimulateSwapResponse['swap'],
    queryOutput: {
      to: router,
      swapKind: 'GIVEN_IN',
    } as unknown as SdkSimulateSwapResponse['queryOutput'],
    protocolVersion,
    hopCount: 1,
    router,
    paths: [],
    swapType: GqlSorSwapTypeValues.ExactIn,
    effectivePrice: '1',
    effectivePriceReversed: '1',
    returnAmount: '1.0',
  }

  return { simulateResponse, mockBuildCall, mockBuildCallWithPermit2 }
}

export function createSdkBuildSwapInputs(overrides?: {
  tokenInAddress?: Address
  tokenOutAddress?: Address
  tokenInAmount?: string
  tokenOutAmount?: string
  slippagePercent?: string
  account?: Address
  wethIsEth?: boolean
  selectedChain?: GqlChain
  swapType?: GqlSorSwapType
  protocolVersion?: number
  permit2?: BuildSwapInputs['permit2']
  simulateResponse?: SdkSimulateSwapResponse
}): SdkBuildSwapInputs {
  const simulateResponse =
    overrides?.simulateResponse ??
    createMockSdkSimulateSwapResponse({ protocolVersion: overrides?.protocolVersion })
      .simulateResponse

  return {
    tokenIn: {
      address: overrides?.tokenInAddress ?? TEST_ADDRESSES.weth,
      amount: overrides?.tokenInAmount ?? '1.0',
      scaledAmount: BigInt(1e18),
    },
    tokenOut: {
      address: overrides?.tokenOutAddress ?? TEST_ADDRESSES.dai,
      amount: overrides?.tokenOutAmount ?? '100.0',
      scaledAmount: BigInt(1e20),
    },
    swapType: overrides?.swapType ?? GqlSorSwapTypeValues.ExactIn,
    selectedChain: overrides?.selectedChain ?? GqlChainValues.Mainnet,
    account: overrides?.account ?? TEST_ACCOUNT,
    slippagePercent: overrides?.slippagePercent ?? '0.5',
    simulateResponse,
    wethIsEth: overrides?.wethIsEth ?? false,
    permit2: overrides?.permit2,
  }
}

export function createMockSimulateSwapInputs(overrides?: {
  chain?: GqlChain
  tokenIn?: Address
  tokenOut?: Address
  swapType?: GqlSorSwapType
  swapAmount?: string
}): SimulateSwapInputs {
  return {
    chain: overrides?.chain ?? GqlChainValues.Mainnet,
    tokenIn: overrides?.tokenIn ?? TEST_ADDRESSES.eth,
    tokenOut: overrides?.tokenOut ?? TEST_ADDRESSES.weth,
    swapType: overrides?.swapType ?? GqlSorSwapTypeValues.ExactIn,
    swapAmount: overrides?.swapAmount ?? '1.0',
  }
}

export function createMockAuraBalSimulateResponse(): AuraBalSimulateSwapResponse {
  return {
    queryOutput: {
      swapKind: 'GIVEN_IN',
      expectedAmountOut: {
        token: { address: TEST_ADDRESSES.weth, decimals: 18 },
        amount: BigInt(1e18),
      },
      to: TEST_ADDRESSES.vaultV2,
    } as unknown as AuraBalSimulateSwapResponse['queryOutput'],
    swapType: GqlSorSwapTypeValues.ExactIn,
    effectivePrice: '1',
    effectivePriceReversed: '1',
    returnAmount: '1.0',
  }
}

export function createAuraBalBuildSwapInputs(overrides?: {
  tokenInAddress?: Address
  tokenOutAddress?: Address
  slippagePercent?: string
  wethIsEth?: boolean
}): AuraBalBuildSwapInputs {
  return {
    tokenIn: {
      address: overrides?.tokenInAddress ?? TEST_ADDRESSES.eth,
      amount: '1.0',
      scaledAmount: BigInt(1e18),
    },
    tokenOut: {
      address: overrides?.tokenOutAddress ?? TEST_ADDRESSES.auraBal,
      amount: '1.0',
      scaledAmount: BigInt(1e18),
    },
    swapType: GqlSorSwapTypeValues.ExactIn,
    selectedChain: GqlChainValues.Mainnet,
    account: TEST_ACCOUNT,
    slippagePercent: overrides?.slippagePercent ?? '1.0',
    simulateResponse: createMockAuraBalSimulateResponse(),
    wethIsEth: overrides?.wethIsEth ?? true,
  }
}

export function createMockNetworkConfig(overrides?: {
  supportedWrappers?: Array<{
    baseToken: string
    wrappedToken: string
    swapHandler: string
  }>
}): {
  chainId: number
  chain: GqlChain
  tokens: {
    addresses: { wNativeAsset: string; auraBal: string; bal: string }
    nativeAsset: { address: string }
    supportedWrappers: Array<{ baseToken: string; wrappedToken: string; swapHandler: string }>
  }
  contracts: { balancer: { vaultV2: string } }
} {
  return {
    chainId: 1,
    chain: GqlChainValues.Mainnet as GqlChain,
    tokens: {
      addresses: {
        wNativeAsset: TEST_ADDRESSES.weth,
        auraBal: TEST_ADDRESSES.auraBal,
        bal: TEST_ADDRESSES.bal,
      },
      nativeAsset: {
        address: TEST_ADDRESSES.eth,
      },
      supportedWrappers: overrides?.supportedWrappers ?? [
        {
          baseToken: TEST_ADDRESSES.steth,
          wrappedToken: TEST_ADDRESSES.wsteth,
          swapHandler: 'LIDO' as const,
        },
      ],
    },
    contracts: {
      balancer: {
        vaultV2: TEST_ADDRESSES.vaultV2,
      },
    },
  }
}
