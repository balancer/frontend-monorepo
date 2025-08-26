import { BalAlertButton } from '@repo/lib/shared/components/alerts/BalAlertButton'
import { Pool } from '../../pool.types'
import { AlertStatus } from '@chakra-ui/react'

export function recoveryModeAlert(pool: Pool) {
  const isV3 = pool.protocolVersion === 3
  const content = isV3
    ? 'Liquidity can’t be removed unless recovery mode is enabled. You may trigger recovery or wait for someone else to do it.'
    : 'Liquidity can’t be removed until Balancer governance authorized recovery mode after assessing the situation.'

  return {
    identifier: 'poolIsPaused',
    title: 'This pool is paused',
    content,
    status: 'warning' as AlertStatus,
    isSoftWarning: false,
    action: isV3 ? (
      <BalAlertButton onClick={openRecoveryActionModal}>Enable recovery mode</BalAlertButton>
    ) : undefined,
  }
}

function openRecoveryActionModal() {
  alert('Opening the recovery modal')
}
