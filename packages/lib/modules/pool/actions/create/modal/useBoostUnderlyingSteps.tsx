import { PoolCreationToken } from '../types'
import { usePublicClient, useReadContracts } from 'wagmi'
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
import { parseDepositUnderlyingReceipt } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt-parsers'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'

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
        wrapped: {
          address: token.address,
          amountRaw: parseUnits(token.amount, token.data.decimals),
          symbol: token.data.symbol,
        },
        underlying: { address: token.data.underlyingTokenAddress as Address },
      }
    })

  const { data: underlyingAmounts, isLoading: isLoadingUnderlyingAmounts } = useReadContracts({
    contracts: poolTokensToBoost.map(({ wrapped }) => ({
      address: wrapped.address,
      abi: erc4626Abi,
      functionName: 'previewMint' as const,
      args: [wrapped.amountRaw],
    })),
    query: { enabled: poolTokensToBoost.length > 0 },
  })

  const tokenToSpender = Object.fromEntries(
    poolTokensToBoost.map(t => [t.underlying.address, t.wrapped.address])
  ) as Record<Address, Address>

  const amounts = poolTokensToBoost.map((t, index) => {
    const symbol = getToken(t.underlying.address, network)?.symbol
    const amountRaw = underlyingAmounts?.[index]?.result ?? 0n

    return { ...t, underlying: { ...t.underlying, amountRaw, symbol } }
  })

  const { steps: approvalSteps, isLoading: isLoadingApprovalSteps } = useTokenApprovalSteps({
    spenderAddress: (tokenAddress: Address) => tokenToSpender[tokenAddress],
    chain: network,
    approvalAmounts: amounts.map(a => ({
      ...a,
      address: a.underlying.address,
      rawAmount: a.underlying.amountRaw,
    })),
    actionType: 'Wrapping',
    enabled: poolTokensToBoost.length > 0 && !isLoadingUnderlyingAmounts,
  })

  const depositStepsParams = { poolTokens, amounts, network, isPoolInitialized }
  const { depositSteps, isLoadingDepositSteps } = useDepositSteps(depositStepsParams)
  const isLoading = isLoadingUnderlyingAmounts || isLoadingApprovalSteps || isLoadingDepositSteps
  const steps = [...approvalSteps, ...depositSteps]

  return { steps, isLoading }
}

type BoostAmounts = {
  underlying: {
    amountRaw: bigint
    symbol: string | undefined
    address: `0x${string}`
  }
  wrapped: {
    address: `0x${string}`
    amountRaw: bigint
    symbol: string | undefined
  }
}[]

type DepositStepsParams = {
  poolTokens: PoolCreationToken[]
  amounts: BoostAmounts
  network: GqlChain
  isPoolInitialized: boolean
}

function useDepositSteps({ poolTokens, amounts, network, isPoolInitialized }: DepositStepsParams) {
  const { getToken } = useTokens()
  const { userAddress } = useUserAccount()
  const chainId = getChainId(network)
  const { updatePoolToken } = usePoolCreationForm()
  const publicClient = usePublicClient({ chainId })

  const { getTransaction, setTransactionFn } = useStepsTransactionState()
  const { buildTenderlyUrl } = useTenderly({ chainId })

  const {
    data: userWrappedBalances,
    isLoading: isLoadingWrappedBalances,
    refetch: refetchWrappedUserBalances,
  } = useReadContracts({
    contracts: amounts.map(a => ({
      chainId,
      address: a.wrapped.address,
      abi: erc4626Abi,
      functionName: 'balanceOf' as const,
      args: [userAddress],
    })),
  })

  const depositSteps = amounts.map(({ underlying, wrapped }, idx) => {
    const id = `deposit-${wrapped.address}`

    const labels = {
      init: `Deposit ${underlying.symbol} to ${wrapped.symbol}`,
      title: `Deposit ${underlying.symbol} to ${wrapped.symbol}`,
      tooltip: `Deposit ${underlying.symbol} into ${wrapped.symbol} vault`,
      confirming: `Confirming deposit ${underlying.symbol}`,
      confirmed: `Deposit ${underlying.symbol} confirmed`,
    }

    const txConfig = {
      account: userAddress,
      chainId,
      to: wrapped.address,
      data: encodeFunctionData({
        abi: erc4626Abi,
        functionName: 'deposit',
        args: [underlying.amountRaw, userAddress],
      }),
    }

    const gasEstimationMeta = sentryMetaForWagmiSimulation(
      'Error in finalize pool gas estimation',
      {
        buildCallQueryData: txConfig,
        tenderlyUrl: buildTenderlyUrl(txConfig),
      }
    )

    const transaction = getTransaction(id)

    const wrappedBalanceRaw = userWrappedBalances?.[idx]?.result ?? 0n
    const hasSufficientWrappedBalance = wrappedBalanceRaw >= wrapped.amountRaw
    const isComplete = () => hasSufficientWrappedBalance || isPoolInitialized

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
      onSuccess: async () => {
        if (!transaction?.execution?.data) return
        if (!publicClient) throw new Error('missing public client')

        const receipt = await publicClient.getTransactionReceipt({
          hash: transaction?.execution?.data,
        })

        const { mintedShares } = parseDepositUnderlyingReceipt({
          receiptLogs: receipt.logs,
          chain: network,
          getToken,
          userAddress,
          txValue: 0n,
          protocolVersion: 3,
        })

        if (mintedShares) {
          const idx = poolTokens.findIndex(t => isSameAddress(t.address, wrapped.address))
          updatePoolToken(idx, { amount: mintedShares.humanAmount })
        }

        refetchWrappedUserBalances()
      },
    }
  })

  return { depositSteps, isLoadingDepositSteps: isLoadingWrappedBalances }
}
