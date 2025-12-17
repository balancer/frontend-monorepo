import { getChainName } from '@repo/lib/config/app.config'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { BalAlertButton } from '@repo/lib/shared/components/alerts/BalAlertButton'
import { Pool } from '../pool.types'
import { useDisclosure } from '@chakra-ui/react'
import { UnstakeWarningModal } from './UnstakeWarningModal'
import { hasAuraStakedBalance, hasBalancerStakedBalance } from '../user-balance.helpers'

type Props = {
  pool: Pool
}

export function MigrationAlert({ pool }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const hasStakedBalance = hasBalancerStakedBalance(pool) || hasAuraStakedBalance(pool)

  const migrate = () => {
    if (hasStakedBalance) {
      onOpen()
    } else {
      // FIXME: [JUANJO] launch migration flow
      alert('Not implemented')
    }
  }

  return (
    <>
      <BalAlert
        action={<BalAlertButton onClick={migrate}>Migrate</BalAlertButton>}
        content={`Migrate your position from ${pool.name} (on ${getChainName(pool.chain)}) to the recommended pool`}
        status="info"
      />
      <UnstakeWarningModal isOpen={isOpen} onClose={onClose} pool={pool} />
    </>
  )
}
