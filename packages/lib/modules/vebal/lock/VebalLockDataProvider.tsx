'use client'

import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren, useMemo } from 'react'
import { bn } from '@repo/lib/shared/utils/numbers'
import { formatUnits, Hex } from 'viem'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { mainnet } from 'viem/chains'
import { AbiMap } from '@repo/lib/modules/web3/contracts/AbiMap'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { useMulticall } from '@repo/lib/modules/web3/contracts/useMulticall'
import { useCurrentDate } from '@repo/lib/shared/hooks/date.hooks'
import { toJsTimestamp } from '@repo/lib/shared/utils/time'
import { LockActionType } from '@repo/lib/modules/vebal/lock/steps/lock.helpers'

export type UseVebalLockDataResult = ReturnType<typeof _useVebalLockData>
export const VebalLockDataContext = createContext<UseVebalLockDataResult | null>(null)

function getAvailableLockActions(
  hasLock: boolean | undefined,
  isExpired: boolean | undefined
): Record<LockActionType, boolean> {
  if (typeof hasLock === 'boolean' && typeof isExpired === 'boolean') {
    return {
      [LockActionType.CreateLock]: !hasLock,
      [LockActionType.Unlock]: isExpired,
      [LockActionType.IncreaseLock]: hasLock,
      [LockActionType.ExtendLock]: hasLock,
    }
  }
  return {
    [LockActionType.CreateLock]: false,
    [LockActionType.Unlock]: false,
    [LockActionType.IncreaseLock]: false,
    [LockActionType.ExtendLock]: false,
  }
}

interface MulticallLockDataResponse {
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

export function _useVebalLockData() {
  const { userAddress, isConnected } = useUserAccount()

  const lockDataRequestsData = [
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

  // get lock data
  const lockDataRequests = lockDataRequestsData.map(v => {
    return {
      chainId: mainnet.id,
      id: `${v.path}.${v.fn}`,
      abi: AbiMap['balancer.veBAL'] as any,
      address: mainnetNetworkConfig.contracts.veBAL as Hex,
      functionName: v.fn,
      args: v.args,
    }
  })

  const { results, refetchAll, isLoading } = useMulticall(lockDataRequests, {
    enabled: isConnected,
  })

  const now = useCurrentDate()

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

    const data = mainnetResults.data as MulticallLockDataResponse

    const lockedData = data.locked.locked
    const totalSupply = data.totalSupply.totalSupply.result || BigInt(0)
    const epoch = data.epoch.epoch

    const lockedAmount = lockedData.result?.amount || BigInt(0)
    const lockedEndDate = lockedData.result?.end || BigInt(0)

    const hasExistingLock = bn(lockedAmount).gt(0)
    const lockedEndDateNormalised = toJsTimestamp(Number(lockedEndDate))
    const isExpired = hasExistingLock && Number(now) >= lockedEndDateNormalised

    return {
      lockedEndDate: lockedEndDateNormalised,
      lockedAmount: formatUnits(lockedAmount, 18),
      totalSupply: formatUnits(totalSupply, 18),
      epoch: String(epoch.result),
      hasExistingLock,
      isExpired,
    }
  }, [results, now])

  const availableLockActions = useMemo(() => {
    return getAvailableLockActions(mainnetLockedInfo.hasExistingLock, mainnetLockedInfo.isExpired)
  }, [mainnetLockedInfo])

  return { results, mainnetLockedInfo, isLoading, refetchAll, availableLockActions }
}

export function VebalLockDataProvider({ children }: PropsWithChildren) {
  const vebalLockData = _useVebalLockData()

  return (
    <VebalLockDataContext.Provider value={vebalLockData}>{children}</VebalLockDataContext.Provider>
  )
}

export const useVebalLockData = (): UseVebalLockDataResult =>
  useMandatoryContext(VebalLockDataContext, 'VebalLockData')
