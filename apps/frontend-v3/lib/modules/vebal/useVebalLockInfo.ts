import { useMemo } from 'react'
import { useUserAccount } from '../web3/UserAccountProvider'
import { useMulticall } from '../web3/contracts/useMulticall'
import mainnetNetworkConfig from '@/lib/config/networks/mainnet'
import { Hex, formatUnits } from 'viem'
import { bn } from '@/lib/shared/utils/numbers'
import { AbiMap } from '../web3/contracts/AbiMap'
import { mainnet } from 'viem/chains'
import { toJsTimestamp } from '@/lib/shared/utils/time'

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

    return {
      lockedEndDate: lockedEndDateNormalised,
      lockedAmount: formatUnits(lockedAmount, 18),
      totalSupply: formatUnits(totalSupply, 18),
      epoch: String(epoch.result),
      hasExistingLock,
      isExpired,
    }
  }, [results])

  return { results, mainnetLockedInfo, isLoading, refetchAll }
}
