import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { sonicTestPublicClient } from '@repo/test/utils/wagmi/wagmi-test-clients'
import { setErc20Balance } from '@repo/lib/test/anvil/useSetErc20Balance'
import { TokenBalance } from '@repo/lib/test/utils/wagmi/fork-options'
import { sonic } from 'viem/chains'
import { Address } from 'viem'

/*
  Fixtures for the Sonic (Beets) anvil fork used by the integration suite.

  The fork block in packages/test/anvil/anvil-setup.ts must be recent enough to
  contain both Sonic pools in pool-examples (usdcFlyStS, anSSiloWSBoosted) and
  their tokens.
*/
export const sonicTokens = {
  s: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  ws: '0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38',
  usdc: '0x29219dd400f2bf60e5a23d13be72b486d4038894',
  fly: '0x6c9b3a74ae4779da5ca999371ee8950e8db3407f',
  sts: '0xe5da20f15420ad15de0fa650600afc998bbe3955',
  siloWs: '0x016c306e103fbf48ec24810d078c65ad13c5f11b',
  anS: '0x0c4e186eae8acaa7f7de1315d5ad174be39ec987',
} as const satisfies Record<string, Address>

/* stS stores balances in a mapping that is not at slot 0 (see sonicTokenBalances in fork-default-balances) */
const STS_BALANCE_SLOT = BigInt(
  '0x52c63247e1f47db19d5ce0460030c497f067ca4cebf71ba98eeadabe20bace00'
)

export const sonicContracts = getNetworkConfig(GqlChainValues.Sonic).contracts.balancer

type SeedParams = {
  account?: Address
  /* Token balances to forge, in addition to the defaults */
  tokenBalances?: TokenBalance[]
  /* Native asset amount, in human readable units */
  nativeAmount?: string
}

/*
  Forges balances for the given account on the Sonic fork.

  Balances are set with anvil_setStorageAt (slot probing, same approach as
  setErc20Balance) so no real transfer is needed and the account does not have
  to exist on the fork.
*/
export async function seedSonicTestAccount({
  account = defaultTestUserAccount,
  tokenBalances = defaultSonicTokenBalances,
  nativeAmount = '10',
}: SeedParams = {}) {
  await sonicTestPublicClient.setBalance({
    address: account,
    value: BigInt(Math.round(Number(nativeAmount) * 1e18)),
  })

  for (const balance of tokenBalances) {
    await setErc20Balance({ client: sonicTestPublicClient, address: account, balance })
  }
}

export const defaultSonicTokenBalances: TokenBalance[] = [
  { tokenAddress: sonicTokens.ws, value: '1000' },
  { tokenAddress: sonicTokens.usdc, value: '1000', decimals: 6 },
  { tokenAddress: sonicTokens.fly, value: '1000' },
  { tokenAddress: sonicTokens.sts, value: '1000', slot: STS_BALANCE_SLOT },
  { tokenAddress: sonicTokens.siloWs, value: '1000' },
  { tokenAddress: sonicTokens.anS, value: '1000' },
]

export const SONIC_CHAIN_ID = sonic.id
