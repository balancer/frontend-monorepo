import { PoolCreationToken } from '../types'
import { useReadContracts } from 'wagmi'
import { erc4626Abi, parseUnits, Address } from 'viem'
import { isApiToken } from '../helpers'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useTokenApprovalSteps } from '@repo/lib/modules/tokens/approvals/useTokenApprovalSteps'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ManagedSendTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import { useStepsTransactionState } from '@repo/lib/modules/transactions/transaction-steps/useStepsTransactionState'
import { getChainId } from '@repo/lib/config/app.config'
import { encodeFunctionData } from 'viem'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useTenderly } from '@repo/lib/modules/web3/useTenderly'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'

type Params = {
  poolTokens: PoolCreationToken[]
  network: GqlChain
  isPoolInitialized: boolean
}

export function useBoostUnderlyingSteps({ poolTokens, network, isPoolInitialized }: Params) {
  const { getToken } = useTokens()

  const poolTokensToBoost = poolTokens
    .filter(token => token.isBoostingUnderlying)
    .map(token => {
      if (
        !token.data ||
        !isApiToken(token.data) ||
        !token.data.underlyingTokenAddress ||
        !token.address
      ) {
        throw new Error('missing requiried data for boosting underlying tokens')
      }

      return {
        wrappedAddress: token.address,
        wrappedAmountRaw: parseUnits(token.amount, token.data.decimals),
        underlyingAddress: token.data.underlyingTokenAddress as Address,
      }
    })

  const { data: underlyingAmounts, isLoading: isLoadingUnderlyingAmounts } = useReadContracts({
    contracts: poolTokensToBoost.map(({ wrappedAddress, wrappedAmountRaw }) => ({
      address: wrappedAddress,
      abi: erc4626Abi,
      functionName: 'previewMint' as const,
      args: [wrappedAmountRaw],
    })),
    query: { enabled: poolTokensToBoost.length > 0 },
  })

  const tokenToSpender = Object.fromEntries(
    poolTokensToBoost.map(t => [t.underlyingAddress, t.wrappedAddress])
  ) as Record<Address, Address>

  const amounts = poolTokensToBoost.map((t, index) => {
    const symbol = getToken(t.underlyingAddress, network)?.symbol
    const underlyingAmountRaw = underlyingAmounts?.[index]?.result ?? 0n

    return { ...t, underlyingAmountRaw, symbol }
  })

  const { steps: approvalSteps, isLoading: isLoadingApprovalSteps } = useTokenApprovalSteps({
    spenderAddress: (tokenAddress: Address) => tokenToSpender[tokenAddress],
    chain: network,
    approvalAmounts: amounts.map(a => ({
      ...a,
      address: a.underlyingAddress,
      rawAmount: a.underlyingAmountRaw,
    })),
    actionType: 'Wrapping',
    enabled: poolTokensToBoost.length > 0 && !isLoadingUnderlyingAmounts,
  })

  const { depositSteps, isLoadingDepositSteps } = useDepositSteps(
    amounts,
    network,
    isPoolInitialized
  )
  const isLoading = isLoadingUnderlyingAmounts || isLoadingApprovalSteps || isLoadingDepositSteps
  const steps = [...approvalSteps, ...depositSteps]

  return { steps, isLoading }
}

type BoostAmounts = {
  underlyingAmountRaw: bigint
  symbol: string | undefined
  wrappedAddress: `0x${string}`
  wrappedAmountRaw: bigint
  underlyingAddress: `0x${string}`
}[]

function useDepositSteps(amounts: BoostAmounts, network: GqlChain, isPoolInitialized: boolean) {
  const { userAddress } = useUserAccount()
  const chainId = getChainId(network)

  const { getTransaction, setTransactionFn } = useStepsTransactionState()
  const { buildTenderlyUrl } = useTenderly({ chainId })

  const {
    data: userWrappedBalances,
    isLoading: isLoadingWrappedBalances,
    refetch: refetchWrappedUserBalances,
  } = useReadContracts({
    contracts: amounts.map(a => ({
      chainId,
      address: a.wrappedAddress,
      abi: erc4626Abi,
      functionName: 'balanceOf' as const,
      args: [userAddress],
    })),
  })

  const depositSteps = amounts.map(
    ({ wrappedAddress, underlyingAmountRaw, symbol, wrappedAmountRaw }, idx) => {
      const id = `deposit-${wrappedAddress}`

      const labels = {
        init: `Deposit ${symbol}`,
        title: `Deposit ${symbol}`,
        tooltip: `Deposit ${symbol}`,
        confirming: `Confirming deposit ${symbol}`,
        confirmed: `Deposit ${symbol} confirmed`,
      }

      const txConfig = {
        account: userAddress,
        chainId,
        to: wrappedAddress,
        data: encodeFunctionData({
          abi: erc4626Abi,
          functionName: 'deposit',
          args: [underlyingAmountRaw, userAddress],
        }),
      }

      const gasEstimationMeta = sentryMetaForWagmiSimulation(
        'Error in finalize pool gas estimation',
        {
          buildCallQueryData: txConfig,
          tenderlyUrl: buildTenderlyUrl(txConfig),
        }
      )

      // TODO: parse receipt logs for amount minted to replace init amount?
      const transaction = getTransaction(id)

      // get user balance for wrapped token
      const wrappedBalance = userWrappedBalances?.[idx]?.result ?? 0n
      const hasSufficientWrappedBalance = wrappedBalance >= wrappedAmountRaw
      const isComplete = () =>
        isTransactionSuccess(transaction) || hasSufficientWrappedBalance || isPoolInitialized

      return {
        id,
        stepType: 'depositUnderlying' as const,
        labels,
        transaction,
        renderAction: () => (
          <ManagedSendTransactionButton
            gasEstimationMeta={gasEstimationMeta}
            id={id}
            key={id}
            labels={labels}
            onTransactionChange={setTransactionFn(id)}
            txConfig={txConfig}
          />
        ),
        onTransactionChange: setTransactionFn(id),
        isComplete,
        onSuccess: () => refetchWrappedUserBalances(),
      }
    }
  )

  return { depositSteps, isLoadingDepositSteps: isLoadingWrappedBalances }
}
