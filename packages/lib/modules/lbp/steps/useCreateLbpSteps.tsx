import { useCreateLbpStep } from './useCreateLbpStep'
import { useTokenApprovalSteps } from '@repo/lib/modules/tokens/approvals/useTokenApprovalSteps'
import { useLbpForm } from '../LbpFormProvider'
import { getSpenderForCreatePool } from '@repo/lib/modules/tokens/token.helpers'
import { Address, parseUnits } from 'viem'
import { useTokenMetadata } from '@repo/lib/modules/tokens/useTokenMetadata'
import { useInitializeLbpStep } from './useInitializeLbpStep'
import { useSignPermit2InitializeStep } from '@repo/lib/modules/pool/actions/initialize/useSignPermit2InitializeStep'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { LiquidityActionHelpers } from '@repo/lib/modules/pool/actions/LiquidityActionHelpers'
import { useShouldBatchTransactions } from '@repo/lib/modules/web3/safe.hooks'
import { hasSomePendingNestedTxInBatch } from '@repo/lib/modules/transactions/transaction-steps/safe/safe.helpers'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { usePermit2ApprovalSteps } from '@repo/lib/modules/tokens/approvals/permit2/usePermit2ApprovalSteps'

export function useCreateLbpSteps() {
  const createLbpStep = useCreateLbpStep()
  const { saleStructureForm } = useLbpForm()
  const { selectedChain, collateralTokenAddress } = saleStructureForm.getValues()
  const chainId = getNetworkConfig(selectedChain).chainId
  const helpers = new LiquidityActionHelpers()
  const isCollateralNativeAsset = helpers.isNativeAsset(collateralTokenAddress as Address)
  const shouldBatchTransactions = useShouldBatchTransactions()
  const { shouldUseSignatures } = useUserSettings()

  const initAmounts = useLbpInitAmounts(isCollateralNativeAsset)

  const { isLoading: isLoadingTokenApprovalSteps, steps: tokenApprovalSteps } =
    useTokenApprovalSteps({
      spenderAddress: getSpenderForCreatePool(selectedChain),
      chain: selectedChain,
      approvalAmounts: initAmounts,
      actionType: 'AddLiquidity',
      isPermit2: true,
      wethIsEth: isCollateralNativeAsset,
    })

  const initPoolInput = {
    minBptAmountOut: 0n,
    chainId,
    amountsIn: initAmounts,
    wethIsEth: isCollateralNativeAsset,
  }

  const signPermit2Step = useSignPermit2InitializeStep({ initPoolInput })
  // If user chooses setting to not use signatures, use these approval txs
  const { steps: permit2ApprovalSteps, isLoading: isLoadingPermit2ApprovalSteps } =
    usePermit2ApprovalSteps({
      chain: selectedChain,
      approvalAmounts: initAmounts,
      actionType: 'AddLiquidity',
      enabled: !shouldUseSignatures,
    })

  const initLbpStep = useInitializeLbpStep({ initPoolInput })

  const isSignPermit2Loading = !signPermit2Step

  const isLoadingSteps =
    !initAmounts.length ||
    isLoadingTokenApprovalSteps ||
    isSignPermit2Loading ||
    isLoadingPermit2ApprovalSteps

  const steps = getApprovalAndCreateSteps({
    shouldUseSignatures,
    signPermit2Step,
    permit2ApprovalSteps,
    initLbpStep,
    tokenApprovalSteps,
    shouldBatchTransactions,
  })

  return {
    isLoadingSteps,
    steps: [createLbpStep, ...steps],
  }
}

function getApprovalAndCreateSteps({
  shouldUseSignatures,
  signPermit2Step,
  permit2ApprovalSteps,
  initLbpStep,
  tokenApprovalSteps,
  shouldBatchTransactions,
}: {
  shouldUseSignatures: boolean
  signPermit2Step?: TransactionStep
  permit2ApprovalSteps: TransactionStep[]
  tokenApprovalSteps: TransactionStep[]
  initLbpStep: TransactionStep
  shouldBatchTransactions: boolean
}) {
  const shouldUsePermit2Signatures = shouldUseSignatures && !!signPermit2Step
  const shouldUsePermit2Transactions = !shouldUseSignatures && !!permit2ApprovalSteps

  /*
  Signatures are disabled so we need:
  - Approve Permit2 as spender in tokenApprovalSteps
  - Explicit Permit2 token approvals in permit2ApprovalSteps (as permit2 signatures are disabled)
 */
  initLbpStep.nestedSteps = shouldUsePermit2Transactions
    ? [...tokenApprovalSteps, ...permit2ApprovalSteps]
    : tokenApprovalSteps

  const shouldDisplayBatchTransactions =
    shouldBatchTransactions && hasSomePendingNestedTxInBatch(initLbpStep)

  if (shouldUsePermit2Signatures) {
    return shouldDisplayBatchTransactions
      ? [signPermit2Step, initLbpStep] // Hide token approvals when batching token approvals w/ permit2 sigs
      : [...tokenApprovalSteps, signPermit2Step, initLbpStep]
  }

  return shouldDisplayBatchTransactions
    ? [initLbpStep] // Hide all approvals when batching w/o permit2 sigs
    : [...tokenApprovalSteps, ...permit2ApprovalSteps, initLbpStep]
}

function useLbpInitAmounts(isCollateralNativeAsset: boolean) {
  const { saleStructureForm } = useLbpForm()
  const {
    selectedChain: chain,
    collateralTokenAddress,
    collateralTokenAmount,
    launchTokenAddress,
    saleTokenAmount,
  } = saleStructureForm.watch()

  let reserveTokenAddress = collateralTokenAddress
  if (isCollateralNativeAsset) {
    const { tokens } = getNetworkConfig(chain)
    reserveTokenAddress = tokens.addresses.wNativeAsset
  }

  const {
    decimals: reserveTokenDecimals,
    symbol: reserveTokenSymbol,
    isLoading: isLoadingCollateralToken,
  } = useTokenMetadata(reserveTokenAddress, chain)
  const {
    decimals: launchTokenDecimals,
    symbol: launchTokenSymbol,
    isLoading: isLoadingLaunchToken,
  } = useTokenMetadata(launchTokenAddress, chain)

  if (
    !launchTokenDecimals ||
    isLoadingLaunchToken ||
    !launchTokenSymbol ||
    !reserveTokenDecimals ||
    isLoadingCollateralToken ||
    !reserveTokenSymbol
  ) {
    return []
  }

  const launchTokenAmountIn = {
    address: launchTokenAddress as Address,
    decimals: launchTokenDecimals,
    rawAmount: parseUnits(saleTokenAmount, launchTokenDecimals),
    symbol: launchTokenSymbol,
  }

  const reserveTokenAmountIn = {
    address: reserveTokenAddress as Address,
    decimals: reserveTokenDecimals,
    rawAmount: parseUnits(collateralTokenAmount, reserveTokenDecimals),
    symbol: reserveTokenSymbol,
  }

  return [reserveTokenAmountIn, launchTokenAmountIn]
}
