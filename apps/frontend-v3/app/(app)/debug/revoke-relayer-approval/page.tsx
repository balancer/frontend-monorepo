'use client'

import { getNetworkConfig } from '@/lib/config/app.config'
import { TransactionStepButton } from '@/lib/modules/transactions/transaction-steps/TransactionStepButton'
import { TransactionLabels } from '@/lib/modules/transactions/transaction-steps/lib'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import {
  ManagedTransactionInput,
  useManagedTransaction,
} from '@/lib/modules/web3/contracts/useManagedTransaction'
import { Center, VStack } from '@chakra-ui/react'

export default function Page() {
  const labels: TransactionLabels = {
    title: 'Revoke relayer approval',
    description: 'Revoke Balancer relayer approval',
    init: 'Revoke relayer approval',
    confirming: 'Confirming relayer approval revoke...',
    confirmed: 'Relayer revoked!',
    tooltip: '',
  }
  const { chain, userAddress } = useUserAccount()
  const chainId = chain?.id || 1
  const config = getNetworkConfig(chainId)

  const relayerAddress = config.contracts.balancer.relayerV6
  const vaultAddress = config.contracts.balancer.vaultV2

  const props: ManagedTransactionInput = {
    contractAddress: vaultAddress,
    contractId: 'balancer.vaultV2',
    functionName: 'setRelayerApproval',
    labels,
    chainId,
    args: [userAddress, relayerAddress, false],
    enabled: !!userAddress,
    txSimulationMeta: {},
  }

  const transaction = useManagedTransaction(props)

  return (
    <Center>
      <VStack w="50%">
        <TransactionStepButton step={{ labels: props.labels, ...transaction }} />
      </VStack>
    </Center>
  )
}
