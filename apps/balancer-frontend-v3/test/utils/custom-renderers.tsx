'use client'

import { AddLiquidityProvider } from '@/lib/modules/pool/actions/add-liquidity/AddLiquidityProvider'
import { RemoveLiquidityProvider } from '@/lib/modules/pool/actions/remove-liquidity/RemoveLiquidityProvider'
import { BaseVariant } from '@/lib/modules/pool/pool.types'
import { PoolProvider } from '@/lib/modules/pool/PoolProvider'
import { RelayerSignatureProvider } from '@/lib/modules/relayer/RelayerSignatureProvider'
import {
  defaultGetTokenPricesQueryMock,
  defaultGetTokensQueryMock,
  defaultGetTokensQueryVariablesMock,
} from '@/lib/modules/tokens/__mocks__/token.builders'
import { TokenInputsValidationProvider } from '@/lib/modules/tokens/TokenInputsValidationProvider'
import { TokensProvider } from '@/lib/modules/tokens/TokensProvider'
import { RecentTransactionsProvider } from '@/lib/modules/transactions/RecentTransactionsProvider'
import { TransactionStateProvider } from '@/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { UserSettingsProvider } from '@/lib/modules/user/settings/UserSettingsProvider'
import { UserAccountProvider } from '@/lib/modules/web3/UserAccountProvider'
import { GqlPoolElement } from '@/lib/shared/services/api/generated/graphql'
import { testWagmiConfig } from '@/test/anvil/testWagmiConfig'
import { ApolloProvider } from '@apollo/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RenderHookOptions, renderHook, waitFor } from '@testing-library/react'
import { PropsWithChildren, ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { aGqlPoolElementMock } from '../msw/builders/gqlPoolElement.builders'
import { apolloTestClient } from './apollo-test-client'
import { AppRouterContextProviderMock } from './app-router-context-provider-mock'
import { testQueryClient } from './react-query'

export type WrapperProps = { children: ReactNode }
export type Wrapper = ({ children }: WrapperProps) => ReactNode

export const EmptyWrapper = ({ children }: WrapperProps) => <>{children}</>

export function testHook<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options?: RenderHookOptions<TProps> | undefined
) {
  function MixedProviders({ children }: WrapperProps) {
    const LocalProviders = options?.wrapper || EmptyWrapper

    return (
      <GlobalProviders>
        <LocalProviders>{children}</LocalProviders>
      </GlobalProviders>
    )
  }

  const result = renderHook<TResult, TProps>(hook, {
    ...options,
    wrapper: MixedProviders,
  })

  return {
    ...result,
    waitForLoadedUseQuery,
  }
}

function GlobalProviders({ children }: WrapperProps) {
  const defaultRouterOptions = {}

  return (
    <WagmiProvider config={testWagmiConfig} reconnectOnMount={false}>
      <QueryClientProvider client={testQueryClient}>
        <AppRouterContextProviderMock router={defaultRouterOptions}>
          <ApolloProvider client={apolloTestClient}>
            <UserAccountProvider>
              <TokensProvider
                tokensData={defaultGetTokensQueryMock}
                tokenPricesData={defaultGetTokenPricesQueryMock}
                variables={defaultGetTokensQueryVariablesMock}
              >
                <UserSettingsProvider
                  initCurrency={'USD'}
                  initSlippage={'0.2'}
                  initPoolListView={'list'}
                  initEnableSignatures="yes"
                  initAcceptedPolicies={undefined}
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
 *    const { result, waitForLoadedUseQuery } = testHook(() => _useMyHookUnderTest())
 *    await waitForLoadedUseQuery(result)
 *
 */
export async function waitForLoadedUseQuery(hookResult: { current: { loading: boolean } }) {
  await waitFor(() => expect(hookResult.current.loading).toBeFalsy())
}

export const DefaultAddLiquidityTestProvider = ({ children }: PropsWithChildren) => (
  <RelayerSignatureProvider>
    <TokenInputsValidationProvider>
      <AddLiquidityProvider>{children}</AddLiquidityProvider>
    </TokenInputsValidationProvider>
  </RelayerSignatureProvider>
)

export const DefaultRemoveLiquidityTestProvider = ({ children }: PropsWithChildren) => (
  <RelayerSignatureProvider>
    <RemoveLiquidityProvider>{children}</RemoveLiquidityProvider>
  </RelayerSignatureProvider>
)

/* Builds a PoolProvider that injects the provided pool data*/
export const buildDefaultPoolTestProvider =
  (pool: GqlPoolElement = aGqlPoolElementMock()) =>
  // eslint-disable-next-line react/display-name
  ({ children }: PropsWithChildren) => {
    return (
      <TransactionStateProvider>
        <RelayerSignatureProvider>
          <PoolProvider
            id={pool.id}
            chain={pool.chain}
            variant={BaseVariant.v2}
            data={{
              __typename: 'Query',
              pool,
            }}
          >
            {children}
          </PoolProvider>
        </RelayerSignatureProvider>
      </TransactionStateProvider>
    )
  }

export const DefaultPoolTestProvider = buildDefaultPoolTestProvider(aGqlPoolElementMock())
