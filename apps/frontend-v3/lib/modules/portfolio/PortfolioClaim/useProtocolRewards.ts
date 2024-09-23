import { useReadContract } from 'wagmi'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { FeeDistributorStaticAbi } from '../../web3/contracts/abi/FeeDistributorStaticAbi'
import networkConfigs from '@/lib/config/networks'
import { formatUnits } from 'viem'
import { useTokens } from '../../tokens/TokensProvider'
import { bn } from '@/lib/shared/utils/numbers'
import { BPT_DECIMALS } from '../../pool/pool.constants'

export const claimableVeBalRewardsTokens: string[] = [
  '0x7B50775383d3D6f0215A8F290f2C9e2eEBBEceb2', // bb-a-USD v1
  '0xA13a9247ea42D743238089903570127DdA72fE44', // bb-a-USD v2
  '0xfeBb0bbf162E64fb9D0dfe186E517d84C395f016', // bb-a-USD v3
  '0xba100000625a3754423978a60c9317c58a424e3D', // BAL
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
]

export function useProtocolRewards() {
  const { userAddress, isConnected } = useUserAccount()
  const { priceFor, getToken } = useTokens()

  const {
    data: protocolRewardsData = [],
    isLoading: isLoadingProtocolRewards,
    error: protocolRewardsError,
    refetch,
    status,
  } = useReadContract({
    chainId: networkConfigs.MAINNET.chainId,
    address: networkConfigs.MAINNET.contracts.feeDistributor,
    abi: FeeDistributorStaticAbi,
    functionName: 'claimTokens',
    args: [userAddress, claimableVeBalRewardsTokens],
    query: {
      enabled: isConnected,
      select: data => {
        return (data as bigint[]).map((clBalance, index) => {
          const tokenAddress = claimableVeBalRewardsTokens[index]
          const tokenPrice = tokenAddress ? priceFor(tokenAddress, networkConfigs.MAINNET.chain) : 0
          const decimals =
            (tokenAddress && getToken(tokenAddress, networkConfigs.MAINNET.chain)?.decimals) ||
            BPT_DECIMALS
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
