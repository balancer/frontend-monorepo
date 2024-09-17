import { defineConfig, loadEnv } from '@wagmi/cli'
import { etherscan } from '@wagmi/cli/plugins'
import mainnetNetworkConfig from './lib/config/networks/mainnet'

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
    out: 'lib/modules/web3/contracts/abi/generated.ts',
    contracts: CONTRACTS,
    plugins: [
      etherscan({
        apiKey: env.ETHERSCAN_API_KEY,
        chainId: 1,
        contracts: [
          {
            name: 'BalancerV2Vault',
            address: mainnetNetworkConfig.contracts.balancer.vaultV2,
          },
          // Uncomment and replace manual abi when vault is deployed in mainnet
          // {
          //   name: 'BalancerV3Vault',
          //   address: mainnetNetworkConfig.contracts.balancer.vaultV3,
          // },
          {
            name: 'BalancerV2ComposableStablePoolV5',
            address: '0xdacf5fa19b1f720111609043ac67a9818262850c',
          },
          {
            name: 'BalancerV2WeightedPoolV4',
            address: '0x3ff3a210e57cfe679d9ad1e9ba6453a716c56a2e',
          },
          // Uncomment and replace manual abi when a Cow AMM pool is deployed in mainnet
          // {
          //   name: 'BalancerV1Pool',
          //   address: '0x232a18645c4e33dd64e6925e03da0f0dd77ad003', //CowAmm pool
          // },
          {
            name: 'BalancerV2GaugeV5',
            address: '0xbc02ef87f4e15ef78a571f3b2adcc726fee70d8b',
          },
          {
            name: 'BalancerV2BatchRelayerLibrary',
            address: '0xea66501df1a00261e3bb79d1e90444fc6a186b62',
          },
          { name: 'BalancerMinter', address: '0x239e55F427D44C3cc793f49bFB507ebe76638a2b' },
          {
            name: 'BalancerV2BalancerRelayerV6',
            address: '0x35Cea9e57A393ac66Aaa7E25C391D52C74B5648f',
          },
          {
            name: 'veBal',
            address: mainnetNetworkConfig.contracts.veBAL,
          },
          {
            name: 'feeDistributor',
            address: mainnetNetworkConfig.contracts.feeDistributor,
          },
          {
            name: 'veDelegationProxy',
            address: mainnetNetworkConfig.contracts.veDelegationProxy,
          },
        ],
      }),
    ],
  }
})
