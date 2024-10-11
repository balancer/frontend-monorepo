import { useMemo } from 'react'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import networkConfigs from '@/lib/config/networks'
import { OmniEscrowLock } from './useOmniEscrowLocksQuery'
import {
  useVotingEscrowLocksQueries,
  VotingEscrowLock,
  VotingEscrowLockResponse,
} from './useVotingEscrowLocksQueries'
import { bn } from '@/lib/shared/utils/numbers'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { allEqual } from '@/lib/shared/utils/array'
import { UseQueryResult } from '@tanstack/react-query'

export enum NetworkSyncState {
  Unsynced = 'Unsynced',
  Syncing = 'Syncing',
  Synced = 'Synced',
  Unknown = 'Unknown',
}

interface GetNetworkSyncStateArgs {
  votingEscrowLocks?: VotingEscrowLock
  omniEscrowLock?: OmniEscrowLock | null
  mainnetEscrowLock?: VotingEscrowLock
}

export function getNetworkSyncState({
  votingEscrowLocks,
  omniEscrowLock,
  mainnetEscrowLock,
}: GetNetworkSyncStateArgs) {
  if (!omniEscrowLock || !mainnetEscrowLock || !votingEscrowLocks) {
    return NetworkSyncState.Unsynced
  }

  const { bias: biasOmni, slope: slopeOmni } = omniEscrowLock
  const { bias: biasMainnet, slope: slopeMainnet } = mainnetEscrowLock
  const { bias: biasNetwork, slope: slopeNetwork } = votingEscrowLocks

  if (!slopeOmni || !slopeMainnet || !slopeNetwork) {
    return NetworkSyncState.Unsynced
  }

  const isSynced =
    allEqual([biasOmni, biasMainnet, biasNetwork]) &&
    allEqual([slopeOmni, slopeMainnet, slopeNetwork])

  const isSyncing =
    allEqual([biasOmni, biasMainnet]) &&
    allEqual([slopeOmni, slopeMainnet]) &&
    slopeOmni !== slopeNetwork &&
    biasOmni !== biasNetwork

  if (isSynced) {
    return NetworkSyncState.Synced
  }

  if (isSyncing) {
    return NetworkSyncState.Syncing
  }

  return NetworkSyncState.Unsynced
}

function formatVotingEscrowData(
  votingEscrowResponses: UseQueryResult<VotingEscrowLockResponse, Error>[],
  chainIds: GqlChain[]
) {
  return votingEscrowResponses.map(
    ({ data: votingEscrowResponse, refetch, isError, isLoading: isInitialLoading }, index) => {
      const chainId = chainIds[index]

      if (!chainId) {
        throw new Error(`formatVotingEscrowData - ${chainId} not found in ${chainIds}`)
      }

      const votingEscrowLocks = votingEscrowResponse?.votingEscrowLocks[0]

      return {
        chainId,
        votingEscrowLocks,
        refetch,
        isLoading: isInitialLoading,
        isError,
      }
    }
  )
}

// Calculate veBAL balance using bias, slope, and timestamp values
export function calculateVeBAlBalance(votingEscrowLocks: VotingEscrowLock | null) {
  const { bias, slope, timestamp } = votingEscrowLocks || {}

  if (!bias || !slope || !timestamp) return bn(0).toFixed(4).toString()

  const x = bn(slope).multipliedBy(Math.floor(Date.now() / 1000) - timestamp)

  if (x.isLessThan(0)) return bn(bias).toFixed(4).toString()

  const balance = bn(bias).minus(x)
  if (balance.isLessThan(0)) return bn(0).toFixed(4).toString()

  return balance.toFixed(4).toString()
}

export function useCrossChainNetworks(
  chainIds: GqlChain[],
  omniEscrowMap: Record<number, OmniEscrowLock> | null
) {
  const { userAddress } = useUserAccount()

  // Determine the user address to use for each chain, considering omniEscrowMap if the chain is not Mainnet
  const remoteUsers = useMemo(() => {
    return chainIds.map(chainId => {
      if (chainId === GqlChain.Mainnet) {
        return userAddress
      }

      const layerZeroChainId = networkConfigs[chainId]?.layerZeroChainId
      return layerZeroChainId
        ? omniEscrowMap?.[layerZeroChainId]?.remoteUser || userAddress
        : userAddress
    })
  }, [chainIds, userAddress, omniEscrowMap])

  const votingEscrowResponses = useVotingEscrowLocksQueries(remoteUsers)

  return formatVotingEscrowData(votingEscrowResponses, chainIds)
}
