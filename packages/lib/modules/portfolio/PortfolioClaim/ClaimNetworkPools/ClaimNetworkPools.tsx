'use client'

import {
  Heading,
  Stack,
  Skeleton,
  SimpleGrid,
  Text,
  Card,
  Flex,
  HStack,
  Button,
} from '@chakra-ui/react'
import { usePortfolio } from '../../PortfolioProvider'
import { ClaimNetworkBlock } from './ClaimNetworkBlock'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { chainToSlugMap } from '../../../pool/pool.utils'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useState } from 'react'
import ClaimProtocolRevenueModal from '../ClaimProtocolRevenueModal'
import { useRouter } from 'next/navigation'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { useHasMerklRewards } from '../../merkl/useHasMerklRewards'
import { MerklAlert } from '../../merkl/MerklAlert'
import { motion, easeOut } from 'framer-motion'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { ProjectConfigBeets } from '@repo/lib/config/projects/beets'
import { getChainId } from '@repo/lib/config/app.config'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { WalletIcon } from '@repo/lib/shared/components/icons/WalletIcon'
import { ConnectButton } from '@rainbow-me/rainbowkit'

interface NetworkConfig {
  chain: GqlChain
  name: string
  displayProps?: Record<string, any>
}

const balancerNetworksConfig: NetworkConfig[] = [
  { chain: GqlChain.Mainnet, name: 'Ethereum', displayProps: {} },
  {
    chain: GqlChain.Arbitrum,
    name: 'Arbitrum',
    displayProps: { display: { base: 'none', md: 'block' } },
  },
  {
    chain: GqlChain.Base,
    name: 'Base',
    displayProps: { display: { base: 'none', md: 'none', lg: 'block' } },
  },
]

const beetsNetworksConfig: NetworkConfig[] = [
  { chain: GqlChain.Sonic, name: 'Sonic', displayProps: {} },
  {
    chain: GqlChain.Optimism,
    name: 'Optimism',
    displayProps: { display: { base: 'none', md: 'block' } },
  },
]

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

  const chainIds = PROJECT_CONFIG.merklRewardsChains.map(chain => getChainId(chain))
  const { hasMerklRewards } = useHasMerklRewards(poolsWithOnchainUserBalances, chainIds)

  const { isDesktop } = useBreakpoints()
  const iconSize = isDesktop ? 12 : 8

  const currentNetworks =
    PROJECT_CONFIG.projectId === ProjectConfigBeets.projectId
      ? beetsNetworksConfig
      : balancerNetworksConfig

  const poolsWithChain = Object.entries(poolsByChainMap).sort(
    (a, b) =>
      (totalFiatClaimableBalanceByChain[b[0]]?.toNumber() || 0) -
      (totalFiatClaimableBalanceByChain[a[0]]?.toNumber() || 0)
  )

  const hasChainRewards = poolsWithChain.length > 0

  const noRewards = !hasProtocolRewards && !hasChainRewards

  return (
    <FadeInOnView>
      <Stack gap={5}>
        <Heading size="h4" variant="special">
          Claimable incentives
        </Heading>

        {isLoadingRewards || isLoadingPortfolio ? (
          <SimpleGrid columns={{ base: 1, md: 1, lg: 2, xl: 3 }} spacing="md">
            <Skeleton height="85px" w="full" />
            <Skeleton height="85px" w="full" />
            <Skeleton height="85px" w="full" />
          </SimpleGrid>
        ) : !isConnected ? (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <SimpleGrid
                columns={{
                  base: 1,
                  md: 2,
                  lg: PROJECT_CONFIG.projectId === ProjectConfigBeets.projectId ? 2 : 3,
                }}
                spacing="md"
              >
                {currentNetworks.map(network => (
                  <Card
                    key={network.name}
                    flex="1"
                    p={['sm', 'md']}
                    shadow="innerLg"
                    variant="level1"
                    w="full"
                    {...network.displayProps}
                  >
                    <Flex alignItems="center" justifyContent="space-between">
                      <HStack gap="ms">
                        <NetworkIcon chain={network.chain} size={iconSize} shadow="md" />
                        <Stack gap={1}>
                          <Heading size="sm" textTransform="capitalize">
                            {network.name}
                          </Heading>
                          <Heading size="md" color="font.secondary">
                            –
                          </Heading>
                        </Stack>
                      </HStack>
                      <Button variant="tertiary" gap="xs" onClick={openConnectModal}>
                        <WalletIcon size={20} strokeWidth={2} />
                        Connect
                      </Button>
                    </Flex>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </ConnectButton.Custom>
        ) : (
          <>
            {hasMerklRewards && <MerklAlert />}
            {noRewards && (
              <SimpleGrid
                columns={{
                  base: 1,
                  md: 2,
                  lg: PROJECT_CONFIG.projectId === ProjectConfigBeets.projectId ? 2 : 3,
                }}
                spacing="md"
              >
                {currentNetworks.map(network => (
                  <Card
                    key={network.name}
                    flex="1"
                    p={['sm', 'md']}
                    shadow="innerLg"
                    variant="level1"
                    w="full"
                    {...network.displayProps}
                  >
                    <Flex alignItems="center" justifyContent="space-between">
                      <HStack gap="ms">
                        <NetworkIcon chain={network.chain} size={iconSize} shadow="md" />
                        <Stack gap={1}>
                          <Heading size="sm" textTransform="capitalize">
                            {network.name}
                          </Heading>
                        </Stack>
                      </HStack>
                      <Text variant="secondary" fontSize="sm">
                        Nothing to claim
                      </Text>
                    </Flex>
                  </Card>
                ))}
              </SimpleGrid>
            )}
            <SimpleGrid
              columns={{
                base: 1,
                md: 1,
                lg: PROJECT_CONFIG.projectId === ProjectConfigBeets.projectId ? 2 : 3,
              }}
              spacing="md"
            >
              {poolsWithChain.map(
                ([chain, pools], index) =>
                  pools[0] && (
                    <motion.div
                      animate={{ opacity: 1, scale: 1 }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      key={chain}
                      style={{ transformOrigin: 'top' }}
                      transition={{ duration: 0.3, delay: index * 0.08, ease: easeOut }}
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
                  animate={{ opacity: 1, scale: 1 }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  style={{ transformOrigin: 'top' }}
                  transition={{ duration: 0.3, delay: poolsWithChain.length * 0.08, ease: easeOut }}
                >
                  <ClaimNetworkBlock
                    chain={GqlChain.Mainnet}
                    networkTotalClaimableFiatBalance={protocolRewardsBalance.toNumber()}
                    onClick={() => setIsOpenedProtocolRevenueModal(true)}
                    title="Balancer protocol revenue"
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
