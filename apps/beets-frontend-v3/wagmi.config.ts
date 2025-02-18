import { defineConfig, loadEnv } from '@wagmi/cli'
import { etherscan } from '@wagmi/cli/plugins'
import sonicNetworkConfig from '@repo/lib/config/networks/sonic'
import { erc20Abi } from 'viem'

const CONTRACTS: Array<{ name: string; abi: any }> = [
  {
    name: 'erc20',
    abi: erc20Abi,
  },
]

export default defineConfig(() => {
  const env = loadEnv({
    mode: process.env.NODE_ENV,
    envDir: process.cwd(),
  })

  return {
    out: '../../packages/lib/modules/web3/contracts/abi/beets/generated.ts',
    contracts: CONTRACTS,
    plugins: [
      etherscan({
        apiKey: env.ETHERSCAN_API_KEY,
        chainId: 146,
        contracts: [
          {
            name: 'SonicStaking',
            address: sonicNetworkConfig.contracts.beets?.lstStaking,
          },
          {
            name: 'SFC',
            address: sonicNetworkConfig.contracts.beets?.sfc,
          },
          {
            name: 'SonicStakingWithdrawRequestHelper',
            address: sonicNetworkConfig.contracts.beets?.lstWithdrawRequestHelper,
          },
          {
            name: 'Reliquary',
            address: sonicNetworkConfig.contracts.beets?.reliquary,
          },
          {
            name: 'BeetsV2BatchRelayerLibrary',
            address: '0x1498437067d7bddc4c9427964f073ee1ab4f50fc',
          },
        ],
      }),
    ],
  }
})
