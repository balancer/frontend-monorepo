import { describe, expect, it, vi, beforeEach } from 'vitest'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { useCreatePoolBuildCall } from './useCreatePoolBuildCall'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { waitFor } from '@testing-library/react'

vi.mock('@balancer/sdk', async () => {
  const actual = await vi.importActual<typeof import('@balancer/sdk')>('@balancer/sdk')
  return {
    ...actual,
    CreatePool: vi.fn().mockImplementation(() => ({
      buildCall: vi.fn(),
    })),
  }
})

vi.mock('wagmi', async () => {
  const actual = await vi.importActual<typeof import('wagmi')>('wagmi')
  return {
    ...actual,
    useBlockNumber: vi.fn(),
  }
})

vi.mock('@repo/lib/modules/web3/UserAccountProvider', async () => {
  const actual = await vi.importActual<typeof import('@repo/lib/modules/web3/UserAccountProvider')>(
    '@repo/lib/modules/web3/UserAccountProvider'
  )
  return {
    ...actual,
    useUserAccount: vi.fn(),
  }
})

vi.mock('@repo/lib/config/app.config', async () => {
  const actual = await vi.importActual<typeof import('@repo/lib/config/app.config')>(
    '@repo/lib/config/app.config'
  )
  return {
    ...actual,
    getGqlChain: vi.fn(),
    getNetworkConfig: vi.fn(),
  }
})

vi.mock('viem', async () => {
  const actual = await vi.importActual<typeof import('viem')>('viem')
  return {
    ...actual,
    encodeFunctionData: vi.fn(),
    parseAbi: vi.fn(() => [
      {
        type: 'function',
        name: 'newBPool',
        inputs: [
          { name: 'name', type: 'string' },
          { name: 'symbol', type: 'string' },
        ],
        outputs: [],
      },
    ]),
  }
})

describe('useCreatePoolBuildCall', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const v3Input = { protocolVersion: 3 as const, chainId: 1 }
  const v1Input = { protocolVersion: 1 as const, chainId: 1, name: 'CoW Pool', symbol: 'COW' }

  async function setupV3Mocks() {
    const { CreatePool } = await import('@balancer/sdk')
    const { useUserAccount } = await import('@repo/lib/modules/web3/UserAccountProvider')
    const { useBlockNumber } = await import('wagmi')

    const mockBuildCall = {
      callData: '0xabcdef',
      to: '0x1234567890123456789012345678901234567890',
    }
    const mockInstance = { buildCall: vi.fn().mockReturnValue(mockBuildCall) }
    ;(CreatePool as ReturnType<typeof vi.fn>).mockImplementation(() => mockInstance)
    ;(useUserAccount as ReturnType<typeof vi.fn>).mockReturnValue({
      userAddress: defaultTestUserAccount,
      isConnected: true,
    })
    ;(useBlockNumber as ReturnType<typeof vi.fn>).mockReturnValue({ data: 12345n })

    return { mockInstance, mockBuildCall }
  }

  it('builds v3 pool call via CreatePool SDK', async () => {
    const { mockInstance, mockBuildCall } = await setupV3Mocks()

    const { result } = testHook(() =>
      useCreatePoolBuildCall({
        createPoolInput: v3Input as any,
        enabled: true,
      })
    )

    await waitFor(() => expect(result.current.isLoading).toBeFalsy())

    expect(mockInstance.buildCall).toHaveBeenCalledWith(v3Input)
    expect(result.current.data).toEqual({
      chainId: 1,
      account: defaultTestUserAccount,
      data: mockBuildCall.callData,
      to: mockBuildCall.to,
    })
  })

  it('builds v1 CoW AMM pool call via bCoW factory', async () => {
    const { useUserAccount } = await import('@repo/lib/modules/web3/UserAccountProvider')
    ;(useUserAccount as ReturnType<typeof vi.fn>).mockReturnValue({
      userAddress: defaultTestUserAccount,
      isConnected: true,
    })

    const { useBlockNumber } = await import('wagmi')
    ;(useBlockNumber as ReturnType<typeof vi.fn>).mockReturnValue({ data: 100n })

    const { getGqlChain } = await import('@repo/lib/config/app.config')
    ;(getGqlChain as ReturnType<typeof vi.fn>).mockReturnValue('mainnet' as any)

    const { getNetworkConfig } = await import('@repo/lib/config/app.config')
    ;(getNetworkConfig as ReturnType<typeof vi.fn>).mockReturnValue({
      contracts: { balancer: { bCoWFactory: '0xcowFactoryAddress' } },
    })

    const { encodeFunctionData } = await import('viem')
    ;(encodeFunctionData as ReturnType<typeof vi.fn>).mockReturnValue('0xcallv1')

    const { result } = testHook(() =>
      useCreatePoolBuildCall({
        createPoolInput: v1Input as any,
        enabled: true,
      })
    )

    await waitFor(() => expect(result.current.isLoading).toBeFalsy())

    expect(result.current.data?.to).toBe('0xcowFactoryAddress')
    expect(encodeFunctionData).toHaveBeenCalledWith({
      abi: [
        {
          type: 'function',
          name: 'newBPool',
          inputs: [
            { name: 'name', type: 'string' },
            { name: 'symbol', type: 'string' },
          ],
          outputs: [],
        },
      ],
      functionName: 'newBPool',
      args: ['CoW Pool', 'COW'],
    })
  })

  it('does not execute query when disabled', async () => {
    const { CreatePool } = await import('@balancer/sdk')
    const mockInstance = { buildCall: vi.fn() }
    ;(CreatePool as ReturnType<typeof vi.fn>).mockImplementation(() => mockInstance)

    const { useUserAccount } = await import('@repo/lib/modules/web3/UserAccountProvider')
    ;(useUserAccount as ReturnType<typeof vi.fn>).mockReturnValue({
      userAddress: defaultTestUserAccount,
      isConnected: true,
    })

    const { useBlockNumber } = await import('wagmi')
    ;(useBlockNumber as ReturnType<typeof vi.fn>).mockReturnValue({ data: 100n })

    testHook(() =>
      useCreatePoolBuildCall({
        createPoolInput: v3Input as any,
        enabled: false,
      })
    )

    expect(mockInstance.buildCall).not.toHaveBeenCalled()
  })

  it('returns error for unsupported protocol version', async () => {
    const { useUserAccount } = await import('@repo/lib/modules/web3/UserAccountProvider')
    ;(useUserAccount as ReturnType<typeof vi.fn>).mockReturnValue({
      userAddress: defaultTestUserAccount,
      isConnected: true,
    })

    const { useBlockNumber } = await import('wagmi')
    ;(useBlockNumber as ReturnType<typeof vi.fn>).mockReturnValue({ data: 100n })

    const { result } = testHook(() =>
      useCreatePoolBuildCall({
        createPoolInput: { protocolVersion: 2, chainId: 1 } as any,
        enabled: true,
      })
    )

    await waitFor(() => expect(result.current.isError).toBeTruthy())
    expect(result.current.error?.message).toBe(
      'Unsupported protocol version for create pool build call'
    )
  })

  it('returns error when bCoW factory address is missing', async () => {
    const { useUserAccount } = await import('@repo/lib/modules/web3/UserAccountProvider')
    ;(useUserAccount as ReturnType<typeof vi.fn>).mockReturnValue({
      userAddress: defaultTestUserAccount,
      isConnected: true,
    })

    const { useBlockNumber } = await import('wagmi')
    ;(useBlockNumber as ReturnType<typeof vi.fn>).mockReturnValue({ data: 100n })

    const { getGqlChain } = await import('@repo/lib/config/app.config')
    ;(getGqlChain as ReturnType<typeof vi.fn>).mockReturnValue('mainnet' as any)

    const { getNetworkConfig } = await import('@repo/lib/config/app.config')
    ;(getNetworkConfig as ReturnType<typeof vi.fn>).mockReturnValue({
      contracts: { balancer: { bCoWFactory: undefined } },
    })

    const { result } = testHook(() =>
      useCreatePoolBuildCall({
        createPoolInput: v1Input as any,
        enabled: true,
      })
    )

    await waitFor(() => expect(result.current.isError).toBeTruthy())
    expect(result.current.error?.message).toContain('Missing bCoW factory')
  })
})
