import { getChainName } from '@repo/lib/config/app.config'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { BalAlertButton } from '@repo/lib/shared/components/alerts/BalAlertButton'
import { Pool } from '../pool.types'
import { useDisclosure } from '@chakra-ui/react'
import { UnstakeWarningModal } from './UnstakeWarningModal'
import { hasAuraStakedBalance, hasBalancerStakedBalance } from '../user-balance.helpers'
import { useRouter } from 'next/navigation'
import { getPoolPath } from '../pool.utils'
import { BalAlertContent } from '@repo/lib/shared/components/alerts/BalAlertContent'

type Props = {
  pool: Pool
}

export function MigrationAlert({ pool }: Props) {
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
