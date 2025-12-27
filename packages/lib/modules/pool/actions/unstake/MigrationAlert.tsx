import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { BalAlertButton } from '@repo/lib/shared/components/alerts/BalAlertButton'
import { BalAlertContent } from '@repo/lib/shared/components/alerts/BalAlertContent'
import { useRouter } from 'next/navigation'
import { getPoolPath } from '../../pool.utils'
import { Pool } from '../../pool.types'

type Props = {
  pool: Pool
}

export function MigrationAlert({ pool }: Props) {
  const router = useRouter()
  const migrate = () => router.push(`${getPoolPath(pool)}/migrate-pool`)
  const description = `
  Migrate your liquidity from this Balancer v2 pool to the recommended similar
  pool on Balancer v3 for BAL liquidity incentives.`

  return (
    <BalAlert
      content={
        <BalAlertContent description={description} wrapText>
          <BalAlertButton onClick={migrate}>Migrate to v3</BalAlertButton>
        </BalAlertContent>
      }
      status="info"
    />
  )
}
