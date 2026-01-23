import {
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { CHAINS, RecoveredTokenClaim, useRecoveredFunds } from './useRecoveredFunds'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { getGqlChain, getNetworkConfig } from '@repo/lib/config/app.config'
import { ManagedTransactionInput } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { Address, zeroAddress } from 'viem'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'
import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import { useStepsTransactionState } from '@repo/lib/modules/transactions/transaction-steps/useStepsTransactionState'

export function useClaimSteps(claims: RecoveredTokenClaim[]) {
  const { userAddress } = useUserAccount()
  const { getTransaction, setTransactionFn } = useStepsTransactionState()
  const { refetchClaims } = useRecoveredFunds()

  return CHAINS.map(chainId => {
    const chainClaims = claims.filter(claim => claim.chainId === chainId)
    if (chainClaims.length === 0) return undefined
    const claimData = buildClaimData(chainClaims)

    const labels = getLabels(chainId)

    const txSimulationMeta = sentryMetaForWagmiSimulation(
      'Error in wagmi tx simulation (Claim recovered funds transaction)',
      {
        chain: getGqlChain(chainId),
        claimData,
      }
    )

    const stepId = `recovered-funds-claim-${chainId}`

    const props: ManagedTransactionInput = {
      labels,
      chainId,
      contractId: 'merkl.claims',
      contractAddress: getNetworkConfig(chainId).contracts.merkl?.claims || zeroAddress,
      functionName: 'claim',
      args: [
        [userAddress],
        claimData.tokens.slice(0, 1),
        claimData.amounts.slice(0, 1),
        claimData.proofs.slice(0, 1),
      ],
      enabled: !!userAddress,
      txSimulationMeta,
      onTransactionChange: setTransactionFn(stepId),
    }

    const transaction = getTransaction(stepId)
    return {
      id: stepId,
      labels,
      stepType: 'claim',
      transaction,
      isComplete: () => !!userAddress && isTransactionSuccess(transaction),
      onSuccess: () => {
        refetchClaims(chainId)
      },
      renderAction: () => <ManagedTransactionButton id={stepId} {...props} />,
    } as TransactionStep
  }).filter(Boolean) as TransactionStep[]
}

function buildClaimData(claims: RecoveredTokenClaim[]) {
  return claims.reduce(
    (acc, claim) => {
      acc.tokens.push(claim.amount.tokenAddress)
      acc.amounts.push(claim.rawAmount)
      acc.proofs.push(claim.proofs as Address[])
      return acc
    },
    {
      tokens: [] as Address[],
      amounts: [] as bigint[],
      proofs: [] as Address[][],
    }
  )
}

function getLabels(chainId: number) {
  const networkConfig = getNetworkConfig(chainId)
  return {
    init: `Claim funds on ${networkConfig.shortName}`,
    title: `Claim funds on ${networkConfig.shortName}`,
    confirming: 'Confirming claim...',
    confirmed: 'Claimed!',
    tooltip: `Claim all the recovered funds on ${networkConfig.shortName}`,
  } as TransactionLabels
}
