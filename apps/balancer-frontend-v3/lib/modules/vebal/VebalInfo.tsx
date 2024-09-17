import { useVebalLockInfo } from './useVebalLockInfo'
import { bn, fNum } from '@/lib/shared/utils/numbers'
import { differenceInDays, format } from 'date-fns'
import { useUserAccount } from '../web3/UserAccountProvider'
import { Stack, Text } from '@chakra-ui/react'
import { VeBALLocksChart } from './vebal-chart/VebalLocksChart'
import { useVebalUserData } from './useVebalUserData'
import { useTokenBalances } from '../tokens/TokenBalancesProvider'
import mainnetNetworkConfig from '@/lib/config/networks/mainnet'

export function VebalInfo() {
  const lockInfo = useVebalLockInfo()
  const { isConnected } = useUserAccount()

  const { data } = useVebalUserData()

  const lockedUntil = !lockInfo.mainnetLockedInfo.lockedEndDate
    ? '-'
    : format(lockInfo.mainnetLockedInfo.lockedEndDate, 'yyyy-MM-dd')

  const percentOfAllSupply = bn(data?.veBalGetUser.balance || 0).div(
    lockInfo.mainnetLockedInfo.totalSupply || 0
  )

  const { balanceFor } = useTokenBalances()
  const unlockedBalance = balanceFor(mainnetNetworkConfig.tokens.addresses.veBalBpt)

  const lockData = [
    {
      title: 'Locked veBAL',
      value: lockInfo.mainnetLockedInfo.lockedAmount,
    },
    {
      title: 'Unlocked veBAL',
      value: unlockedBalance?.formatted,
    },
  ]

  const vebalData = [
    {
      title: 'My veBAL',
      value: data?.veBalGetUser.balance,
    },
    {
      title: '',
      value: lockedUntil
        ? `Expires ${lockedUntil} (${differenceInDays(new Date(lockedUntil), new Date())} days)`
        : '',
    },
    {
      title: '% of all supply',
      value: fNum('feePercent', percentOfAllSupply),
    },
    {
      title: 'Rank',
      value: data?.veBalGetUser.rank,
    },
  ]

  if (!isConnected) {
    return <Text>Not connected</Text>
  }

  return (
    <Stack spacing="lg">
      {vebalData.map(({ title, value }) => (
        <Stack key={title} spacing="2">
          <Text fontWeight={700} fontSize="lg">
            {title}
          </Text>
          <Text>{value}</Text>
        </Stack>
      ))}
      <Stack spacing="lg">
        {lockData.map(({ title, value }) => (
          <Stack key={title} spacing="2">
            <Text>{title}</Text>
            <Text>{value}</Text>
          </Stack>
        ))}
      </Stack>
      <VeBALLocksChart />
    </Stack>
  )
}
