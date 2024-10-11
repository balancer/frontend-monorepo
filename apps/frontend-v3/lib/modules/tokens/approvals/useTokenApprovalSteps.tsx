/* eslint-disable react-hooks/exhaustive-deps */
import { getChainId, getNativeAssetAddress } from '@/lib/config/app.config'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { isSameAddress } from '@/lib/shared/utils/addresses'
import { sentryMetaForWagmiSimulation } from '@/lib/shared/utils/query-errors'
import { useMemo } from 'react'
import { Address } from 'viem'
import { ManagedErc20TransactionButton } from '../../transactions/transaction-steps/TransactionButton'
import { TransactionStep } from '../../transactions/transaction-steps/lib'
import { ManagedErc20TransactionInput } from '../../web3/contracts/useManagedErc20Transaction'
import { useTokenAllowances } from '../../web3/useTokenAllowances'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { useTokens } from '../TokensProvider'
import { ApprovalAction, buildTokenApprovalLabels } from './approval-labels'
import { RawAmount, getRequiredTokenApprovals } from './approval-rules'
import { requiresDoubleApproval } from '../token.helpers'

export type Params = {
  spenderAddress: Address
  chain: GqlChain
  approvalAmounts: RawAmount[]
  actionType: ApprovalAction
  isPermit2?: boolean
  bptSymbol?: string //Edge-case for approving
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
}: Params): { isLoading: boolean; steps: TransactionStep[] } {
  const { userAddress } = useUserAccount()
  const { getToken } = useTokens()
  const nativeAssetAddress = getNativeAssetAddress(chain)

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
  })

  const tokenAmountsToApprove = getRequiredTokenApprovals({
    chainId: chain,
    rawAmounts: _approvalAmounts,
    allowanceFor: tokenAllowances.allowanceFor,
    isPermit2,
  })

  const steps = useMemo(() => {
    return tokenAmountsToApprove.map((tokenAmountToApprove, index) => {
      const { tokenAddress, requiredRawAmount, requestedRawAmount } = tokenAmountToApprove
      // USDT edge-case: requires setting approval to 0n before adjusting the value up again
      const isApprovingZeroForDoubleApproval =
        requiresDoubleApproval(chain, tokenAddress) && requiredRawAmount === 0n
      const id = isApprovingZeroForDoubleApproval ? `${tokenAddress}-0` : tokenAddress
      const token = getToken(tokenAddress, chain)
      const symbol = bptSymbol ?? (token && token?.symbol) ?? 'Unknown'
      const labels = buildTokenApprovalLabels({ actionType, symbol, isPermit2 })

      const isComplete = () => {
        const isAllowed = tokenAllowances.allowanceFor(tokenAddress) >= requiredRawAmount
        if (isApprovingZeroForDoubleApproval) {
          // Edge case USDT case is completed if:
          // - The allowance is 0n
          // - The allowance is greater than the required amount (of the next step)
          return (
            tokenAllowances.allowanceFor(tokenAddress) === 0n ||
            tokenAllowances.allowanceFor(tokenAddress) >=
              tokenAmountsToApprove[index + 1].requiredRawAmount
          )
        }
        return requiredRawAmount > 0n && isAllowed
      }

      const props: ManagedErc20TransactionInput = {
        tokenAddress,
        functionName: 'approve',
        labels,
        chainId: getChainId(chain),
        args: [spenderAddress, requestedRawAmount],
        enabled: !!spenderAddress && !tokenAllowances.isAllowancesLoading,
        simulationMeta: sentryMetaForWagmiSimulation(
          'Error in wagmi tx simulation: Approving token',
          tokenAmountToApprove
        ),
      }

      return {
        id,
        stepType: 'tokenApproval',
        labels,
        isComplete,
        renderAction: () => <ManagedErc20TransactionButton key={id} id={id} {...props} />,
        onSuccess: () => tokenAllowances.refetchAllowances(),
      } as const satisfies TransactionStep
    })
  }, [tokenAllowances.allowances, userAddress, tokenAmountsToApprove])

  return {
    isLoading: tokenAllowances.isAllowancesLoading,
    steps,
  }
}
