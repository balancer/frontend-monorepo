import { PublicWalletClient, type InitPoolInputV3, balancerV3Contracts } from '@balancer/sdk'
import { signPermit2Initialization } from '@repo/lib/modules/tokens/approvals/permit2/signPermit2Initialization'
import { SignPermit2Fn as SignPermit2Fn } from '@repo/lib/modules/tokens/approvals/permit2/useSignPermit2'
import { useSignPermit2Step } from '@repo/lib/modules/transactions/transaction-steps/useSignPermit2Step'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'

type TokenAmountWithSymbol = InitPoolInputV3['amountsIn'][number] & { symbol: string }

type ExtendedInitPoolInputV3 = InitPoolInputV3 & {
  amountsIn: Array<TokenAmountWithSymbol>
}

export function useSignPermit2InitializeStep({
  initPoolInput,
}: {
  initPoolInput: ExtendedInitPoolInputV3
}) {
  const { wethIsEth, amountsIn, chainId } = initPoolInput

  const { userAddress } = useUserAccount()

  const signPermit2Fn: SignPermit2Fn = (sdkClient: PublicWalletClient) => {
    return signPermit2Initialization({
      sdkClient,
      account: userAddress,
      initPoolInput,
    })
  }

  // TypeScript struggles to infer 'symbol' on destructured 'amountsIn' within the map
  const tokenAmountsIn = (amountsIn as Array<TokenAmountWithSymbol>)?.map(amount => ({
    amount: amount.rawAmount,
    address: amount.address,
    symbol: amount.symbol,
  }))

  console.log('tokenAmountsIn', tokenAmountsIn)

  const signPermit2Step = useSignPermit2Step({
    chainId,
    signPermit2Fn,
    wethIsEth: wethIsEth ?? false,
    tokenAmountsIn,
    isPermit2: true,
    isSimulationReady:
      tokenAmountsIn.length === 2 &&
      tokenAmountsIn.every(amount => amount.amount > 0n && amount.address && amount.symbol),
    spender: balancerV3Contracts.Router[chainId as keyof typeof balancerV3Contracts.Router],
  })

  console.log('details:', signPermit2Step?.details)

  return signPermit2Step
}
