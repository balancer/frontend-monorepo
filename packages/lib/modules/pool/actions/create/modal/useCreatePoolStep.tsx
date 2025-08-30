import {
  ManagedResult,
  TransactionLabels,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { getChainId } from '@repo/lib/config/app.config'
import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { validatePoolType } from '../validatePoolCreationForm'
import { parseUnits, zeroAddress } from 'viem'
import { TokenType, CreatePoolInput } from '@balancer/sdk'
import { useCreatePoolBuildCall } from '@repo/lib/modules/pool/actions/create/useCreatePoolBuildCall'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useTenderly } from '@repo/lib/modules/web3/useTenderly'
import { useEffect, useMemo } from 'react'
import { ManagedSendTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'
import { DisabledTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionStepButton'
import { usePoolCreationReceipt } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'

const CREATE_POOL_STEP_ID = 'create-pool'

const labels: TransactionLabels = {
  init: 'Create pool',
  title: 'Create pool',
  confirming: 'Confirming pool creation...',
  confirmed: 'Pool creation confirmed!',
  tooltip: 'Create pool',
}

export function useCreatePoolStep(): TransactionStep {
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()
  const [isStepActivated, setIsStepActivated] = useState(false)

  const [poolAddress, setPoolAddress] = useLocalStorage<`0x${string}` | undefined>(
    LS_KEYS.LbpConfig.PoolAddress,
    undefined
  )

  const { userAddress } = useUserAccount()
  const {
    poolType,
    symbol,
    name,
    swapFeePercentage,
    network,
    swapFeeManager,
    poolHooksContract,
    enableDonation,
    disableUnbalancedLiquidity,
    poolTokens,
    pauseManager,
    amplificationParameter,
  } = usePoolCreationForm()

  const chainId = getChainId(network)
  const isWeightedPool = validatePoolType.isWeightedPool(poolType)
  const isStablePool = validatePoolType.isStablePool(poolType)

  if (!swapFeeManager || !pauseManager || !poolHooksContract) {
    throw new Error('Missing config for create pool input')
  }

  const createPoolInput = {
    chainId,
    protocolVersion: 3 as const,
    poolType,
    name,
    symbol,
    swapFeePercentage: parseUnits(swapFeePercentage, 16),
    swapFeeManager,
    pauseManager,
    enableDonation,
    poolHooksContract,
    disableUnbalancedLiquidity,
    ...(isStablePool && { amplificationParameter: BigInt(amplificationParameter) }),
    tokens: poolTokens.map(({ address, rateProvider, weight, paysYieldFees }) => {
      if (!address || !rateProvider) throw new Error('Missing token config for create pool input')
      return {
        address,
        tokenType: rateProvider === zeroAddress ? TokenType.STANDARD : TokenType.TOKEN_WITH_RATE,
        rateProvider,
        paysYieldFees,
        ...(isWeightedPool && weight ? { weight: parseUnits(weight, 16) } : {}),
      }
    }),
  } as CreatePoolInput

  const buildCallDataQuery = useCreatePoolBuildCall({
    createPoolInput,
    enabled: isStepActivated,
  })

  const { buildTenderlyUrl } = useTenderly({ chainId })

  const gasEstimationMeta = sentryMetaForWagmiSimulation('Error in create pool gas estimation', {
    buildCallQueryData: buildCallDataQuery.data,
    tenderlyUrl: buildTenderlyUrl(buildCallDataQuery.data),
  })

  const receiptProps = usePoolCreationReceipt({
    txHash: transaction?.result?.data?.transactionHash,
    chain: network,
    userAddress: userAddress,
    protocolVersion: 3 as const,
  })

  useEffect(() => {
    if (receiptProps.poolAddress) setPoolAddress(receiptProps.poolAddress)
  }, [receiptProps.poolAddress, setPoolAddress])

  return useMemo(
    () => ({
      id: CREATE_POOL_STEP_ID,
      stepType: 'createPool',
      labels,
      transaction,
      isComplete: () => isTransactionSuccess(transaction) || !!poolAddress,
      onActivated: () => setIsStepActivated(true),
      onDeactivated: () => setIsStepActivated(false),
      renderAction: () => {
        if (!buildCallDataQuery.data) return <DisabledTransactionButton />
        return (
          <ManagedSendTransactionButton
            gasEstimationMeta={gasEstimationMeta}
            id={CREATE_POOL_STEP_ID}
            labels={labels}
            onTransactionChange={setTransaction}
            txConfig={buildCallDataQuery.data}
          />
        )
      },
    }),
    [transaction, buildCallDataQuery.data, gasEstimationMeta, poolAddress]
  )
}
