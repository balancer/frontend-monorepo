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
import ClaimHiddenHandRewardsModal from '../ClaimHiddenHandRewardsModal'
import { useRouter } from 'next/navigation'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { useHasMerklRewards } from '../../merkl/useHasMerklRewards'
import { MerklAlert } from '../../merkl/MerklAlert'
import { motion, easeOut } from 'framer-motion'
import { isBeets, PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { getChainId } from '@repo/lib/config/app.config'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { WalletIcon } from '@repo/lib/shared/components/icons/WalletIcon'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { isAfter } from 'date-fns'
import { LabelWithTooltip } from '@repo/lib/shared/components/tooltips/LabelWithTooltip'
import { ReactNode } from 'react'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'

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
    hiddenHandRewardsData,
  } = usePortfolio()

  const [isOpenedProtocolRevenueModal, setIsOpenedProtocolRevenueModal] = useState(false)
  const [isOpenedHiddenHandRewardsModal, setIsOpenedHiddenHandRewardsModal] = useState(false)
  const { isConnected } = useUserAccount()
  const router = useRouter()

  const hasProtocolRewards = protocolRewardsBalance && protocolRewardsBalance.isGreaterThan(0)
  const hasHiddenHandRewards = hiddenHandRewardsData && hiddenHandRewardsData.totalValueUsd > 0

  const chainIds = PROJECT_CONFIG.merklRewardsChains.map(chain => getChainId(chain))
  const { hasMerklRewards } = useHasMerklRewards(poolsWithOnchainUserBalances, chainIds)

  const { isDesktop } = useBreakpoints()
  const iconSize = isDesktop ? 12 : 8

  const currentNetworks = isBeets ? beetsNetworksConfig : balancerNetworksConfig

  const poolsWithChain = Object.entries(poolsByChainMap).sort(
    (a, b) =>
      (totalFiatClaimableBalanceByChain[b[0]]?.toNumber() || 0) -
      (totalFiatClaimableBalanceByChain[a[0]]?.toNumber() || 0)
  )

  const hasChainRewards = poolsWithChain.length > 0
  const noRewards = !hasProtocolRewards && !hasChainRewards

  // hidden hand claims expire after 30 June 2026
  const julyFirstMidnightUTC = new Date(Date.UTC(2026, 6, 1, 0, 0, 0))
  const isPastJulyFirst = isAfter(new Date(), julyFirstMidnightUTC)

  return (
    <FadeInOnView>
      <Stack gap={5}>
        {!isPastJulyFirst && (
          <BalAlert
            content="Your Hidden Hand rewards are expiring soon. Hidden Hand has been shutdown. Claim your incentives before they permanently expire after June 30, 2026 (23:59 UTC)."
            status="warning"
          />
        )}
        <Heading size="h4" variant="special">
          Claimable incentives
        </Heading>
        {isLoadingRewards || isLoadingPortfolio ? (
          <SimpleGrid columns={{ base: 1, md: 1, lg: 2, xl: isBeets ? 2 : 3 }} spacing="md">
            <Skeleton height="85px" w="full" />
            <Skeleton height="85px" w="full" />
            {!isBeets && <Skeleton height="85px" w="full" />}
          </SimpleGrid>
        ) : !isConnected ? (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <SimpleGrid
                columns={{
                  base: 1,
                  md: 2,
                  lg: isBeets ? 2 : 3,
                }}
                spacing="md"
              >
                {currentNetworks.map(network => (
                  <Card
                    flex="1"
                    key={network.name}
                    p={['sm', 'md']}
                    shadow="innerLg"
                    variant="level1"
                    w="full"
                    {...network.displayProps}
                  >
                    <Flex alignItems="center" justifyContent="space-between">
                      <HStack gap="ms">
                        <NetworkIcon chain={network.chain} shadow="md" size={iconSize} />
                        <Stack gap={1}>
                          <Heading size="sm" textTransform="capitalize">
                            {network.name}
                          </Heading>
                          <Heading color="font.secondary" size="md">
                            –
                          </Heading>
                        </Stack>
                      </HStack>
                      <Button gap="xs" onClick={openConnectModal} variant="tertiary">
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
                  lg: isBeets ? 2 : 3,
                }}
                spacing="md"
              >
                {currentNetworks.map(network => (
                  <Card
                    flex="1"
                    key={network.name}
                    p={['sm', 'md']}
                    shadow="innerLg"
                    variant="level1"
                    w="full"
                    {...network.displayProps}
                  >
                    <Flex alignItems="center" justifyContent="space-between">
                      <HStack gap="ms">
                        <NetworkIcon chain={network.chain} shadow="md" size={iconSize} />
                        <Stack gap={1}>
                          <Heading size="sm" textTransform="capitalize">
                            {network.name}
                          </Heading>
                        </Stack>
                      </HStack>
                      <Text fontSize="sm" variant="secondary">
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
                md: 2,
                lg: isBeets ? 2 : 3,
              }}
              spacing="md"
            >
              {(() => {
                // Collect all claimable items
                const claimableItems = []

                poolsWithChain.forEach(([, pools], index) => {
                  if (pools[0] && totalFiatClaimableBalanceByChain[pools[0].chain].toNumber() > 0) {
                    claimableItems.push({
                      type: 'chain',
                      chain: pools[0].chain,
                      amount: totalFiatClaimableBalanceByChain[pools[0].chain].toNumber(),
                      index,
                    })
                  }
                })

                if (hasProtocolRewards) {
                  claimableItems.push({
                    type: 'protocol',
                    chain: GqlChain.Mainnet,
                    amount: protocolRewardsBalance.toNumber(),
                    index: poolsWithChain.length,
                  })
                }

                if (hasHiddenHandRewards && !isPastJulyFirst) {
                  claimableItems.push({
                    type: 'hidden-hand',
                    chain: PROJECT_CONFIG.defaultNetwork,
                    amount: hiddenHandRewardsData.totalValueUsd,
                    index: poolsWithChain.length + 1,
                  })
                }

                // Sort by amount (highest first)
                claimableItems.sort((a, b) => b.amount - a.amount)

                // If no claimable items, don't render anything
                if (claimableItems.length === 0) {
                  return null
                }

                // Determine max columns for first row based on breakpoint
                const maxColumns = isBeets ? 2 : 3

                // Render all claimable items
                const items = claimableItems.map((item, index) => {
                  const handleClick = () => {
                    switch (item.type) {
                      case 'protocol':
                        setIsOpenedProtocolRevenueModal(true)
                        break
                      case 'hidden-hand':
                        setIsOpenedHiddenHandRewardsModal(true)
                        break
                      default:
                        router.push(`/portfolio/${chainToSlugMap[item.chain]}`)
                    }
                  }

                  const getTitle = (): ReactNode => {
                    switch (item.type) {
                      case 'protocol':
                        return 'Balancer protocol revenue'
                      case 'hidden-hand':
                        return (
                          <LabelWithTooltip
                            bgClip="text"
                            bgColor="rgb(229, 211, 190)"
                            color="transparent"
                            fontSize="16px"
                            fontWeight="700"
                            label="Hidden Hand rewards"
                            mb={0}
                            mt={0}
                            placement="top"
                            textTransform="capitalize"
                            tooltip="Available until June 30, 2026"
                          />
                        )
                      default:
                        return undefined
                    }
                  }

                  return (
                    <motion.div
                      animate={{ opacity: 1, scale: 1 }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      key={`item-${index}`}
                      style={{ transformOrigin: 'top' }}
                      transition={{ duration: 0.3, delay: index * 0.08, ease: easeOut }}
                    >
                      <ClaimNetworkBlock
                        chain={item.chain}
                        networkTotalClaimableFiatBalance={item.amount}
                        onClick={handleClick}
                        title={getTitle()}
                      />
                    </motion.div>
                  )
                })

                // Add placeholders only if we have fewer items than max columns
                if (claimableItems.length < maxColumns) {
                  const placeholdersNeeded = maxColumns - claimableItems.length

                  for (let i = 0; i < placeholdersNeeded; i++) {
                    const slotIndex = claimableItems.length + i

                    // For !isBeets: slot 0-1 show on md+, slot 2 shows only on lg+
                    // For isBeets: slots 0-1 show on md+
                    const displayProps =
                      !isBeets && slotIndex === 2
                        ? { base: 'none', md: 'none', lg: 'block' }
                        : { base: 'none', md: 'block' }

                    items.push(
                      <Card
                        display={displayProps}
                        flex="1"
                        key={`placeholder-${i}`}
                        p={['sm', 'md']}
                        shadow="innerLg"
                        variant="level1"
                        w="full"
                      />
                    )
                  }
                }

                return items
              })()}
            </SimpleGrid>
            <ClaimProtocolRevenueModal
              isOpen={isOpenedProtocolRevenueModal}
              onClose={() => setIsOpenedProtocolRevenueModal(false)}
            />
            <ClaimHiddenHandRewardsModal
              isOpen={isOpenedHiddenHandRewardsModal}
              onClose={() => setIsOpenedHiddenHandRewardsModal(false)}
            />
          </>
        )}
      </Stack>
    </FadeInOnView>
  )
}
