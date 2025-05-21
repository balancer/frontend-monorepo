'use client'

import { AddLiquidityProvider } from '@repo/lib/modules/pool/actions/add-liquidity/AddLiquidityProvider'
import { RemoveLiquidityProvider } from '@repo/lib/modules/pool/actions/remove-liquidity/RemoveLiquidityProvider'
import { BaseVariant } from '@repo/lib/modules/pool/pool.types'
import { PoolProvider } from '@repo/lib/modules/pool/PoolProvider'
import { RelayerSignatureProvider } from '@repo/lib/modules/relayer/RelayerSignatureProvider'
import {
  defaultGetTokenPricesQueryMock,
  defaultGetTokensQueryMock,
  defaultGetTokensQueryVariablesMock,
} from '@repo/lib/modules/tokens/__mocks__/token.builders'
import { TokenInputsValidationProvider } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { TokensProvider } from '@repo/lib/modules/tokens/TokensProvider'
import { RecentTransactionsProvider } from '@repo/lib/modules/transactions/RecentTransactionsProvider'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { UserSettingsProvider } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { UserAccountProvider } from '@repo/lib/modules/web3/UserAccountProvider'
import { GqlPoolElement } from '@repo/lib/shared/services/api/generated/graphql'
import { testWagmiConfig } from '@repo/test/anvil/testWagmiConfig'
import { ApolloProvider } from '@apollo/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RenderHookOptions, act, renderHook, waitFor } from '@testing-library/react'
import { PropsWithChildren, ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { aGqlPoolElementMock } from '../msw/builders/gqlPoolElement.builders'
import { apolloTestClient } from '../../../test/utils/apollo-test-client'
import { AppRouterContextProviderMock } from './app-router-context-provider-mock'
import { testQueryClient } from './react-query'
import { Permit2SignatureProvider } from '@repo/lib/modules/tokens/approvals/permit2/Permit2SignatureProvider'
import { PermitSignatureProvider } from '@repo/lib/modules/tokens/approvals/permit2/PermitSignatureProvider'
import { sleep } from '@repo/lib/shared/utils/sleep'

export type Wrapper = ({ children }: PropsWithChildren) => ReactNode

export function EmptyWrapper({ children }: PropsWithChildren) {
  return <>{children}</>
}

export function testHook<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options?: RenderHookOptions<TProps> | undefined
) {
  function MixedProviders({ children }: PropsWithChildren) {
    const LocalProviders = options?.wrapper || EmptyWrapper

    return (
      <GlobalProviders>
        <LocalProviders>{children}</LocalProviders>
      </GlobalProviders>
    )
  }

  const result = renderHook<TResult, TProps>(hook, {
    ...options,
    wrapper: MixedProviders as React.ComponentType<{ children: React.ReactNode }>,
  })

  return {
    ...result,
    waitForLoadedUseQuery,
  }
}

function GlobalProviders({ children }: PropsWithChildren) {
  const defaultRouterOptions = {}

  return (
    <WagmiProvider config={testWagmiConfig} reconnectOnMount={false}>
      <QueryClientProvider client={testQueryClient}>
        <AppRouterContextProviderMock router={defaultRouterOptions}>
          <ApolloProvider client={apolloTestClient}>
            <UserAccountProvider>
              <TokensProvider
                tokenPricesData={defaultGetTokenPricesQueryMock}
                tokensData={defaultGetTokensQueryMock}
                variables={defaultGetTokensQueryVariablesMock}
              >
                <UserSettingsProvider
                  initAcceptedPolicies={undefined}
                  initCurrency="USD"
                  initEnableSignatures="yes"
                  initPoolListView="list"
                  initSlippage="0.2"
                >
                  <RecentTransactionsProvider>{children}</RecentTransactionsProvider>
                </UserSettingsProvider>
              </TokensProvider>
            </UserAccountProvider>
          </ApolloProvider>
        </AppRouterContextProviderMock>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

/**
 *
 * Helper to await for useQuery to finish loading when testing hooks
 *
 * @param hookResult is the result of calling renderHookWithDefaultProviders
 *
 *  Example:
 *    const { result, waitForLoadedUseQuery } = testHook(() => useMyHookUnderTestLogic())
 *    await waitForLoadedUseQuery(result)
 *
 */
export async function waitForLoadedUseQuery(hookResult: { current: { loading: boolean } }) {
  await waitFor(() => expect(hookResult.current.loading).toBeFalsy())
}

export function DefaultAddLiquidityTestProvider({ children }: PropsWithChildren) {
  return (
    <RelayerSignatureProvider>
      <Permit2SignatureProvider>
        <TokenInputsValidationProvider>
          <AddLiquidityProvider>{children}</AddLiquidityProvider>
        </TokenInputsValidationProvider>
      </Permit2SignatureProvider>
    </RelayerSignatureProvider>
  )
}

export function DefaultRemoveLiquidityTestProvider({ children }: PropsWithChildren) {
  return (
    <RelayerSignatureProvider>
      <RemoveLiquidityProvider>{children}</RemoveLiquidityProvider>
    </RelayerSignatureProvider>
  )
}

/* Builds a PoolProvider that injects the provided pool data*/
export const buildDefaultPoolTestProvider = (pool: GqlPoolElement = aGqlPoolElementMock()) =>
  function ({ children }: PropsWithChildren) {
    return (
      <TransactionStateProvider>
        <RelayerSignatureProvider>
          <PermitSignatureProvider>
            <PoolProvider
              chain={pool.chain}
              data={{
                __typename: 'Query',
                pool,
              }}
              id={pool.id}
              variant={BaseVariant.v2}
            >
              {children}
            </PoolProvider>
          </PermitSignatureProvider>
        </RelayerSignatureProvider>
      </TransactionStateProvider>
    )
  }

export const DefaultPoolTestProvider = buildDefaultPoolTestProvider(aGqlPoolElementMock())

// Awaits in the context of a react hook test
export async function actSleep(ms: number) {
  return act(async () => {
    await sleep(ms)
  })
}

export async function waitForSimulationSuccess(hookResult: {
  current: { simulation: { isSuccess: boolean; error: Error | null } }
}) {
  let error: Error | null = null

  await waitFor(() => {
    error = hookResult.current.simulation.error
    if (error) return true

    expect(hookResult.current.simulation.isSuccess).toBeTruthy()
  })

  if (error) {
    throw error
  }
}
