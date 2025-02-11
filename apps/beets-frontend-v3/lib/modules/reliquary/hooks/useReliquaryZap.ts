// import { useCallback } from 'react'
// import { ReliquaryZapService } from '../services/reliquary-zap.service'
// import { BatchRelayerService } from '@repo/lib/shared/services/batch-relayer/batch-relayer.service'
// import { Address, type PublicClient } from 'viem'
// import { usePublicClient } from 'wagmi'
// import { getNetworkConfig } from '@repo/lib/config/app.config'
// import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
// import { gaugeActionsService } from '@repo/lib/shared/services/batch-relayer/extensions/gauge-actions.service'
// import { reliquaryActionsService } from '@repo/lib/shared/services/batch-relayer/extensions/reliquary-actions.service'
// import { vaultActionsService } from '@repo/lib/shared/services/batch-relayer/extensions/vault-actions.service'
// import { HumanAmount } from '@balancer/sdk'

// export function useReliquaryZap(chain: GqlChain) {
//   const publicClient = usePublicClient()
//   const networkConfig = getNetworkConfig(chain)

//   const getReliquaryDepositCallData = useCallback(
//     async ({
//       userAddress,
//       beetsAmount,
//       stsAmount,
//       slippage,
//       relicId,
//     }: {
//       userAddress: Address
//       beetsAmount: HumanAmount
//       stsAmount: HumanAmount
//       slippage: string
//       relicId?: number
//     }) => {
//       const batchRelayerService = new BatchRelayerService(
//         networkConfig.contracts.balancer.relayerV6,
//         gaugeActionsService,
//         reliquaryActionsService,
//         vaultActionsService
//       )
//       const reliquaryZapService = new ReliquaryZapService(
//         batchRelayerService,
//         publicClient as PublicClient
//       )

//       return reliquaryZapService.getReliquaryDepositContractCallData({
//         userAddress,
//         beetsAmount,
//         stsAmount,
//         slippage,
//         relicId,
//       })
//     },
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [publicClient]
//   )

//   return {
//     getReliquaryDepositCallData,
//   }
// }
