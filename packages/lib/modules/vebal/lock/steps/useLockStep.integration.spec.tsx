import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import {
  ManagedTransactionInput,
  useManagedTransaction,
} from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { defaultTestUserAccount } from '@repo/lib/test/anvil/anvil-setup'
import {
  approveToken,
  getTokenUserBalance,
  setUserTokenBalance,
} from '@repo/lib/test/integration/sdk-utils'
import { testHook, waitForSimulationSuccess } from '@repo/lib/test/utils/custom-renderers'
import { connectWith } from '@repo/lib/test/utils/wagmi/wagmi-connections'
import { mainnetTestPublicClient } from '@repo/lib/test/utils/wagmi/wagmi-test-clients'
import { Address, parseUnits } from 'viem'
import { LockActionType } from './lock-steps.utils'
import { useLockStep } from './useLockStep'

const lockAmount: bigint = parseUnits('10', 18)
const veBalContractAddress = mainnetNetworkConfig.contracts.veBAL as Address
const veBalBpt = mainnetNetworkConfig.tokens.addresses.veBalBpt as Address

function testUseLockStep() {
  const { result } = testHook(
    () => {
      const { _txInput } = useLockStep({
        lockActionType: LockActionType.CreateLock,
        lockAmount,
        lockEndDate: '2025-03-01',
      })

      return useManagedTransaction(_txInput as ManagedTransactionInput)
    },
    { wrapper: TransactionStateProvider }
  )

  return result
}

test('Lock TBD', async () => {
  const veBalHolder = defaultTestUserAccount

  await connectWith(veBalHolder)

  await mainnetTestPublicClient.impersonateAccount({ address: veBalHolder })

  await mainnetTestPublicClient.setBalance({
    address: veBalHolder,
    value: parseUnits('10000000', 18),
  })

  await setUserTokenBalance({
    client: mainnetTestPublicClient,
    account: veBalHolder,
    tokenAddress: veBalBpt,
    balance: parseUnits('3000', 18),
    slot: 0,
  })

  await approveToken({
    client: mainnetTestPublicClient,
    account: veBalHolder,
    token: veBalBpt,
    spender: veBalContractAddress,
    amount: lockAmount,
  })

  const vebalBalance = await getTokenUserBalance({
    client: mainnetTestPublicClient,
    account: veBalHolder,
    tokenAddress: veBalBpt,
  })

  const ethBalance = await mainnetTestPublicClient.getBalance({ address: veBalHolder })

  console.log({ vebalBalance, ethBalance })

  const result = testUseLockStep()

  await waitForSimulationSuccess(result)

  // const totalUsd = await act(async () => {
  //   await result.current.executeAsync()
  // })

  // const result2 = await result.current.executeAsync()

  // console.log('DEBUG', result2)
})
