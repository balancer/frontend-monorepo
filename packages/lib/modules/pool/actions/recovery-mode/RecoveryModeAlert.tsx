import { BalAlertButton } from '@repo/lib/shared/components/alerts/BalAlertButton'
import { Pool } from '../../pool.types'
import { AlertStatus } from '@chakra-ui/react'
import { usePathname, useRouter } from 'next/navigation'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export function recoveryModeAlert(pool: Pool) {
  const isV3 = pool.protocolVersion === 3

  const content = isV3
    ? 'Liquidity can’t be removed unless recovery mode is enabled. You may trigger recovery or wait for someone else to do it.'
    : `Liquidity can’t be removed until ${PROJECT_CONFIG.projectName} governance authorized recovery mode after assessing the situation.`

  return {
    identifier: 'poolIsPaused',
    title: 'This pool is paused',
    content,
    status: 'warning' as AlertStatus,
    isSoftWarning: false,
    action: isV3 ? <RecoveryAction /> : undefined,
  }
}

function RecoveryAction() {
  const router = useRouter()
  const pathname = usePathname()

  const openRecoveryModeModal = () => router.push(`${pathname}/enable-recovery-mode`)

  return (
    <>
      <BalAlertButton onClick={openRecoveryModeModal}>Enable recovery mode</BalAlertButton>
    </>
  )
}
