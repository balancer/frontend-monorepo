import { getChainId, getChainName } from '@repo/lib/config/app.config'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { BalAlertButton } from '@repo/lib/shared/components/alerts/BalAlertButton'
import { BaseVariant, Pool } from '../pool.types'
import { Link, Text, useDisclosure } from '@chakra-ui/react'
import { UnstakeWarningModal } from './UnstakeWarningModal'
import {
  hasAuraStakedBalance,
  hasBalancerStakedBalance,
  hasTotalBalance,
} from '../user-balance.helpers'
import { useRouter } from 'next/navigation'
import { chainToSlugMap, getPoolPath } from '../pool.utils'
import { BalAlertContent } from '@repo/lib/shared/components/alerts/BalAlertContent'
import { usePoolMigrations } from './PoolMigrationsProvider'

type Props = {
  pool: Pool
}

export function MigrationAlert({ pool }: Props) {
  const userHasBalance = hasTotalBalance(pool)

  if (userHasBalance) {
    return <AlertWithBalance pool={pool} />
  } else {
    return <AlertWithoutBalance pool={pool} />
  }
}

function AlertWithBalance({ pool }: Props) {
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const hasStakedBalance = hasBalancerStakedBalance(pool) || hasAuraStakedBalance(pool)

  const migrate = () => {
    if (hasStakedBalance) {
      onOpen()
    } else {
      router.push(`${getPoolPath(pool)}/migrate-pool`)
    }
  }

  return (
    <>
      <BalAlert
        content={
          <BalAlertContent
            description={`Migrate your position from ${pool.name} (on ${getChainName(pool.chain)}) to the recommended pool`}
            forceColumnMode={true}
          >
            <BalAlertButton onClick={migrate}>Migrate</BalAlertButton>
          </BalAlertContent>
        }
        status="info"
      />
      <UnstakeWarningModal isOpen={isOpen} onClose={onClose} pool={pool} />
    </>
  )
}

function AlertWithoutBalance({ pool }: Props) {
  const { getMigration } = usePoolMigrations()
  const migration = getMigration(pool.protocolVersion, getChainId(pool.chain), pool.id)
  const poolPath = `/pools/${chainToSlugMap[pool.chain]}/${BaseVariant.v3}/${migration?.new.id || ''}`

  return (
    <BalAlert
      content={
        <Text color="black">
          The recommended similar pool on v3 for migration is:{' '}
          <Link href={poolPath} textDecoration="underline">
            {pool.address}
          </Link>
        </Text>
      }
      status="info"
    ></BalAlert>
  )
}
