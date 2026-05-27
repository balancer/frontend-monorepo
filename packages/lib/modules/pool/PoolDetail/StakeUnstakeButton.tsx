import {
    Button
} from '@chakra-ui/react'
import { bn } from "@repo/lib/shared/utils/numbers"
import { usePathname, useRouter } from 'next/navigation'
import { getCanStake } from '../actions/stake.helpers'
import { Pool } from '../pool.types'
import {
    calcGaugeStakedBalance,
    getUserWalletBalance
} from '../user-balance.helpers'

type StakeUnstakeButtonProps = {
  pool: Pool
  action: 'stake' | 'unstake'
}

export function StakeUnstakeButton({ pool, action }: StakeUnstakeButtonProps) {
  const router = useRouter()
  const pathname = usePathname()

  const canStake = getCanStake(pool)
  const hasUnstakedBalance = bn(getUserWalletBalance(pool)).gt(0)
  const hasGaugeStakedBalance = bn(calcGaugeStakedBalance(pool)).gt(0)

  const isStakeAction = action === 'stake'
  const isDisabled = isStakeAction ? !(canStake && hasUnstakedBalance) : !hasGaugeStakedBalance

  const buttonVariant = isStakeAction
    ? canStake && hasUnstakedBalance
      ? 'secondary'
      : 'disabled'
    : hasGaugeStakedBalance
      ? 'tertiary'
      : 'disabled'

  const handleClick = () => router.push(`${pathname}/${isStakeAction ? 'stake' : 'unstake'}`)

  return (
    <Button
      flex="1"
      isDisabled={isDisabled}
      maxW="120px"
      onClick={handleClick}
      variant={buttonVariant}
    >
      {isStakeAction ? 'Stake' : 'Unstake'}
    </Button>
  )
}
