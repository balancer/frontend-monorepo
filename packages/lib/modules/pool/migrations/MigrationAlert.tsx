import { getChainName } from '@repo/lib/config/app.config'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { BalAlertButton } from '@repo/lib/shared/components/alerts/BalAlertButton'
import { Pool } from '../pool.types'

type Props = {
  pool: Pool
}

export function MigrationAlert({ pool }: Props) {
  return (
    <BalAlert
      action={<BalAlertButton onClick={() => alert('Not implemented')}>Migrate</BalAlertButton>}
      content={`Migrate your position from ${pool.name} (on ${getChainName(pool.chain)}) to the recommended pool`}
      status="info"
    />
  )
}
