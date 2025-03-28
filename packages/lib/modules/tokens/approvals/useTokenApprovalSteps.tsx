/* eslint-disable react-hooks/exhaustive-deps */
import { getChainId, getNativeAssetAddress } from '@repo/lib/config/app.config'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useMemo } from 'react'
import { Address, encodeFunctionData, erc20Abi } from 'viem'
import { ManagedErc20TransactionButton } from '../../transactions/transaction-steps/TransactionButton'
import { TransactionStep, TxCall } from '../../transactions/transaction-steps/lib'
import { ManagedErc20TransactionInput } from '../../web3/contracts/useManagedErc20Transaction'
import { useTokenAllowances } from '../../web3/useTokenAllowances'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { useTokens } from '../TokensProvider'
import { ApprovalAction, buildTokenApprovalLabels } from './approval-labels'
import {
  RawAmount,
  areEmptyRawAmounts,
  getRequiredTokenApprovals,
  isTheApprovedAmountEnough,
} from './approval-rules'
import { requiresDoubleApproval } from '../token.helpers'
import { ErrorWithCauses } from '@repo/lib/shared/utils/errors'

export type Params = {
  spenderAddress: Address
  chain: GqlChain
  approvalAmounts: RawAmount[]
  actionType: ApprovalAction
  isPermit2?: boolean
  bptSymbol?: string //Edge-case for approving
  lpToken?: string
  enabled?: boolean
  wethIsEth?: boolean
}

/*
  Generic hook to create a Token Approval Step Config for different flows defined by the actionType property
*/
export function useTokenApprovalSteps({
  spenderAddress,
  chain,
  approvalAmounts,
  actionType,
  bptSymbol,
  isPermit2 = false,
  enabled = true,
  lpToken,
  wethIsEth,
}: Params): { isLoading: boolean; steps: TransactionStep[] } {
  const { userAddress } = useUserAccount()
  const { getToken } = useTokens()
  const nativeAssetAddress = getNativeAssetAddress(chain)

  // Unwraps of wrapped native assets do not require approval
  const isUnwrappingNative = wethIsEth && actionType === 'Unwrapping'

  const _approvalAmounts = useMemo(
    () => approvalAmounts.filter(amount => !isSameAddress(amount.address, nativeAssetAddress)),
    [approvalAmounts]
  )

  const approvalTokenAddresses = useMemo(
    () => _approvalAmounts.map(amount => amount.address),
    [_approvalAmounts]
  )

  const tokenAllowances = useTokenAllowances({
    chainId: getChainId(chain),
    userAddress,
    spenderAddress,
    tokenAddresses: approvalTokenAddresses,
    enabled:
      enabled && !areEmptyRawAmounts(_approvalAmounts) && !!spenderAddress && !isUnwrappingNative,
  })

  const tokenAmountsToApprove = getRequiredTokenApprovals({
    chainId: chain,
    rawAmounts: _approvalAmounts,
    allowanceFor: tokenAllowances.allowanceFor,
    isPermit2,
    skipAllowanceCheck: isUnwrappingNative,
  })

  const steps = useMemo(() => {
    return tokenAmountsToApprove.map((tokenAmountToApprove, index) => {
      const {
        tokenAddress,
        requiredRawAmount,
        requestedRawAmount,
        symbol: approvalSymbol,
      } = tokenAmountToApprove
      // USDT edge-case: requires setting approval to 0n before adjusting the value up again
      const isApprovingZeroForDoubleApproval =
        requiresDoubleApproval(chain, tokenAddress) && requiredRawAmount === 0n
      const id = isApprovingZeroForDoubleApproval ? `${tokenAddress}-0` : tokenAddress

      const token = getToken(tokenAddress, chain)

      const getSymbol = () => {
        if (approvalSymbol && approvalSymbol !== 'Unknown') return approvalSymbol
        if (bptSymbol) return bptSymbol
        return token?.symbol || 'Unknown'
      }

      const labels = buildTokenApprovalLabels({
        actionType,
        symbol: getSymbol(),
        isPermit2,
        lpToken,
      })

      const isComplete = (tokenAllowanceAfterRefetch?: bigint) => {
        const tokenAllowance =
          tokenAllowanceAfterRefetch || tokenAllowances.allowanceFor(tokenAddress)
        const nextToken = isApprovingZeroForDoubleApproval
          ? tokenAmountsToApprove[index + 1]
          : undefined

        return isTheApprovedAmountEnough(
          tokenAllowance,
          requiredRawAmount,
          isApprovingZeroForDoubleApproval,
          nextToken
        )
      }

      const checkEdgeCaseErrors = (tokenAllowance: bigint) => {
        const errors = []

        const nextToken = isApprovingZeroForDoubleApproval
          ? tokenAmountsToApprove[index + 1]
          : undefined
        if (
          !isTheApprovedAmountEnough(
            tokenAllowance,
            requiredRawAmount,
            isApprovingZeroForDoubleApproval,
            nextToken
          )
        ) {
          errors.push({
            id: 'not-enough-allowance',
            title: 'Error on approval step',
            description: 'The approved amount is not enough for the current transaction.',
          })
        }

        return errors
      }

      const isTxEnabled = !!spenderAddress && !tokenAllowances.isAllowancesLoading
      const props: ManagedErc20TransactionInput = {
        tokenAddress,
        functionName: 'approve',
        labels,
        isComplete,
        chainId: getChainId(chain),
        args: [spenderAddress, requestedRawAmount],
        enabled: isTxEnabled,
        simulationMeta: sentryMetaForWagmiSimulation(
          'Error in wagmi tx simulation: Approving token',
          tokenAmountToApprove
        ),
      }

      const args = props.args as [Address, bigint]

      return {
        id,
        stepType: 'tokenApproval',
        labels,
        isComplete,
        renderAction: () => <ManagedErc20TransactionButton id={id} key={id} {...props} />,
        batchableTxCall: isTxEnabled ? buildBatchableTxCall({ tokenAddress, args }) : undefined,
        onSuccess: async () => {
          const newAllowances = await tokenAllowances.refetchAllowances()
          // Ignore check if allowances are refetching
          if (newAllowances.isRefetching) return
          const updatedTokenAllowance = newAllowances.allowanceFor(tokenAddress)
          const errors = checkEdgeCaseErrors(updatedTokenAllowance)
          if (errors.length > 0) throw new ErrorWithCauses('Edge case errors', errors)
        },
      } as const satisfies TransactionStep
    })
  }, [tokenAllowances.allowances, userAddress, tokenAmountsToApprove])

  return {
    isLoading: tokenAllowances.isAllowancesLoading,
    steps,
  }
}

// Only used when wallet supports atomic bath (smart accounts like Gnosis Safe)
function buildBatchableTxCall({
  tokenAddress,
  args,
}: {
  tokenAddress: Address
  args: readonly [Address, bigint]
}): TxCall {
  const data = encodeFunctionData({
    abi: erc20Abi, // TODO: support usdtAbi
    functionName: 'approve',
    args,
  })
  return {
    to: tokenAddress,
    data: data,
  }
}
