import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { Hash } from 'viem'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { getEip5792ErrorMessage, useEip5792BatchSubmitter } from './useEip5792BatchSubmitter'
import { TransactionLabels, TransactionStep, TxCall } from '../lib'

const {
  useSendCallsMock,
  useCallsStatusMock,
  useWaitForTransactionReceiptMock,
  useUserAccountMock,
  useRecentTransactionsMock,
  sendCallsMock,
  isTxTrackedMock,
  addTrackedTransactionMock,
  updateTrackedTransactionMock,
} = vi.hoisted(() => ({
  useSendCallsMock: vi.fn(),
  useCallsStatusMock: vi.fn(),
  useWaitForTransactionReceiptMock: vi.fn(),
  useUserAccountMock: vi.fn(),
  useRecentTransactionsMock: vi.fn(),
  sendCallsMock: vi.fn(),
  isTxTrackedMock: vi.fn(),
  addTrackedTransactionMock: vi.fn(),
  updateTrackedTransactionMock: vi.fn(),
}))

vi.mock('wagmi', async importOriginal => {
  const actual = await importOriginal<typeof import('wagmi')>()
  return {
    ...actual,
    useSendCalls: useSendCallsMock,
    useCallsStatus: useCallsStatusMock,
    useWaitForTransactionReceipt: useWaitForTransactionReceiptMock,
  }
})

vi.mock('@repo/lib/modules/web3/UserAccountProvider', async importOriginal => {
  const actual = await importOriginal<typeof import('@repo/lib/modules/web3/UserAccountProvider')>()

  return {
    ...actual,
    useUserAccount: useUserAccountMock,
  }
})

vi.mock('@repo/lib/modules/transactions/RecentTransactionsProvider', async importOriginal => {
  const actual =
    await importOriginal<
      typeof import('@repo/lib/modules/transactions/RecentTransactionsProvider')
    >()

  return {
    ...actual,
    useRecentTransactions: useRecentTransactionsMock,
  }
})

function makeError(code: number): Error {
  const error = new Error('Some RPC error')

  ;(error as Error & { code?: number }).code = code
  return error
}

describe('getEip5792ErrorMessage', () => {
  it('maps error code 5750 to a user-rejected-upgrade message', () => {
    const result = getEip5792ErrorMessage(makeError(5750))

    expect(result.message).toBe(
      'Upgrade rejected. The wallet needs to be upgraded to batch transactions.'
    )
  })

  it('maps error code 5760 to an atomicity-unsupported message', () => {
    const result = getEip5792ErrorMessage(makeError(5760))
    expect(result.message).toBe('Atomic transaction bundling is not supported by this wallet.')
  })

  it('passes through errors with unknown codes unchanged', () => {
    const original = makeError(1234)
    const result = getEip5792ErrorMessage(original)
    expect(result).toBe(original)
    expect(result.message).toBe('Some RPC error')
  })

  it('passes through errors without a code property', () => {
    const original = new Error('Network failure')
    const result = getEip5792ErrorMessage(original)
    expect(result).toBe(original)
  })
})

const onTransactionChange: Mock = vi.fn()

const USER_ADDRESS = '0x1234567890123456789012345678901234567890'
const CALLS_ID = '0xcalls-id'
const TX_HASH = '0xtx-hash' as Hash

const labels: TransactionLabels = {
  tooltip: 'Test tooltip',
  init: 'Add liquidity',
  confirming: 'Confirming transaction',
  confirmed: 'Confirmed transaction',
  reverted: 'Transaction reverted',
}

function makeTxCall(index: number): TxCall {
  return { to: `0x000000000000000000000000000000000000000${index}`, data: '0x' as Hash }
}

function makeCurrentStep(overrides: Partial<TransactionStep> = {}): TransactionStep {
  return {
    id: 'addLiquidity',
    stepType: 'addLiquidity',
    labels,
    isComplete: vi.fn().mockReturnValue(false),
    renderAction: () => null,
    batchableTxCall: makeTxCall(9),
    ...overrides,
  }
}

function makeReceipt(status: 'success' | 'reverted') {
  return {
    transactionHash: TX_HASH,
    status,
    blockNumber: 1n,
    logs: [],
  }
}

type CallsStatusOverride = {
  status?: 'pending' | 'success' | 'failure'
  receipts?: { transactionHash: Hash; status: string }[]
}

type ReceiptOverride = { data?: Awaited<ReturnType<any>> | null }

function mockWagmiDefaults({
  callsStatus,
  receipt,
}: {
  callsStatus?: CallsStatusOverride
  receipt?: ReceiptOverride
} = {}) {
  useSendCallsMock.mockReturnValue({ mutateAsync: sendCallsMock, isPending: false })

  useCallsStatusMock.mockReturnValue({
    data: callsStatus
      ? {
          status: callsStatus.status ?? 'pending',
          receipts: callsStatus.receipts ?? [],
        }
      : undefined,
    isLoading: false,
  })

  useWaitForTransactionReceiptMock.mockReturnValue({
    data: receipt?.data,
    isLoading: false,
  })

  useRecentTransactionsMock.mockReturnValue({
    transactions: {},
    isTxTracked: isTxTrackedMock,
    addTrackedTransaction: addTrackedTransactionMock,
    updateTrackedTransaction: updateTrackedTransactionMock,
    clearTransactions: vi.fn(),
  })
}

describe('useEip5792BatchSubmitter', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    useUserAccountMock.mockReturnValue({ userAddress: USER_ADDRESS, isConnected: true })
    mockWagmiDefaults()
  })

  async function setup(props?: Partial<{ chainId: number; currentStep: TransactionStep }>) {
    const rendered = testHook(
      ({ chainId, currentStep }: { chainId: number; currentStep: TransactionStep }) =>
        useEip5792BatchSubmitter({
          labels,
          chainId,
          currentStep,
          onTransactionChange,
        }),
      {
        initialProps: {
          chainId: props?.chainId ?? 1,
          currentStep: props?.currentStep ?? makeCurrentStep(),
        },
      }
    )

    const { result } = rendered

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    return { result, rerender: rendered.rerender }
  }

  it('renders the ready button state when no batch has been submitted', async () => {
    const { result } = await setup()

    expect(result.current.canSubmit).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeUndefined()
    expect(result.current.label).toBe('Add liquidity')
  })

  it('submits the built tx batch atomically and stores the returned calls id', async () => {
    sendCallsMock.mockResolvedValue({ id: CALLS_ID })

    const currentStep = makeCurrentStep({
      nestedSteps: [
        makeCurrentStep({
          id: 'approval1',
          stepType: 'tokenApproval',
          batchableTxCall: makeTxCall(1),
        }),
        makeCurrentStep({
          id: 'approval2',
          stepType: 'tokenApproval',
          batchableTxCall: makeTxCall(2),
        }),
      ],
    })

    const { result } = await setup({ currentStep })

    await act(() => result.current.submit())

    expect(sendCallsMock).toHaveBeenCalledWith({
      account: USER_ADDRESS,
      chainId: 1,
      calls: [makeTxCall(1), makeTxCall(2), makeTxCall(9)],
      forceAtomic: true,
    })

    expect(result.current.isLoading).toBe(true)
  })

  it('reports pending status while the batch is being confirmed', async () => {
    sendCallsMock.mockResolvedValue({ id: CALLS_ID })
    mockWagmiDefaults({ callsStatus: { status: 'pending' } })

    const { result } = await setup()

    await act(() => result.current.submit())

    await waitFor(() => expect(onTransactionChange).toHaveBeenCalled())

    expect(onTransactionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        chainId: 1,
        result: expect.objectContaining({
          status: 'pending',
          isSuccess: false,
          isError: false,
          isLoading: true,
          data: null,
        }),
      })
    )

    expect(result.current.isLoading).toBe(true)
    expect(result.current.label).toBe('Confirming transaction')
  })

  it('reports success only once the real on-chain receipt is available', async () => {
    sendCallsMock.mockResolvedValue({ id: CALLS_ID })
    // calls status is already success but the receipt has not been fetched yet
    mockWagmiDefaults({ callsStatus: { status: 'success' } })

    const { result, rerender } = await setup()

    await act(() => result.current.submit())

    await waitFor(() => expect(onTransactionChange).toHaveBeenCalled())

    // The button surface follows callsStatus, but the reported result stays pending:
    // reporting success early would surface a missing transaction hash downstream and throw
    expect(result.current.canSubmit).toBe(false)
    expect(result.current.label).toBe('Confirmed transaction')

    expect(onTransactionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        result: expect.objectContaining({ status: 'pending', isSuccess: false }),
      })
    )

    // Once the on-chain receipt arrives, success is reported with it.
    // A rerender re-runs the hook body with the mocked calls status + receipt in place.
    mockWagmiDefaults({
      callsStatus: {
        status: 'success',
        receipts: [{ transactionHash: TX_HASH, status: 'success' }],
      },
      receipt: { data: makeReceipt('success') },
    })

    await act(async () => {
      await rerender({ chainId: 1, currentStep: makeCurrentStep() })
    })

    // The early pending report and the settled success report are separate calls
    expect(onTransactionChange).toHaveBeenCalledTimes(2)

    expect(onTransactionChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        result: expect.objectContaining({
          status: 'success',
          isSuccess: true,
          data: expect.objectContaining({ transactionHash: TX_HASH }),
        }),
      })
    )
  }, 10_000)

  it('reports reverted status when the batch fails', async () => {
    sendCallsMock.mockResolvedValue({ id: CALLS_ID })

    mockWagmiDefaults({
      callsStatus: {
        status: 'failure',
        receipts: [{ transactionHash: TX_HASH, status: 'reverted' }],
      },
      receipt: { data: makeReceipt('reverted') },
    })

    const { result } = await setup()

    await act(() => result.current.submit())

    await waitFor(() =>
      expect(onTransactionChange).toHaveBeenCalledWith(
        expect.objectContaining({
          result: expect.objectContaining({ status: 'reverted', isError: true, isSuccess: false }),
        })
      )
    )

    expect(result.current.canSubmit).toBe(false)
    expect(result.current.label).toBe('Transaction reverted')
  })

  it('does not report the same status twice across poll re-fires', async () => {
    sendCallsMock.mockResolvedValue({ id: CALLS_ID })
    mockWagmiDefaults({ callsStatus: { status: 'pending' } })

    const { result } = await setup()

    await act(() => result.current.submit())

    await waitFor(() => expect(onTransactionChange).toHaveBeenCalledTimes(1))

    // The polling query re-fires with the same data; no new report should happen
    mockWagmiDefaults({ callsStatus: { status: 'pending' } })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
    })

    expect(onTransactionChange).toHaveBeenCalledTimes(1)
  })

  it('exposes the error mapped by getEip5792ErrorMessage and clears the loading state', async () => {
    sendCallsMock.mockRejectedValue(makeError(5750))

    const { result } = await setup()

    await act(() => result.current.submit())

    expect(result.current.error?.message).toBe(
      'Upgrade rejected. The wallet needs to be upgraded to batch transactions.'
    )

    expect(result.current.isLoading).toBe(false)
    expect(result.current.label).toBe('Add liquidity')
    expect(onTransactionChange).not.toHaveBeenCalled()
  })

  it('tracks the batch by calls id as confirming, then re-keys it to the tx hash', async () => {
    sendCallsMock.mockResolvedValue({ id: CALLS_ID })
    isTxTrackedMock.mockReturnValue(true)

    mockWagmiDefaults({
      callsStatus: {
        status: 'success',
        receipts: [{ transactionHash: TX_HASH, status: 'success' }],
      },
      receipt: { data: makeReceipt('success') },
    })

    const { result } = await setup()

    await act(() => result.current.submit())

    await waitFor(() => expect(addTrackedTransactionMock).toHaveBeenCalled())

    expect(addTrackedTransactionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        hash: CALLS_ID,
        type: 'eip5792',
        status: 'confirming',
        chain: 'MAINNET',
        init: labels.init,
        label: labels.confirming,
      }),
      true
    )

    await waitFor(() => expect(updateTrackedTransactionMock).toHaveBeenCalled())

    expect(updateTrackedTransactionMock).toHaveBeenCalledWith(CALLS_ID, {
      hash: TX_HASH,
      label: labels.confirmed,
      status: 'confirmed',
    })

    // Settling with the same tx hash must not trigger a second update
    updateTrackedTransactionMock.mockClear()

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
    })

    expect(updateTrackedTransactionMock).not.toHaveBeenCalled()
  })

  it('re-keys the tracked transaction to reverted when the batch fails', async () => {
    sendCallsMock.mockResolvedValue({ id: CALLS_ID })
    isTxTrackedMock.mockReturnValue(true)

    mockWagmiDefaults({
      callsStatus: {
        status: 'failure',
        receipts: [{ transactionHash: TX_HASH, status: 'reverted' }],
      },
      receipt: { data: makeReceipt('reverted') },
    })

    const { result } = await setup()

    await act(() => result.current.submit())

    await waitFor(() => expect(updateTrackedTransactionMock).toHaveBeenCalled())

    expect(updateTrackedTransactionMock).toHaveBeenCalledWith(CALLS_ID, {
      hash: TX_HASH,
      label: labels.reverted,
      status: 'reverted',
    })
  }, 10_000)
})
