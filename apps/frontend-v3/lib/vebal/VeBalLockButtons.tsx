import { Button, ButtonProps } from '@chakra-ui/react'
import { getVeBalManagePath } from './vebal-navigation'
import NextLink from 'next/link'
import { useVebalLockData } from '@repo/lib/modules/vebal/VebalLockDataProvider'

type Props = {
  variant?: 'primary'
  size?: ButtonProps['size']
}

export function VeBalLockButtons(props: Props) {
  return (
    <>
      <VeBalExtendLockButton {...props} />
      <VeBalGetOrUnLockButton {...props} />
    </>
  )
}

function VeBalExtendLockButton({ variant = undefined, size = 'lg' }: Props) {
  const lockData = useVebalLockData()

  if (!lockData.mainnetLockedInfo.hasExistingLock) return null

  return (
    <Button
      as={NextLink}
      href={getVeBalManagePath('extend', 'manage')}
      isLoading={lockData.isLoading}
      size={size}
      variant={variant}
    >
      Extend lock
    </Button>
  )
}

function VeBalGetOrUnLockButton({ size = 'lg' }: Props) {
  const lockData = useVebalLockData()
  return (
    <Button
      as={NextLink}
      href={
        lockData.mainnetLockedInfo.isExpired
          ? getVeBalManagePath('unlock', 'manage')
          : getVeBalManagePath('lock', 'manage')
      }
      isLoading={lockData.isLoading}
      size={size}
      variant="primary"
    >
      {lockData.mainnetLockedInfo.isExpired ? 'Unlock' : 'Get veBAL'}
    </Button>
  )
}

export function VeBalIncreaseButton({ variant = undefined, size = 'lg' }: Props) {
  const lockData = useVebalLockData()

  if (!lockData.mainnetLockedInfo.hasExistingLock) return null

  return (
    <Button
      as={NextLink}
      href={getVeBalManagePath('lock', 'manage')}
      isLoading={lockData.isLoading}
      size={size}
      variant={variant}
    >
      Increase veBAL
    </Button>
  )
}
