import { PublicWalletClient, AddressProvider } from '@balancer/sdk'
import { signPermit2Initialization } from '@repo/lib/modules/tokens/approvals/permit2/signPermit2Initialization'
import { SignPermit2Fn as SignPermit2Fn } from '@repo/lib/modules/tokens/approvals/permit2/useSignPermit2'
import { useSignPermit2Step } from '@repo/lib/modules/transactions/transaction-steps/useSignPermit2Step'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ExtendedInitPoolInputV3 } from '@repo/lib/modules/pool/actions/create/types'

type Params = {
  initPoolInput: ExtendedInitPoolInputV3
  isComplete: boolean
}

export function useSignPermit2InitializeStep({ initPoolInput, isComplete }: Params) {
  const { wethIsEth, amountsIn, chainId } = initPoolInput
  const { userAddress } = useUserAccount()

  const signPermit2Fn: SignPermit2Fn = (sdkClient: PublicWalletClient) => {
    return signPermit2Initialization({
      sdkClient,
      account: userAddress,
      initPoolInput,
    })
  }

  const tokenAmountsIn = amountsIn.map(amount => ({
    amount: amount.rawAmount,
    address: amount.address,
    symbol: amount.symbol,
  }))

  const signPermit2Step = useSignPermit2Step({
    chainId,
    signPermit2Fn,
    wethIsEth: wethIsEth ?? false,
    tokenAmountsIn,
    isPermit2: true,
    isSimulationReady: true,
    spender: AddressProvider.Router(chainId),
    isComplete,
  })

  return signPermit2Step
}
