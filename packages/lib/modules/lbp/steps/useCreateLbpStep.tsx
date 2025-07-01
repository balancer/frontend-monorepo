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
import { parseUnits, Address } from 'viem'
import { PoolType, type CreatePoolLiquidityBootstrappingInput } from '@balancer/sdk'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { usePoolCreationReceipt } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { useLocalStorage } from 'usehooks-ts'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { useLbpWeights } from '../useLbpWeights'
import { useTokenMetadata } from '@repo/lib/modules/tokens/useTokenMetadata'
import { LiquidityActionHelpers } from '@repo/lib/modules/pool/actions/LiquidityActionHelpers'

export const createLbpStepId = 'create-lbp'

const labels: TransactionLabels = {
  init: 'Create pool',
  title: 'Create pool',
  confirming: 'Confirming pool creation...',
  confirmed: 'Pool creation confirmed!',
  tooltip: 'Create pool',
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
    fee,
  } = saleStructureForm.watch()

  const { tokens, chainId } = getNetworkConfig(selectedChain)
  const wrappedNativeAssetAddress = tokens.addresses.wNativeAsset
  const helpers = new LiquidityActionHelpers()
  const isCollateralNativeAsset = helpers.isNativeAsset(collateralTokenAddress as Address)

  // pool must be created with wrapped native asset
  let reserveTokenAddress = collateralTokenAddress
  if (isCollateralNativeAsset) {
    reserveTokenAddress = wrappedNativeAssetAddress
  }

  const { name, owner } = projectInfoForm.watch()

  const receiptProps = usePoolCreationReceipt({
    txHash: transaction?.execution?.data,
    chain: selectedChain,
    userAddress: userAddress,
    protocolVersion: 3 as const,
  })

  useEffect(() => {
    if (receiptProps.poolAddress) setPoolAddress(receiptProps.poolAddress)
  }, [receiptProps.poolAddress, setPoolAddress])

  const { buildTenderlyUrl } = useTenderly({ chainId })

  const {
    projectTokenStartWeight,
    reserveTokenStartWeight,
    projectTokenEndWeight,
    reserveTokenEndWeight,
  } = useLbpWeights()

  const blockProjectTokenSwapsIn = userActions === 'buy_only' ? true : false

  const { symbol: launchTokenSymbol } = useTokenMetadata(launchTokenAddress, selectedChain)
  const { symbol: reserveTokenSymbol } = useTokenMetadata(reserveTokenAddress, selectedChain)

  const isValidFormStates = saleStructureForm.formState.isValid && projectInfoForm.formState.isValid

  const createPoolInput = isValidFormStates
    ? {
        protocolVersion: 3 as const,
        poolType: PoolType.LiquidityBootstrapping,
        symbol: `${launchTokenSymbol}-${reserveTokenSymbol}-LBP`,
        name: `${name} Liquidity Bootstrapping Pool`,
        swapFeePercentage: parseUnits((fee / 100).toString(), 18),
        chainId,
        lbpParams: {
          owner: owner || userAddress,
          blockProjectTokenSwapsIn,
          projectToken: launchTokenAddress as Address,
          reserveToken: reserveTokenAddress as Address,
          projectTokenStartWeight: parseUnits(`${projectTokenStartWeight / 100}`, 18),
          reserveTokenStartWeight: parseUnits(`${reserveTokenStartWeight / 100}`, 18),
          projectTokenEndWeight: parseUnits(`${projectTokenEndWeight / 100}`, 18),
          reserveTokenEndWeight: parseUnits(`${reserveTokenEndWeight / 100}`, 18),
          startTime: BigInt(Math.floor(new Date(startTime).getTime() / 1000)),
          endTime: BigInt(Math.floor(new Date(endTime).getTime() / 1000)),
        },
      }
    : undefined

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
            onTransactionChange={setTransaction}
            txConfig={buildCallDataQuery.data}
          />
        )
      },
    }),
    [transaction, buildCallDataQuery.data, gasEstimationMeta, poolAddress]
  )
}
