import { useMemo } from 'react'
import { getChainId, getNativeAssetAddress, getNetworkConfig } from '@repo/lib/config/app.config'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { getRequiredTokenApprovals, areEmptyRawAmounts, RawAmount } from '../approval-rules'
import { ApprovalAction, buildTokenApprovalLabels } from '../approval-labels'
import { TransactionStep, TxCall } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import { ManagedTransactionInput } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { usePermit2Allowance } from './usePermit2Allowance'
import { useTokens } from '../../TokensProvider'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { getMaxAmountForPermit2 } from './permit2.helpers'
import { Address, encodeFunctionData } from 'viem'
import { permit2Abi } from '@balancer/sdk'
import { useStepsTransactionState } from '@repo/lib/modules/transactions/transaction-steps/useStepsTransactionState'
import { addHours, millisecondsToSeconds } from 'date-fns'

const PERMIT2_ALLOWANCE_COMPARISON_FACTOR = 100_000_000_000_000_000n

export type Params = {
  chain: GqlChain
  approvalAmounts: RawAmount[]
  actionType: ApprovalAction
  bptSymbol?: string // Edge-case for approving
  lpToken?: string
  enabled?: boolean
  wethIsEth?: boolean
  router?: Address
}

/**
 * Hook to generate transaction steps for Permit2 token approval transactions (when signatures are disabled)
 *
 * @param {Object} params - The parameters object
 * @param {GqlChain} params.chain - The chain ID where the transaction will occur
 * @param {RawAmount[]} params.approvalAmounts - Array of token amounts that need approval
 * @param {ApprovalAction} params.actionType - Type of approval action being performed
 * @param {string} [params.bptSymbol] - Symbol of BPT token for edge case approvals
 * @param {string} [params.lpToken] - LP token address if applicable
 * @param {boolean} [params.enabled=true] - Whether the hook is enabled
 * @param {boolean} [params.wethIsEth] - Whether WETH should be treated as ETH
 * @param {boolean} [params.shouldUseCompositeLiquidityRouter=false] - Whether to use the composite liquidity router
 * @returns {Object} Object containing loading state and transaction steps
 */
export function usePermit2ApprovalSteps({
  chain,
  approvalAmounts,
  actionType,
  bptSymbol,
  enabled = false,
  lpToken,
  wethIsEth,
  router,
}: Params): { isLoading: boolean; steps: TransactionStep[] } {
  const { userAddress } = useUserAccount()
  const { getTransaction, setTransactionFn } = useStepsTransactionState()
  const { getToken } = useTokens()

  // Precompute common values
  const chainId = getChainId(chain)
  const nativeAssetAddress = getNativeAssetAddress(chain)
  const networkConfig = getNetworkConfig(chain)
  const permit2Address = networkConfig.contracts.permit2
  const spenderAddress = router || networkConfig.contracts.balancer.router!

  const seventyTwoHoursFromNowMs = addHours(new Date(), 72).getTime()
  const permitExpiry = millisecondsToSeconds(seventyTwoHoursFromNowMs) // in seconds
  const nowInSecs = millisecondsToSeconds(Date.now())

  // Unwraps of wrapped native assets do not require approval
  const isUnwrappingNative = wethIsEth && actionType === 'Unwrapping'

  // Filter out native asset approvals & rename variables for clarity
  const filteredApprovalAmounts = useMemo(
    () => approvalAmounts.filter(amount => !isSameAddress(amount.address, nativeAssetAddress)),
    [approvalAmounts, nativeAssetAddress]
  )

  const approvalTokenAddresses = useMemo(
    () => filteredApprovalAmounts.map(amount => amount.address),
    [filteredApprovalAmounts]
  )

  const { allowanceFor, expirations, isLoadingPermit2Allowances, refetchPermit2Allowances } =
    usePermit2Allowance({
      chainId,
      owner: userAddress,
      spender: spenderAddress,
      tokenAddresses: approvalTokenAddresses,
      enabled: enabled && !areEmptyRawAmounts(filteredApprovalAmounts) && !isUnwrappingNative,
    })

  const tokenAmountsToApprove = getRequiredTokenApprovals({
    chainId: chain,
    rawAmounts: filteredApprovalAmounts,
    allowanceFor,
    skipAllowanceCheck: isUnwrappingNative,
  })

  const steps: TransactionStep[] = tokenAmountsToApprove.map(tokenAmountToApprove => {
    const {
      tokenAddress,
      requiredRawAmount,
      requestedRawAmount,
      symbol: approvalSymbol,
    } = tokenAmountToApprove

    const id = tokenAddress + '-permit2Approval' // To avoid key collisions with default token approvals
    const token = getToken(tokenAddress, chain)
    const amountToApprove = getMaxAmountForPermit2(requestedRawAmount)
    // Compute symbol using first defined value
    const symbol =
      approvalSymbol && approvalSymbol !== 'Unknown'
        ? approvalSymbol
        : bptSymbol || token?.symbol || 'Unknown'

    const labels = buildTokenApprovalLabels({
      actionType,
      symbol,
      lpToken,
    })

    // Check if the token has been approved
    const isComplete = () => {
      // truncate numbers for better comparison
      // see also https://github.com/balancer/frontend-monorepo/issues/1784
      const currentAllowance = allowanceFor(tokenAddress)

      const truncatedAllowance =
        currentAllowance - (currentAllowance % PERMIT2_ALLOWANCE_COMPARISON_FACTOR)

      const truncatedAmountToApprove =
        amountToApprove - (amountToApprove % PERMIT2_ALLOWANCE_COMPARISON_FACTOR)

      const isNotExpired = !!expirations && expirations[tokenAddress] > nowInSecs
      const isAllowed = truncatedAllowance >= truncatedAmountToApprove

      // some expirations were set too far in the future so redo them
      const hasValidExpiry = !!expirations && expirations[tokenAddress] < permitExpiry // 3 days from now

      return requiredRawAmount > 0n && isAllowed && isNotExpired && hasValidExpiry
    }

    const isTxEnabled = !isLoadingPermit2Allowances && !!permit2Address
    const props: ManagedTransactionInput = {
      contractAddress: permit2Address || '',
      contractId: 'permit2',
      functionName: 'approve',
      labels,
      chainId,
      args: [tokenAddress, spenderAddress, amountToApprove, permitExpiry],
      enabled: isTxEnabled,
      txSimulationMeta: sentryMetaForWagmiSimulation(
        'Error in wagmi tx simulation: Approving token',
        tokenAmountToApprove
      ),
      onTransactionChange: setTransactionFn(id),
    }

    const args = props.args as Permit2ApproveArgs

    return {
      id,
      stepType: 'tokenApproval',
      labels,
      transaction: getTransaction(id),
      isComplete,
      renderAction: () => <ManagedTransactionButton id={id} key={id} {...props} />,
      batchableTxCall: isTxEnabled ? buildBatchableTxCall({ permit2Address, args }) : undefined,
      onSuccess: () => refetchPermit2Allowances(),
    } as const satisfies TransactionStep
  })

  return {
    isLoading: isLoadingPermit2Allowances,
    steps,
  }
}

type Permit2ApproveArgs = [Address, Address, bigint, number]
// Only used when wallet supports atomic bath (smart accounts like Gnosis Safe)
function buildBatchableTxCall({
  permit2Address,
  args,
}: {
  permit2Address: Address
  args: Permit2ApproveArgs
}): TxCall {
  const data = encodeFunctionData({
    abi: permit2Abi,
    functionName: 'approve',
    args,
  })
  return {
    to: permit2Address,
    data: data,
  }
}
