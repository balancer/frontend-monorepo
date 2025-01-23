'use client'

import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { lzBeetsAddress, LzBeetsMigrateModal, sonicChainId } from './LzBeetsMigrateModal'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useBalance } from 'wagmi'
import { bn } from '@repo/lib/shared/utils/numbers'

export function LzBeetsMigrate() {
  const { userAddress } = useUserAccount()
  const { data: balanceData } = useBalance({
    chainId: sonicChainId,
    address: userAddress,
    token: lzBeetsAddress,
  })

  const hasBalance = bn(balanceData?.value || 0n).gt(0)

  // only need balance for this token
  const lzBeetsToken = {
    address: '0x1e5fe95fb90ac0530f581c617272cd0864626795',
    name: 'Fantom lzBEETS',
    symbol: 'lzBEETS',
    decimals: 18,
    chain: GqlChain.Sonic,
    chainId: 146,
    logoURI:
      'https://assets.coingecko.com/coins/images/19158/standard/beets-icon-large.png?1696518608',
    priority: 0,
    tradable: true,
    isErc4626: false,
    isBufferAllowed: true,
    coingeckoId: null,
  }

  return hasBalance ? (
    <TokenBalancesProvider initTokens={[lzBeetsToken]}>
      <LzBeetsMigrateModal />
    </TokenBalancesProvider>
  ) : null
}
