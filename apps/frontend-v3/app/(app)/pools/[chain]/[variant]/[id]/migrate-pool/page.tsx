import {
  PoolMigrationPage,
  PoolPathProps,
} from '@repo/lib/modules/pool/migrations/PoolMigrationPage'

export default async function MigratePoolWrapper({ params }: { params: Promise<PoolPathProps> }) {
  const { id, chain, variant } = await params
  return <PoolMigrationPage chain={chain} id={id} variant={variant} />
}
