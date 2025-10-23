import { useSubmitTransaction } from '~/lib/util/useSubmitTransaction'
import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'
import ReliquaryAbi from '~/lib/abi/Reliquary.json'

export function useBatchRelayerRelicApprove(useApproveAll = false) {
  const networkConfig = useNetworkConfig()
  const { submit, submitAsync, ...rest } = useSubmitTransaction({
    config: {
      addressOrName: networkConfig.reliquary.address,
      contractInterface: ReliquaryAbi,
      functionName: useApproveAll ? 'setApprovalForAll' : 'approve',
    },
    transactionType: 'APPROVE',
  })

  function approve(relicId: number) {
    submit({
      args: [networkConfig.balancer.batchRelayer, relicId],
      toastText: `Approve relic #${relicId}`,
    })
  }

  function approveAll(approve: boolean) {
    submit({
      args: [networkConfig.balancer.batchRelayer, approve],
      toastText: 'Approve all current and future relics',
    })
  }

  return {
    approve,
    approveAll,
    ...rest,
  }
}
