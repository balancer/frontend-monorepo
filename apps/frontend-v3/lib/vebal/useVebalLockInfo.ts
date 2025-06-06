import { useMemo } from 'react'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { Hex, formatUnits } from 'viem'
import { bn } from '@repo/lib/shared/utils/numbers'
import { mainnet } from 'viem/chains'
import { oneWeekInMs, toJsTimestamp } from '@repo/lib/shared/utils/time'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { AbiMap } from '@repo/lib/modules/web3/contracts/AbiMap'
import { useMulticall } from '@repo/lib/modules/web3/contracts/useMulticall'

const MINIMUM_LOCK_TIME = oneWeekInMs

interface MulticallLockInfoResponse {
  locked: {
    locked: {
      result?: {
        amount: bigint
        end: bigint
      }
      status: string
    }
  }
  epoch: {
    epoch: {
      result?: bigint
      status: string
    }
  }
  totalSupply: {
    totalSupply: {
      result?: bigint
      status: string
    }
  }
}

export type UseVebalLockInfoResult = ReturnType<typeof useVebalLockInfo>

export function useVebalLockInfo() {
  const { userAddress, isConnected } = useUserAccount()

  const lockInfoRequestsData = [
    {
      path: 'locked',
      fn: 'locked',
      args: [userAddress],
    },
    {
      path: 'epoch',
      fn: 'epoch',
    },
    {
      path: 'totalSupply',
      fn: 'totalSupply',
    },
  ]

  // get lock info
  const lockInfoRequests = lockInfoRequestsData.map(v => {
    return {
      chainId: mainnet.id,
      id: `${v.path}.${v.fn}`,
      abi: AbiMap['balancer.veBAL'] as any,
      address: mainnetNetworkConfig.contracts.veBAL as Hex,
      functionName: v.fn,
      args: v.args,
    }
  })

  const { results, refetchAll, isLoading } = useMulticall(lockInfoRequests, {
    enabled: isConnected,
  })

  const mainnetLockedInfo = useMemo(() => {
    const mainnetResults = results[mainnetNetworkConfig.chainId]

    if (!mainnetResults) {
      // handle empty
      return {}
    }

    if (mainnetResults.status === 'error') {
      // handle error
      return {}
    }

    if (mainnetResults.status === 'pending') {
      // handle loading
      return {}
    }

    const data = mainnetResults.data as MulticallLockInfoResponse

    const lockedData = data.locked.locked
    const totalSupply = data.totalSupply.totalSupply.result || BigInt(0)
    const epoch = data.epoch.epoch

    const lockedAmount = lockedData.result?.amount || BigInt(0)
    const lockedEndDate = lockedData.result?.end || BigInt(0)

    const hasExistingLock = bn(lockedAmount).gt(0)
    const lockedEndDateNormalised = toJsTimestamp(Number(lockedEndDate))
    const isExpired = hasExistingLock && Date.now() > lockedEndDateNormalised
    const lockTooShort =
      hasExistingLock && !isExpired && lockedEndDateNormalised < Date.now() + MINIMUM_LOCK_TIME

    return {
      lockedEndDate: lockedEndDateNormalised,
      lockedAmount: formatUnits(lockedAmount, 18),
      totalSupply: formatUnits(totalSupply, 18),
      epoch: String(epoch.result),
      hasExistingLock,
      isExpired,
      lockTooShort,
    }
  }, [results])

  return { results, mainnetLockedInfo, isLoading, refetchAll }
}
