import {
  AppRouterContext,
  AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { ReactNode } from 'react'

export type AppRouterContextProviderMockProps = {
  router: Partial<AppRouterInstance>
  children: ReactNode
}

// https://github.com/vercel/next.js/discussions/48937
export const AppRouterContextProviderMock = ({
  router,
  children,
}: AppRouterContextProviderMockProps): ReactNode => {
  const mockedRouter: AppRouterInstance = {
    back: vi.fn(),
    forward: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    ...router,
  }
  return <AppRouterContext.Provider value={mockedRouter}>{children}</AppRouterContext.Provider>
}
