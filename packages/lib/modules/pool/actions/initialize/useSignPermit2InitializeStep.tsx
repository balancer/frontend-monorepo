import { PublicWalletClient, type InitPoolInputV3, balancerV3Contracts } from '@balancer/sdk'
import { signPermit2Init } from '@repo/lib/modules/tokens/approvals/permit2/signPermit2Init'
import { SignPermit2Fn as SignPermit2Fn } from '@repo/lib/modules/tokens/approvals/permit2/useSignPermit2'
import { useSignPermit2Step } from '@repo/lib/modules/transactions/transaction-steps/useSignPermit2Step'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useTokenMetadata } from '@repo/lib/modules/tokens/useTokenMetadata'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

type Props = {
  initPoolInput: InitPoolInputV3
  chain: GqlChain
}

export function useSignPermit2InitializeStep({ initPoolInput, chain }: Props) {
  const { wethIsEth, amountsIn, chainId } = initPoolInput

  const { userAddress } = useUserAccount()

  const signPermit2Fn: SignPermit2Fn = (sdkClient: PublicWalletClient) => {
    return signPermit2Init({
      sdkClient,
      account: userAddress,
      initPoolInput,
    })
  }

  // TODO: figure out better way to get token symbols lol
  const { symbol: symbolToken0 } = useTokenMetadata(amountsIn?.[0]?.address, chain)
  const { symbol: symbolToken1 } = useTokenMetadata(amountsIn?.[1]?.address, chain)
  const tokenAmountsIn = amountsIn?.map((amount, index) => ({
    amount: amount.rawAmount,
    address: amount.address,
    symbol: index === 0 ? (symbolToken0 ?? 'SYMBOL_0') : (symbolToken1 ?? 'SYMBOL_1'),
  }))

  const signPermit2Step = useSignPermit2Step({
    chainId,
    signPermit2Fn,
    wethIsEth: wethIsEth ?? false, // TODO?
    tokenAmountsIn,
    isPermit2: true,
    isSimulationReady: true, // TODO?
    spender: balancerV3Contracts.Router[chainId as keyof typeof balancerV3Contracts.Router], // TODO: update with new SDK AddressProvider class
  })

  return signPermit2Step
}
