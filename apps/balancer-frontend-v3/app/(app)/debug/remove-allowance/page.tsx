'use client'

import { buildTokenApprovalLabels } from '@/lib/modules/tokens/approvals/approval-labels'
import { TransactionStepButton } from '@/lib/modules/transactions/transaction-steps/TransactionStepButton'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import {
  ManagedErc20TransactionInput,
  useManagedErc20Transaction,
} from '@/lib/modules/web3/contracts/useManagedErc20Transaction'
import { sentryMetaForWagmiSimulation } from '@/lib/shared/utils/query-errors'
import { Center, Input, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { Address } from 'viem'

export default function Page() {
  const [tokenAddress, setTokenAddress] = useState<Address>('' as Address)

  const labels = buildTokenApprovalLabels({ actionType: 'Swapping', symbol: 'Token' })

  const { chain, userAddress } = useUserAccount()

  const chainId = chain?.id || 1

  const props: ManagedErc20TransactionInput = {
    tokenAddress,
    functionName: 'approve',
    labels,
    chainId,
    args: [userAddress, 0n],
    enabled: !!userAddress,
    simulationMeta: sentryMetaForWagmiSimulation('Error in wagmi tx simulation: Approving token', {
      tokenAmountToApprove: 0n,
    }),
  }

  const transaction = useManagedErc20Transaction(props)

  return (
    <Center>
      <VStack w="50%">
        <Text>
          Enter address of token to remove allowance in the current chain:{' '}
          {chain ? chain.name : 'None'}
        </Text>
        <Input type="text" onChange={e => setTokenAddress(e.target.value as Address)} />

        <TransactionStepButton step={{ labels: props.labels, ...transaction }} />
      </VStack>
    </Center>
  )
}
