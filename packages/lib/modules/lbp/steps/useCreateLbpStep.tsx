import { useMemo, useState, useEffect } from 'react'
import {
  ManagedResult,
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'
import { ManagedSendTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import { useTenderly } from '@repo/lib/modules/web3/useTenderly'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useLbpForm } from '../LbpFormProvider'
import { DisabledTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionStepButton'
import { useCreatePoolBuildCall } from '@repo/lib/modules/pool/actions/create/useCreatePoolBuildCall'
import { parseUnits } from 'viem'
import { PoolType, type CreatePoolLiquidityBootstrappingInput } from '@balancer/sdk'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { usePoolCreationReceipt } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { useLocalStorage } from 'usehooks-ts'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'

export const createLbpStepId = 'create-lbp'

const labels: TransactionLabels = {
  init: 'Create LBP',
  title: 'Create LBP',
  confirming: 'Creating a new LBP',
  confirmed: 'Created a new LBP',
  tooltip: 'Create a new LBP',
}

export function useCreateLbpStep(): TransactionStep {
  const [poolAddress, setPoolAddress] = useLocalStorage<`0x${string}` | undefined>(
    LS_KEYS.LbpConfig.Address,
    undefined
  )
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()
  const [isStepActivated, setIsStepActivated] = useState(false)

  const { userAddress } = useUserAccount()
  const { saleStructureForm } = useLbpForm()
  const {
    launchTokenAddress,
    collateralTokenAddress,
    weightAdjustmentType,
    customStartWeight,
    customEndWeight,
    startTime,
    endTime,
    selectedChain,
    userActions,
  } = saleStructureForm.watch()

  const receiptProps = usePoolCreationReceipt({
    txHash: transaction?.execution?.data,
    chain: selectedChain,
    userAddress: userAddress,
    protocolVersion: 3 as const,
    // txReceipt, // TODO?
  })

  useEffect(() => {
    if (receiptProps.poolAddress) setPoolAddress(receiptProps.poolAddress)
  }, [receiptProps.poolAddress, setPoolAddress])

  const chainId = getNetworkConfig(selectedChain).chainId
  const { buildTenderlyUrl } = useTenderly({ chainId })

  const weightConfig = {
    linear_90_10: { start: 90, end: 10 },
    linear_90_50: { start: 90, end: 50 },
    custom: { start: customStartWeight, end: customEndWeight },
  }

  const blockProjectTokenSwapsIn = userActions === 'buy_only' ? true : false

  const projectTokenStartWeight = weightConfig[weightAdjustmentType]?.start ?? 90
  const reserveTokenStartWeight = 100 - (weightConfig[weightAdjustmentType]?.start ?? 90)
  const projectTokenEndWeight = weightConfig[weightAdjustmentType]?.end ?? 10
  const reserveTokenEndWeight = 100 - (weightConfig[weightAdjustmentType]?.end ?? 10)

  const lbpParams = useMemo(() => {
    if (!launchTokenAddress || !collateralTokenAddress || !startTime || !endTime) {
      return null
    }

    return {
      owner: userAddress,
      blockProjectTokenSwapsIn,
      projectToken: launchTokenAddress as `0x${string}`,
      reserveToken: collateralTokenAddress as `0x${string}`,
      projectTokenStartWeight: parseUnits((projectTokenStartWeight / 100).toString(), 18),
      reserveTokenStartWeight: parseUnits((reserveTokenStartWeight / 100).toString(), 18),
      projectTokenEndWeight: parseUnits((projectTokenEndWeight / 100).toString(), 18),
      reserveTokenEndWeight: parseUnits((reserveTokenEndWeight / 100).toString(), 18),
      startTime: BigInt(Math.floor(new Date(startTime).getTime() / 1000)),
      endTime: BigInt(Math.floor(new Date(endTime).getTime() / 1000)),
    }
  }, [
    userAddress,
    launchTokenAddress,
    collateralTokenAddress,
    projectTokenStartWeight,
    reserveTokenStartWeight,
    projectTokenEndWeight,
    reserveTokenEndWeight,
    startTime,
    endTime,
    blockProjectTokenSwapsIn,
  ])

  const createPoolInput = useMemo(() => {
    if (!lbpParams) return null

    return {
      protocolVersion: 3 as const,
      poolType: PoolType.LiquidityBootstrapping,
      symbol: 'LBP',
      name: 'Liquidity Bootstrapping Pool',
      swapFeePercentage: parseUnits('0.01', 18),
      chainId,
      lbpParams,
    }
  }, [lbpParams, chainId])

  const buildCallDataQuery = useCreatePoolBuildCall({
    createPoolInput: createPoolInput as CreatePoolLiquidityBootstrappingInput,
    enabled: isStepActivated && !!createPoolInput,
  })

  const gasEstimationMeta = sentryMetaForWagmiSimulation('Error in create LBP gas estimation', {
    buildCallQueryData: buildCallDataQuery.data,
    tenderlyUrl: buildTenderlyUrl(buildCallDataQuery.data),
  })

  // const poolAddress = localStorage.getItem(LS_KEYS.LbpConfig.Address)

  return useMemo(
    () => ({
      id: createLbpStepId,
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
            id={createLbpStepId}
            labels={labels}
            txConfig={buildCallDataQuery.data}
            onTransactionChange={setTransaction}
          />
        )
      },
    }),
    [transaction, buildCallDataQuery.data, gasEstimationMeta, poolAddress]
  )
}
