import { useReadContract } from 'wagmi'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { FeeDistributorStaticAbi } from '../../web3/contracts/abi/FeeDistributorStaticAbi'
import { getNetworkConfig } from '@repo/lib/config/networks'
import { formatUnits } from 'viem'
import { useTokens } from '../../tokens/TokensProvider'
import { bn } from '@repo/lib/shared/utils/numbers'
import { BPT_DECIMALS } from '../../pool/pool.constants'
import { isBalancer } from '@repo/lib/config/getProjectConfig'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export const claimableVeBalRewardsTokens: string[] = [
  '0xba100000625a3754423978a60c9317c58a424e3D', // BAL
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
]

export function useProtocolRewards() {
  const { userAddress, isConnected } = useUserAccount()
  const { priceFor, getToken, isLoadingTokens } = useTokens()

  const networkConfig = getNetworkConfig(GqlChain.Mainnet)

  const {
    data: protocolRewardsData = [],
    isLoading: isLoadingProtocolRewards,
    error: protocolRewardsError,
    refetch,
    status,
  } = useReadContract({
    chainId: networkConfig.chainId,
    address: networkConfig.contracts.feeDistributor,
    abi: FeeDistributorStaticAbi,
    functionName: 'claimTokens',
    args: [userAddress, claimableVeBalRewardsTokens],
    query: {
      enabled: isConnected && !isLoadingTokens && isBalancer, // protocol rewards are only available for balancer
      select: data => {
        return (data as bigint[]).map((clBalance, index) => {
          const tokenAddress = claimableVeBalRewardsTokens[index]
          const tokenPrice = tokenAddress ? priceFor(tokenAddress, networkConfig.chain) : 0
          const decimals =
            (tokenAddress && getToken(tokenAddress, networkConfig.chain)?.decimals) || BPT_DECIMALS
          const humanBalance = formatUnits(clBalance, decimals)
          return {
            tokenAddress,
            balance: clBalance,
            humanBalance,
            fiatBalance: bn(humanBalance).multipliedBy(tokenPrice),
          }
        })
      },
    },
  })

  return {
    protocolRewardsData: isConnected ? protocolRewardsData : [],
    isLoadingProtocolRewards,
    protocolRewardsError,
    hasLoadedProtocolRewards: status === 'success',
    refetchProtocolRewards: refetch,
  }
}
