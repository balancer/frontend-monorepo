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
import { RawAmount, areEmptyRawAmounts, getRequiredTokenApprovals } from './approval-rules'
import { requiresDoubleApproval } from '../token.helpers'

export type Params = {
  spenderAddress: Address
  chain: GqlChain
  approvalAmounts: RawAmount[]
  actionType: ApprovalAction
  isPermit2?: boolean
  bptSymbol?: string //Edge-case for approving
  lpToken?: string
  enabled?: boolean
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
    enabled: enabled && !areEmptyRawAmounts(_approvalAmounts) && !!spenderAddress,
  })

  const tokenAmountsToApprove = getRequiredTokenApprovals({
    chainId: chain,
    rawAmounts: _approvalAmounts,
    allowanceFor: tokenAllowances.allowanceFor,
    isPermit2,
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

      const args = props.args as [Address, bigint]

      return {
        id,
        stepType: 'tokenApproval',
        labels,
        isComplete,
        renderAction: () => <ManagedErc20TransactionButton id={id} key={id} {...props} />,
        batchableTxCall: buildBatchableTxCall({ tokenAddress, args }),
        onSuccess: () => tokenAllowances.refetchAllowances(),
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
