'use client'

import { Heading, Stack, Skeleton, SimpleGrid, Center, Text } from '@chakra-ui/react'
import { usePortfolio } from '../../PortfolioProvider'
import { ClaimNetworkBlock } from './ClaimNetworkBlock'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { chainToSlugMap } from '../../../pool/pool.utils'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import { useState } from 'react'
import ClaimProtocolRevenueModal from '../ClaimProtocolRevenueModal'
import { useRouter } from 'next/navigation'
import FadeInOnView from '@/lib/shared/components/containers/FadeInOnView'
import { useHasMerklRewards } from '../../merkl/useHasMerklRewards'
import { MerklAlert } from '../../merkl/MerklAlert'
import { motion, easeOut } from 'framer-motion'

export function ClaimNetworkPools() {
  const {
    poolsByChainMap,
    protocolRewardsBalance,
    totalFiatClaimableBalanceByChain,
    poolsWithOnchainUserBalances,
    isLoadingRewards,
    isLoadingPortfolio,
  } = usePortfolio()

  const [isOpenedProtocolRevenueModal, setIsOpenedProtocolRevenueModal] = useState(false)
  const { isConnected } = useUserAccount()
  const router = useRouter()

  const hasProtocolRewards = protocolRewardsBalance && protocolRewardsBalance.isGreaterThan(0)

  const { hasMerklRewards } = useHasMerklRewards(poolsWithOnchainUserBalances)

  if (!isConnected) {
    return null
  }

  const poolsWithChain = Object.entries(poolsByChainMap)

  const hasChainRewards = poolsWithChain.length > 0

  const noRewards = !hasProtocolRewards && !hasChainRewards

  return (
    <FadeInOnView>
      <Stack gap={5}>
        <Heading size="lg">Claimable incentives</Heading>

        {isLoadingRewards || isLoadingPortfolio ? (
          <SimpleGrid columns={{ base: 1, md: 1, lg: 2, xl: 3 }} spacing="md">
            <Skeleton height="85px" w="full" />
            <Skeleton height="85px" w="full" />
            <Skeleton height="85px" w="full" />
          </SimpleGrid>
        ) : (
          <>
            {hasMerklRewards && <MerklAlert />}
            {noRewards && (
              <Center h="85px" border="1px dashed" borderColor="border.base" rounded="lg">
                <Text>No rewards to claim</Text>
              </Center>
            )}
            <SimpleGrid columns={{ base: 1, md: 1, lg: 2, xl: 3 }} spacing="md">
              {poolsWithChain.map(
                ([chain, pools], index) =>
                  pools[0] && (
                    <motion.div
                      key={chain}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.12, ease: easeOut }}
                      style={{ transformOrigin: 'top' }}
                    >
                      <ClaimNetworkBlock
                        chain={pools[0].chain}
                        networkTotalClaimableFiatBalance={totalFiatClaimableBalanceByChain[
                          pools[0].chain
                        ].toNumber()}
                        onClick={() => router.push(`/portfolio/${chainToSlugMap[pools[0].chain]}`)}
                      />
                    </motion.div>
                  )
              )}

              {hasProtocolRewards && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: poolsWithChain.length * 0.12, ease: easeOut }}
                  style={{ transformOrigin: 'top' }}
                >
                  <ClaimNetworkBlock
                    chain={GqlChain.Mainnet}
                    networkTotalClaimableFiatBalance={protocolRewardsBalance.toNumber()}
                    title="Balancer protocol revenue"
                    onClick={() => setIsOpenedProtocolRevenueModal(true)}
                  />
                </motion.div>
              )}
            </SimpleGrid>
            <ClaimProtocolRevenueModal
              isOpen={isOpenedProtocolRevenueModal}
              onClose={() => setIsOpenedProtocolRevenueModal(false)}
            />
          </>
        )}
      </Stack>
    </FadeInOnView>
  )
}
