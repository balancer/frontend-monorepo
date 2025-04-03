import { ChainId } from '@balancer/sdk'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import {
  ManagedTransactionInput,
  useManagedTransaction,
} from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { defaultTestUserAccount } from '@repo/lib/test/anvil/anvil-setup'
import { approveToken, resetBlock, setUserTokenBalance } from '@repo/lib/test/integration/sdk-utils'
import { testHook, waitForSimulationSuccess } from '@repo/lib/test/utils/custom-renderers'
import { connectAndImpersonate } from '@repo/lib/test/utils/wagmi/wagmi-connections'
import { mainnetTestPublicClient } from '@repo/lib/test/utils/wagmi/wagmi-test-clients'
import { Address, parseUnits } from 'viem'
import { LockActionType } from './lock-steps.utils'
import { useLockStep } from './useLockStep'

const lockAmount: bigint = parseUnits('3000', 18)
const veBalContractAddress = mainnetNetworkConfig.contracts.veBAL as Address
const veBalBpt = mainnetNetworkConfig.tokens.addresses.veBalBpt as Address

function testUseLockStep() {
  const { result } = testHook(
    () => {
      const { _txInput } = useLockStep({
        lockActionType: LockActionType.CreateLock,
        lockAmount,
        // TODO: calculate date from block timestamp (via new utils function)
        lockEndDate: '2026-03-01',
      })

      return useManagedTransaction(_txInput as ManagedTransactionInput)
    },
    { wrapper: TransactionStateProvider }
  )

  return result
}

test('Lock big veBal amount', async () => {
  const veBalHolder = defaultTestUserAccount

  await resetBlock({
    client: mainnetTestPublicClient,
    chain: ChainId.MAINNET,
  })

  await connectAndImpersonate(veBalHolder, ChainId.MAINNET)

  await setUserTokenBalance({
    client: mainnetTestPublicClient,
    account: veBalHolder,
    tokenAddress: veBalBpt,
    balance: lockAmount,
    slot: 0,
  })

  await approveToken({
    client: mainnetTestPublicClient,
    account: veBalHolder,
    token: veBalBpt,
    spender: veBalContractAddress,
    amount: lockAmount,
  })

  const result = testUseLockStep()
  await waitForSimulationSuccess(result)
})
