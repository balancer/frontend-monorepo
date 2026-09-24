import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { act, waitFor } from '@testing-library/react'
import { encodeFunctionData, erc20Abi, parseUnits } from 'viem'
import { connectWithDefaultUser } from '@repo/test/utils/wagmi/wagmi-connections'
import { sonicTestPublicClient } from '@repo/test/utils/wagmi/wagmi-test-clients'
import { useManagedSendTransaction } from './useManagedSendTransaction'
import { TransactionConfig } from './contract.types'
import {
  SONIC_CHAIN_ID,
  seedSonicTestAccount,
  sonicContracts,
  sonicTokens,
} from '@repo/lib/test/integration/sonic-fixtures'

const account = defaultTestUserAccount

/*
  Exercises the send / wait / receipt lifecycle of useManagedSendTransaction with a plain
  erc20 approval on the Sonic fork, so it does not depend on any liquidity scenario.
*/
const txConfig: TransactionConfig = {
  account,
  chainId: SONIC_CHAIN_ID,
  to: sonicTokens.ws,
  data: encodeFunctionData({
    abi: erc20Abi,
    functionName: 'approve',
    args: [sonicContracts.vaultV2, parseUnits('100', 18)],
  }),
}

describe('useManagedSendTransaction', () => {
  test('Sends transaction and waits for the receipt', async () => {
    await connectWithDefaultUser()
    await seedSonicTestAccount()

    const { result } = testHook(() => {
      return useManagedSendTransaction({
        labels: { init: 'foo', tooltip: 'bar' },
        txConfig,
        onTransactionChange: () => {},
      })
    })

    await waitFor(() => expect(result.current.simulation.data).toBeDefined())

    await act(async () => result.current.executeAsync?.())

    const hash = await waitFor(() => {
      const hash = result.current.execution.data
      expect(result.current.execution.data).toBeDefined()
      return hash
    })

    const transactionReceipt = await act(async () =>
      sonicTestPublicClient.waitForTransactionReceipt({ hash: hash! })
    )

    expect(transactionReceipt.status).to.eq('success')
  })
})
