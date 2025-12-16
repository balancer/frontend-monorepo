import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { isHash, Address, zeroAddress } from 'viem'
import { useParams } from 'next/navigation'
import { useCreatePoolStep } from './useCreatePoolStep'
import { getGqlChain } from '@repo/lib/config/app.config'
import { type ExtendedInitPoolInput } from '@repo/lib/modules/pool/actions/create/types'
import { getSpenderForCreatePool } from '@repo/lib/modules/tokens/token.helpers'
import { useTokenApprovalSteps } from '@repo/lib/modules/tokens/approvals/useTokenApprovalSteps'
import { useIsPoolInitialized } from '@repo/lib/modules/pool/queries/useIsPoolInitialized'
import { useSignPermit2InitializeStep } from '@repo/lib/modules/pool/actions/initialize/useSignPermit2InitializeStep'
import { usePermit2ApprovalSteps } from '@repo/lib/modules/tokens/approvals/permit2/usePermit2ApprovalSteps'
import { useShouldBatchTransactions } from '@repo/lib/modules/web3/safe.hooks'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { getApprovalAndAddSteps } from '@repo/lib/modules/pool/actions/add-liquidity/useAddLiquiditySteps'
import { useInitializePoolStep } from './useInitializePoolStep'
import { CreatePoolInput } from '../types'
import { isCowPool } from '../helpers'
import { useCreateCowSteps } from './cow-amm-steps/useCreateCowSteps'

type Props = {
  createPoolInput: CreatePoolInput
  initPoolInput: ExtendedInitPoolInput
  poolAddress: Address | undefined
  setPoolAddress: (poolAddress: Address) => void
}

export function usePoolCreationTransactions({
  createPoolInput,
  initPoolInput,
  poolAddress,
  setPoolAddress,
}: Props) {
  const { poolType, protocolVersion } = createPoolInput
  const { amountsIn, wethIsEth, chainId } = initPoolInput
  const shouldBatchTransactions = useShouldBatchTransactions()
  const { shouldUseSignatures } = useUserSettings()
  const { isPoolInitialized } = useIsPoolInitialized({
    chainId,
    poolAddress,
    isEnabled: !isCowPool(poolType),
  })
  const createPoolStep = useCreatePoolStep({ createPoolInput, poolAddress, setPoolAddress })
  const chain = getGqlChain(chainId)

  // cow requires pool deployment to happen before we know the spender
  const cowSpenderAdress = poolAddress ? poolAddress : zeroAddress
  const spenderAddress = protocolVersion === 1 ? cowSpenderAdress : getSpenderForCreatePool(chain)
  const isPermit2 = protocolVersion === 3

  const { isLoading: isLoadingTokenApprovalSteps, steps: tokenApprovalSteps } =
    useTokenApprovalSteps({
      spenderAddress,
      chain,
      approvalAmounts: amountsIn,
      actionType: 'InitializePool',
      isPermit2,
      wethIsEth,
    })

  const signPermit2Step = useSignPermit2InitializeStep({
    initPoolInput,
    isComplete: isPoolInitialized,
  })

  const { steps: permit2ApprovalSteps, isLoading: isLoadingPermit2ApprovalSteps } =
    usePermit2ApprovalSteps({
      chain,
      approvalAmounts: amountsIn,
      actionType: 'InitializePool',
      enabled: !shouldUseSignatures,
    })

  const initV3PoolStep = useInitializePoolStep({ initPoolInput, poolAddress, poolType })
  const v3Steps = getApprovalAndAddSteps({
    shouldUseSignatures,
    signPermit2Step,
    permit2ApprovalSteps,
    tokenApprovalSteps,
    shouldBatchTransactions,
    isPermit2,
    addLiquidityStep: initV3PoolStep,
  })

  const { finishCowSteps, isLoadingFinishCowSteps } = useCreateCowSteps(initPoolInput)
  const cowSteps = [...tokenApprovalSteps, ...finishCowSteps]

  const steps = [createPoolStep, ...(isCowPool(poolType) ? cowSteps : v3Steps)]

  const isLoadingSteps =
    isLoadingTokenApprovalSteps ||
    !signPermit2Step ||
    isLoadingTokenApprovalSteps ||
    isLoadingPermit2ApprovalSteps ||
    isLoadingFinishCowSteps

  const transactionSteps = useTransactionSteps(steps, isLoadingSteps)
  const initPoolTxHash = transactionSteps.lastTransaction?.result?.data?.transactionHash
  const { txHash } = useParams<{ txHash: string }>()

  return {
    transactionSteps,
    lastTransaction: transactionSteps.lastTransaction,
    initPoolTxHash,
    urlTxHash: isHash(txHash) ? txHash : undefined,
  }
}
