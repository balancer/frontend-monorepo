'use client'

import { notFound } from 'next/navigation'
import { ChainSlug, getChainSlug } from '../pool.utils'
import { usePoolMigrations } from './PoolMigrationsProvider'
import { getChainId } from '@repo/lib/config/app.config'
import { BaseVariant } from '../pool.types'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { TransactionStateProvider } from '../../transactions/transaction-steps/TransactionStateProvider'
import { RelayerSignatureProvider } from '../../relayer/RelayerSignatureProvider'
import { PermitSignatureProvider } from '../../tokens/approvals/permit2/PermitSignatureProvider'
import { PoolActionsLayout } from '../actions/PoolActionsLayout'
import { PriceImpactProvider } from '../../price-impact/PriceImpactProvider'
import { RemoveLiquidityProvider } from '../actions/remove-liquidity/RemoveLiquidityProvider'
import { TokenInputsValidationProvider } from '../../tokens/TokenInputsValidationProvider'
import { Permit2SignatureProvider } from '../../tokens/approvals/permit2/Permit2SignatureProvider'
import { PoolProvider } from '../PoolProvider'
import { AddLiquidityProvider } from '../actions/add-liquidity/AddLiquidityProvider'
import { MigrateLiquidityProvider, useFetchPool } from './MigrateLiquidityProvider'
import { PoolMigrationModal } from './PoolMigrationModal'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { Skeleton } from '@chakra-ui/react'

export interface PoolPathProps {
  id: string
  chain: ChainSlug
  variant: BaseVariant
}

export function PoolMigrationPage({ id, chain, variant }: PoolPathProps) {
  const { userAddress } = useUserAccount()
  const gqlChain = getChainSlug(chain)
  const protocol = Number(variant.replace('v', ''))
  const { getMigration } = usePoolMigrations()
  const migration = getMigration(protocol, getChainId(gqlChain), id as string)

  if (!migration) throw new Error('No migration for the specified pool')

  const {
    data: newPool,
    error,
    loading,
  } = useFetchPool(migration.new.chainId, migration.new.id, userAddress)

  if (error) {
    if (error?.message === 'Pool with id does not exist') notFound()
    throw new Error('Failed to fetch pool')
  } else if (!loading && !newPool) {
    throw new Error('Failed to fetch pool')
  }

  if (!newPool) return <Skeleton />

  return (
    <DefaultPageContainer>
      <TransactionStateProvider>
        <RelayerSignatureProvider>
          <PermitSignatureProvider>
            <PoolActionsLayout closeButton={false}>
              <PriceImpactProvider>
                <RemoveLiquidityProvider>
                  <TokenInputsValidationProvider>
                    <Permit2SignatureProvider>
                      <PoolProvider chain={gqlChain} data={newPool} id={migration.new.id}>
                        <AddLiquidityProvider>
                          <MigrateLiquidityProvider
                            chainId={migration.old.chainId}
                            poolId={migration.old.id}
                            protocol={migration.old.protocol}
                          >
                            <PoolMigrationModal />
                          </MigrateLiquidityProvider>
                        </AddLiquidityProvider>
                      </PoolProvider>
                    </Permit2SignatureProvider>
                  </TokenInputsValidationProvider>
                </RemoveLiquidityProvider>
              </PriceImpactProvider>
            </PoolActionsLayout>
          </PermitSignatureProvider>
        </RelayerSignatureProvider>
      </TransactionStateProvider>
    </DefaultPageContainer>
  )
}
