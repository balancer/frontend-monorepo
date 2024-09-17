import { testAccountIndex } from '@/test/anvil/anvil-setup'
import { addTestUserAddress, testWagmiConfig } from '@/test/anvil/testWagmiConfig'
import { act } from '@testing-library/react'
import { Address } from 'viem'
import { Connector } from 'wagmi'
import { connect, disconnect } from 'wagmi/actions'

export async function connectWithDefaultUser() {
  const connector = testWagmiConfig.connectors[0]
  // Connect with defaultTestUserAccount 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
  await connectWithTestConnector(connector)
}

export async function disconnectDefaultUser() {
  const connector = testWagmiConfig.connectors[0]
  // Disconnect  defaultTestUserAccount 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
  await act(() => disconnectFromTestConnector(connector))
}

export async function connectWithAlternativeUser() {
  // Connect with alternativeTestUserAccount 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720
  const connector = testWagmiConfig.connectors[1]
  await connectWithTestConnector(connector)
}

export async function connectWith(testAccount: Address) {
  addTestUserAddress(testAccount)
  const connector = testWagmiConfig.connectors[testAccountIndex(testAccount)]
  await connectWithTestConnector(connector)
}

export async function disconnectAlternativeUser() {
  // Disconnect with alternativeTestUserAccount 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720
  const connector = testWagmiConfig.connectors[1]
  await act(() => disconnectFromTestConnector(connector))
}

export async function disconnectWith(testAccount: Address) {
  const connector = testWagmiConfig.connectors[testAccountIndex(testAccount)]
  await act(() => disconnectFromTestConnector(connector))
}

async function connectWithTestConnector(connector: Connector) {
  return act(() =>
    connect(testWagmiConfig, { connector }).catch(e => {
      //Ignore error
      if (e.message.startsWith('Connector already connected')) return
      // Log connection errors without making the test fail
      console.error(e.message)
    })
  )
}

async function disconnectFromTestConnector(connector: Connector) {
  await act(() =>
    disconnect(testWagmiConfig, { connector }).catch(
      e => console.error(e.message) // Log connection errors without making the test fail
    )
  )
}
