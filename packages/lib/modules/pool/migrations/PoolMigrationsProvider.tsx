'use client'

import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren } from 'react'
import { PoolMigration } from './getPoolMigrations'

export type UsePoolsMigrationsResult = ReturnType<typeof usePoolsMigrationsLogic>
export const PoolsMigrationsContext = createContext<UsePoolsMigrationsResult | null>(null)

export function usePoolsMigrationsLogic(poolMigrations: PoolMigration[]) {
  return poolMigrations
}

export function PoolMigrationsProvider({
  children,
  poolMigrations,
}: PropsWithChildren & { poolMigrations: PoolMigration[] }) {
  const hook = usePoolsMigrationsLogic(poolMigrations)
  return <PoolsMigrationsContext.Provider value={hook}>{children}</PoolsMigrationsContext.Provider>
}

export const usePoolMigrations = () =>
  useMandatoryContext(PoolsMigrationsContext, 'PoolsMigrations')
