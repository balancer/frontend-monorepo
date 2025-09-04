import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren } from 'react'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { isHash } from 'viem'
import { useParams } from 'next/navigation'
import { useCreatePoolStep } from './useCreatePoolStep'
import { parseUnits } from 'viem'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import {
  type InputAmountWithSymbol,
  type ExtendedInitPoolInputV3,
} from '@repo/lib/modules/pool/actions/create/types'
import { getSpenderForCreatePool } from '@repo/lib/modules/tokens/token.helpers'
import { useTokenApprovalSteps } from '@repo/lib/modules/tokens/approvals/useTokenApprovalSteps'
import { useIsPoolInitialized } from '@repo/lib/modules/pool/queries/useIsPoolInitialized'
import { useLocalStorage } from 'usehooks-ts'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { useSignPermit2InitializeStep } from '@repo/lib/modules/pool/actions/initialize/useSignPermit2InitializeStep'
import { usePermit2ApprovalSteps } from '@repo/lib/modules/tokens/approvals/permit2/usePermit2ApprovalSteps'
import { useShouldBatchTransactions } from '@repo/lib/modules/web3/safe.hooks'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { getApprovalAndAddSteps } from '@repo/lib/modules/pool/actions/add-liquidity/useAddLiquiditySteps'
import { useInitializePoolStep } from './useInitializePoolStep'
import { PoolCreationForm } from '../constants'

export type UsePoolCreationTransactionsResponse = ReturnType<
  typeof usePoolCreationTransactionsLogic
>
const PoolCreationTransactionsContext = createContext<UsePoolCreationTransactionsResponse | null>(
  null
)

export function usePoolCreationTransactionsLogic() {
  // idk why need to pull directly from LS but usePoolCreationForm() returns the form's initial default values if called within usePoolCreationLogic for some reason
  const [poolCreationForm] = useLocalStorage<PoolCreationForm | undefined>(
    LS_KEYS.PoolCreation.Form,
    undefined
  )
  if (!poolCreationForm) throw new Error('form data missing in PoolCreationTransactionsProvider')

  const { network, poolTokens, poolType } = poolCreationForm

  const [poolAddress] = useLocalStorage<`0x${string}` | undefined>(
    LS_KEYS.PoolCreation.Address,
    undefined
  )

  const shouldBatchTransactions = useShouldBatchTransactions()
  const { shouldUseSignatures } = useUserSettings()

  const chainId = getNetworkConfig(network).chainId

  const { isPoolInitialized } = useIsPoolInitialized(chainId, poolAddress)

  const amountsIn: InputAmountWithSymbol[] = poolTokens.map(token => {
    const address = token.address
    const decimals = token.data?.decimals
    const symbol = token.data?.symbol
    if (!address) throw new Error('token address missing for amountsIn of pool creation')
    if (!decimals) throw new Error('token decimals missing for amountsIn of pool creation')
    if (!symbol) throw new Error('token symbol missing for amountsIn of pool creation')
    const rawAmount = parseUnits(token.amount, decimals)
    return { address, decimals, rawAmount, symbol }
  })

  const wethIsEth = false // TODO: enable me

  const initPoolInput: ExtendedInitPoolInputV3 = {
    minBptAmountOut: 0n,
    chainId,
    amountsIn,
    wethIsEth,
  }

  const createPoolStep = useCreatePoolStep()

  const { isLoading: isLoadingTokenApprovalSteps, steps: tokenApprovalSteps } =
    useTokenApprovalSteps({
      spenderAddress: getSpenderForCreatePool(network),
      chain: network,
      approvalAmounts: amountsIn,
      actionType: 'InitializePool',
      isPermit2: true,
      wethIsEth,
    })

  const signPermit2Step = useSignPermit2InitializeStep({
    initPoolInput,
    isComplete: isPoolInitialized,
  })

  const { steps: permit2ApprovalSteps, isLoading: isLoadingPermit2ApprovalSteps } =
    usePermit2ApprovalSteps({
      chain: network,
      approvalAmounts: amountsIn,
      actionType: 'InitializePool',
      enabled: !shouldUseSignatures,
    })

  const initPoolStep = useInitializePoolStep({ initPoolInput, poolAddress, poolType })

  const approvalAndAddSteps = getApprovalAndAddSteps({
    shouldUseSignatures,
    signPermit2Step,
    permit2ApprovalSteps,
    tokenApprovalSteps,
    shouldBatchTransactions,
    isPermit2: true,
    addLiquidityStep: initPoolStep,
  })

  const steps = [createPoolStep, ...approvalAndAddSteps]

  const isLoadingSteps =
    isLoadingTokenApprovalSteps ||
    !signPermit2Step ||
    isLoadingTokenApprovalSteps ||
    isLoadingPermit2ApprovalSteps

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

export function PoolCreationTransactionsProvider({ children }: PropsWithChildren) {
  const hook = usePoolCreationTransactionsLogic()
  return (
    <PoolCreationTransactionsContext.Provider value={hook}>
      {children}
    </PoolCreationTransactionsContext.Provider>
  )
}

export const usePoolCreationTransactions = (): UsePoolCreationTransactionsResponse =>
  useMandatoryContext(PoolCreationTransactionsContext, 'PoolCreationTransactions')
