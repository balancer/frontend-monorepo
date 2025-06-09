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
import { useLbpWeights } from '../useLbpWeights'
import { useTokenMetadata } from '@repo/lib/modules/tokens/useTokenMetadata'

export const createLbpStepId = 'create-lbp'

const labels: TransactionLabels = {
  init: 'Create LBP',
  title: 'Create LBP',
  confirming: 'Creating a new LBP',
  confirmed: 'Created a new LBP',
  tooltip: 'Create a new LBP',
}

export function useCreateLbpStep(): TransactionStep {
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()
  const [isStepActivated, setIsStepActivated] = useState(false)

  const [poolAddress, setPoolAddress] = useLocalStorage<`0x${string}` | undefined>(
    LS_KEYS.LbpConfig.PoolAddress,
    undefined
  )

  const { userAddress } = useUserAccount()
  const { saleStructureForm, projectInfoForm } = useLbpForm()
  const {
    launchTokenAddress,
    collateralTokenAddress,
    startTime,
    endTime,
    selectedChain,
    userActions,
  } = saleStructureForm.watch()

  const { name } = projectInfoForm.watch()

  const receiptProps = usePoolCreationReceipt({
    txHash: transaction?.execution?.data,
    chain: selectedChain,
    userAddress: userAddress,
    protocolVersion: 3 as const,
  })

  useEffect(() => {
    if (receiptProps.poolAddress) setPoolAddress(receiptProps.poolAddress)
  }, [receiptProps.poolAddress, setPoolAddress])

  const chainId = getNetworkConfig(selectedChain).chainId
  const { buildTenderlyUrl } = useTenderly({ chainId })

  const {
    projectTokenStartWeight,
    reserveTokenStartWeight,
    projectTokenEndWeight,
    reserveTokenEndWeight,
  } = useLbpWeights()

  const blockProjectTokenSwapsIn = userActions === 'buy_only' ? true : false

  const { symbol: launchTokenSymbol } = useTokenMetadata(launchTokenAddress, selectedChain)
  const { symbol: collateralTokenSymbol } = useTokenMetadata(collateralTokenAddress, selectedChain)

  const createPoolInput = {
    protocolVersion: 3 as const,
    poolType: PoolType.LiquidityBootstrapping,
    symbol: `${launchTokenSymbol}-${collateralTokenSymbol}-LBP`,
    name: `${name} Liquidity Bootstrapping Pool`,
    swapFeePercentage: parseUnits('0.01', 18),
    chainId,
    lbpParams: {
      owner: userAddress,
      blockProjectTokenSwapsIn,
      projectToken: launchTokenAddress as `0x${string}`,
      reserveToken: collateralTokenAddress as `0x${string}`,
      projectTokenStartWeight: parseUnits(((projectTokenStartWeight || 0) / 100).toString(), 18),
      reserveTokenStartWeight: parseUnits(((reserveTokenStartWeight || 0) / 100).toString(), 18),
      projectTokenEndWeight: parseUnits(((projectTokenEndWeight || 0) / 100).toString(), 18),
      reserveTokenEndWeight: parseUnits(((reserveTokenEndWeight || 0) / 100).toString(), 18),
      startTime: BigInt(Math.floor(new Date(startTime || Date.now()).getTime() / 1000)),
      endTime: BigInt(
        Math.floor(new Date(endTime || Date.now() + 1000 * 60 * 60 * 24).getTime() / 1000)
      ), // added day because sentry capture query error if default start / end at same time
    },
  }

  const buildCallDataQuery = useCreatePoolBuildCall({
    createPoolInput: createPoolInput as CreatePoolLiquidityBootstrappingInput,
    enabled: isStepActivated && !!createPoolInput,
  })

  const gasEstimationMeta = sentryMetaForWagmiSimulation('Error in create LBP gas estimation', {
    buildCallQueryData: buildCallDataQuery.data,
    tenderlyUrl: buildTenderlyUrl(buildCallDataQuery.data),
  })

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
