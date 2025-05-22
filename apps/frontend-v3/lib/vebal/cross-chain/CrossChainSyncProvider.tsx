import { useOmniEscrowLocksMap } from '@bal/lib/vebal/cross-chain/useOmniEscrowLocksMap'
import networkConfigs from '@repo/lib/config/networks'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { secs } from '@repo/lib/shared/utils/time'
import { keyBy } from 'lodash'
import { createContext, PropsWithChildren, useCallback, useEffect, useMemo } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { Address, Hash } from 'viem'
import {
  calculateVeBAlBalance,
  CrossChainNetworkResponse,
  getNetworkSyncState,
  NetworkSyncState,
  useCrossChainNetworks,
} from './useCrossChainNetworks'
import { useLayerZeroTxLinks } from './useLayerZeroTxLinks'

const veBalSyncSupportedNetworks: GqlChain[] = Object.keys(networkConfigs)
  .filter(key => networkConfigs[key as keyof typeof networkConfigs].supportsVeBalSync)
  .map(key => key) as GqlChain[]

const REFETCH_INTERVAL = secs(30).toMs()

export type CrossChainSyncResult = ReturnType<typeof useCrossChainSyncLogic>
export const CrossChainSyncContext = createContext<CrossChainSyncResult | null>(null)

interface CheckIfNetworkSyncingArgs {
  networksSyncState: Record<GqlChain, NetworkSyncState>
  tempSyncingNetworks: Record<Address, TempSyncingNetworks>
  userAddress: Address
  network: GqlChain
}

export function checkIfNetworkSyncing({
  networksSyncState,
  tempSyncingNetworks,
  userAddress,
  network,
}: CheckIfNetworkSyncingArgs) {
  return (
    networksSyncState?.[network] === NetworkSyncState.Syncing ||
    tempSyncingNetworks[userAddress]?.networks.includes(network)
  )
}

export interface TempSyncingNetworks {
  networks: GqlChain[]
  syncTimestamp?: number
}

export type SyncTxHashes = Record<GqlChain, Hash>

const initialTempSyncingNetworks: Record<Address, TempSyncingNetworks> = {}
const initialSyncTxHashes: Record<Address, SyncTxHashes> = {}

export const useCrossChainSyncLogic = () => {
  const { userAddress } = useUserAccount()

  const [tempSyncingNetworks, setTempSyncingNetworks] = useLocalStorage(
    LS_KEYS.CrossChainSync.TempSyncingNetworks,
    initialTempSyncingNetworks
  )
  const [syncTxHashes, _setSyncTxHashes] = useLocalStorage(
    LS_KEYS.CrossChainSync.SyncTxHashes,
    initialSyncTxHashes
  )
  const { syncLayerZeroTxLinks } = useLayerZeroTxLinks(syncTxHashes)

  const { isLoadingOmniEscrow, isOmniEscrowError, omniEscrowLocksMap, refetchOmniEscrow } =
    useOmniEscrowLocksMap(userAddress)

  const [mainnetCrossChainNetwork] = useCrossChainNetworks([GqlChain.Mainnet], omniEscrowLocksMap)

  const { votingEscrowLocks: mainnetEscrowLock } = mainnetCrossChainNetwork

  const crossChainNetworksResponses = useCrossChainNetworks(
    veBalSyncSupportedNetworks,
    omniEscrowLocksMap
  )

  const crossChainNetworks = keyBy(crossChainNetworksResponses, 'chainId') as unknown as Record<
    GqlChain,
    CrossChainNetworkResponse[number] | undefined
  >

  const isLoading = isLoadingOmniEscrow || mainnetCrossChainNetwork.isLoading

  const networksSyncState = useMemo(() => {
    return veBalSyncSupportedNetworks.reduce<Partial<Record<GqlChain, NetworkSyncState>>>(
      (acc, network) => {
        acc[network] = getNetworkSyncState({
          omniEscrowLock: omniEscrowLocksMap?.[networkConfigs[network].layerZeroChainId || ''],
          mainnetEscrowLock,
        })
        return acc
      },
      {}
    )
  }, [mainnetEscrowLock, omniEscrowLocksMap])

  const networksBySyncState = useMemo(() => {
    const networksWithValidSyncState = Object.keys(networksSyncState) as GqlChain[]

    return {
      synced: networksWithValidSyncState.filter(
        network => networksSyncState[network] === NetworkSyncState.Synced
      ),
      unsynced: networksWithValidSyncState.filter(
        network => networksSyncState[network] === NetworkSyncState.Unsynced
      ),
      syncing: networksWithValidSyncState.filter(
        network =>
          networksSyncState[network] === NetworkSyncState.Syncing ||
          tempSyncingNetworks[userAddress]?.networks.includes(network)
      ),
    }
  }, [networksSyncState, tempSyncingNetworks, userAddress])

  const showingUnsyncedNetworks = [...networksBySyncState.unsynced, ...networksBySyncState.syncing]

  const hasError = isOmniEscrowError || false
  // FIXME: isError is not yet implemented
  //veBalSyncSupportedNetworks.some(network => crossChainNetworks[network].isError)

  const l2VeBalBalances = useMemo(() => {
    return veBalSyncSupportedNetworks.reduce<Partial<Record<GqlChain, string>>>((acc, network) => {
      const crossChainNetwork = crossChainNetworks[network] || undefined
      const votingEscrowLocks = crossChainNetwork?.votingEscrowLocks

      if (!votingEscrowLocks) {
        return acc
      }

      acc[network] = calculateVeBAlBalance(votingEscrowLocks)
      return acc
    }, {})
  }, [crossChainNetworks])

  const warningMessage = useMemo(() => {
    if (networksBySyncState.syncing.length > 0) {
      return {
        title: 'Wait until sync finalizes before restaking / triggering a gauge update on L2',
        text: `Your sync has been initiated but it may take up to 30 mins to update across L2s.
              Once your veBAL is synced, you will need to interact with each gauge to register your new max boost.
              You can either claim, restake, or click the Update button, which will appear
              on each individual pool page staking section.`,
      }
    }
    return null
  }, [networksBySyncState])

  const infoMessage = useMemo(() => {
    if (!warningMessage && networksBySyncState.synced.length > 0) {
      return {
        title: 'Trigger pool gauge updates to get your boosts sooner',
        text: `Pool gauges don’t automatically recognize changes in veBAL until triggered.
            Updates are triggered when any user interacts with a gauge, such as by claiming BAL, staking or unstaking.
            Trigger individual gauges yourself for your boosts to apply immediately.`,
      }
    }
    return null
  }, [warningMessage, networksBySyncState])

  const refetch = useCallback(async () => {
    await Promise.all([refetchOmniEscrow(), mainnetCrossChainNetwork.refetch()])

    if (omniEscrowLocksMap) {
      const promises = networksBySyncState.syncing.map(networkId =>
        crossChainNetworks[networkId]?.refetch()
      )
      await Promise.all(promises)
    }
  }, [
    refetchOmniEscrow,
    mainnetCrossChainNetwork,
    omniEscrowLocksMap,
    networksBySyncState,
    crossChainNetworks,
  ])

  useEffect(() => {
    let intervalId: NodeJS.Timeout
    if (networksBySyncState.syncing.length > 0) {
      intervalId = setInterval(() => {
        void refetch()
      }, REFETCH_INTERVAL)
    }
    return () => clearInterval(intervalId as unknown as number)
  }, [networksBySyncState, refetch])

  function setSyncTxHashes(network: GqlChain, txHash: Hash) {
    _setSyncTxHashes(prev => ({
      ...prev,
      [userAddress]: {
        ...prev[userAddress],
        [network]: txHash,
      },
    }))
  }

  const clearTempSyncingNetworksFromSynced = useCallback(() => {
    if (!tempSyncingNetworks[userAddress]) return

    setTempSyncingNetworks(prev => {
      const updatedNetworks = prev[userAddress].networks.filter(
        network => !networksBySyncState.synced.includes(network)
      )
      return { ...prev, [userAddress]: { ...prev[userAddress], networks: updatedNetworks } }
    })
  }, [userAddress, networksBySyncState, tempSyncingNetworks, setTempSyncingNetworks])

  useEffect(() => {
    if (networksBySyncState.synced.length > 0) {
      const hasSyncingMismatch = networksBySyncState.syncing.some(network =>
        networksBySyncState.synced.includes(network)
      )
      if (hasSyncingMismatch) {
        clearTempSyncingNetworksFromSynced()
      }
    }
  }, [networksBySyncState, clearTempSyncingNetworksFromSynced])

  return {
    showingUnsyncedNetworks,
    hasError,
    omniEscrowLocksMap,
    networksSyncState,
    isLoading,
    networksBySyncState,
    l2VeBalBalances,
    refetch,
    tempSyncingNetworks,
    setTempSyncingNetworks,
    warningMessage,
    infoMessage,
    syncTxHashes,
    setSyncTxHashes,
    syncLayerZeroTxLinks,
  }
}

export function CrossChainSyncProvider({ children }: PropsWithChildren) {
  const hook = useCrossChainSyncLogic()
  return <CrossChainSyncContext.Provider value={hook}>{children}</CrossChainSyncContext.Provider>
}

export const useCrossChainSync = (): CrossChainSyncResult =>
  useMandatoryContext(CrossChainSyncContext, 'CrossChainSyncContext')
