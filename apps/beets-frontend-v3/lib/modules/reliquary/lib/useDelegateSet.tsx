import { useSubmitTransaction } from '~/lib/util/useSubmitTransaction'
import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'
import { DelegateRegistryAbi } from '@repo/lib/modules/web3/contracts/abi/DelegateRegistryAbi'

export function useDelegateSet() {
  const networkConfig = useNetworkConfig()
  const { submit, submitAsync, ...rest } = useSubmitTransaction({
    config: {
      addressOrName: networkConfig.snapshot.contractAddress,
      contractInterface: DelegateRegistryAbi,
      functionName: 'setDelegate',
    },
    transactionType: 'DELEGATE',
  })

  function setDelegate() {
    submit({
      args: [networkConfig.snapshot.id, networkConfig.snapshot.delegateAddress],
      toastText: 'Delegate to vote optimizer',
    })
  }

  return {
    setDelegate,
    ...rest,
  }
}
