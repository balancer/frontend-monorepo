import { PublicWalletClient, type InitPoolInputV3, balancerV3Contracts } from '@balancer/sdk'
import { signPermit2Initialization } from '@repo/lib/modules/tokens/approvals/permit2/signPermit2Initialization'
import { SignPermit2Fn as SignPermit2Fn } from '@repo/lib/modules/tokens/approvals/permit2/useSignPermit2'
import { useSignPermit2Step } from '@repo/lib/modules/transactions/transaction-steps/useSignPermit2Step'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useIsPoolInitialized } from '@repo/lib/modules/pool/queries/useIsPoolInitialized'
import { useLocalStorage } from 'usehooks-ts'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'

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
  const [poolAddress] = useLocalStorage<`0x${string}` | undefined>(
    LS_KEYS.LbpConfig.PoolAddress,
    undefined
  )

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

  const { data: isPoolInitialized } = useIsPoolInitialized(chainId, poolAddress)

  const isComplete = !!isPoolInitialized

  const signPermit2Step = useSignPermit2Step({
    chainId,
    signPermit2Fn,
    wethIsEth: wethIsEth ?? false,
    tokenAmountsIn,
    isPermit2: true,
    isSimulationReady: true,
    spender: balancerV3Contracts.Router[chainId as keyof typeof balancerV3Contracts.Router],
    isComplete,
  })

  return signPermit2Step
}
