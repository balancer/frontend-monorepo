import { MockParameters, mock } from 'wagmi/connectors'

import { Address, Hex, RpcRequestError, keccak256, numberToHex, stringToHex } from 'viem'
import { CreateConnectorFn } from 'wagmi'

type CustomMockOptions = {
  impersonationAddress?: Address
}

export const EIP5792_EMULATION_LS_KEY = 'e2e.enableEip5792Emulation'

function isEip5792EmulationEnabled(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.localStorage.getItem(EIP5792_EMULATION_LS_KEY) === 'true'
  )
}

type EmulatedSendCallsParams = {
  calls: { to: Hex; data?: Hex; value?: string }[]
  chainId?: Hex
  from?: Address
}

/*
  Wrapper over wagmi mock to override getAccounts method and, when enabled via
  localStorage (see packages/e2e-tests/tests/dev/balancer/batched-transactions.spec.ts),
  emulate the EIP-5792 methods of an atomic-batching wallet so the batched
  transaction flow can be exercised against the anvil fork without a real
  smart-account wallet.
 */
export function customMock(
  originalParameters: MockParameters,
  options: CustomMockOptions = {}
): CreateConnectorFn {
  const originalMock = mock(originalParameters)

  return (config: any) => {
    const connector = originalMock(config)

    // Add impersonated address to the list of accounts to allow non default anvil accounts to approve and run transactions
    if (options.impersonationAddress) {
      const originalGetAccounts = connector.getAccounts.bind(connector)

      connector.getAccounts = async () => {
        const originalAccounts = await originalGetAccounts()
        return [options.impersonationAddress, ...originalAccounts] as readonly Address[]
      }
    }

    if (isEip5792EmulationEnabled()) {
      withEip5792Emulation(connector, config)
    }

    return connector
  }
}

/*
  Emulates the EIP-5792 surface of a wallet with atomic batching support
  (like an EIP-7702 upgraded EOA):
  - wallet_getCapabilities reports the atomic capability as supported
  - wallet_sendCalls forwards every call sequentially to eth_sendTransaction
  - wallet_getCallsStatus aggregates the underlying transaction receipts
*/
function withEip5792Emulation(connector: any, config: any): void {
  const callsHashesById = new Map<string, Hex[]>()
  let callsCounter = 0

  const originalGetProvider = connector.getProvider.bind(connector)

  connector.getProvider = async (...args: any[]) => {
    const provider = await originalGetProvider(...args)
    const providerAny = provider as any

    if (!providerAny.isEip5792Emulated) {
      providerAny.isEip5792Emulated = true

      const originalRequest = providerAny.request.bind(providerAny)

      providerAny.request = async ({ method, params }: { method: string; params: any[] }) => {
        if (method === 'wallet_getCapabilities') {
          // Report the atomic capability for every configured chain so wagmi's
          // useCapabilities hook treats this wallet as batch-capable
          return Object.fromEntries(
            config.chains.map((chain: any) => [
              numberToHex(chain.id),
              { atomic: { status: 'supported' } },
            ])
          )
        }

        if (method === 'wallet_sendCalls') {
          const [sendCallsParams] = params as [EmulatedSendCallsParams]
          const hashes: Hex[] = []

          for (const call of sendCallsParams.calls) {
            try {
              const hash = (await originalRequest({
                method: 'eth_sendTransaction',
                params: [
                  {
                    to: call.to,
                    data: call.data,
                    value: call.value,
                    ...(sendCallsParams.from ? { from: sendCallsParams.from } : {}),
                  },
                ],
              })) as Hex

              hashes.push(hash)
            } catch (error) {
              throw new RpcRequestError({
                body: { method, params },
                error: error as { code: number; message: string },
                url: '',
              })
            }
          }

          callsCounter += 1
          const id = keccak256(stringToHex(`eip5792-emulated-batch-${callsCounter}`))
          callsHashesById.set(id, hashes)

          return { id }
        }

        if (method === 'wallet_getCallsStatus') {
          const [id] = params as [string]
          const hashes = callsHashesById.get(id)

          if (!hashes || hashes.length === 0) {
            return { atomic: true, status: 100, receipts: [], version: '2.0.0' }
          }

          const receipts = (
            await Promise.all(
              hashes.map(async hash => {
                try {
                  return await originalRequest({
                    method: 'eth_getTransactionReceipt',
                    params: [hash],
                  })
                } catch {
                  return null
                }
              })
            )
          ).filter(Boolean)

          if (receipts.length === 0) {
            return { atomic: true, status: 100, receipts: [], version: '2.0.0' }
          }

          const isSuccessful = receipts.every(receipt => (receipt as any).status === '0x1')

          return {
            atomic: true,
            status: isSuccessful ? 200 : 500,
            receipts,
            version: '2.0.0',
          }
        }

        return originalRequest({ method, params })
      }
    }

    return provider
  }
}
