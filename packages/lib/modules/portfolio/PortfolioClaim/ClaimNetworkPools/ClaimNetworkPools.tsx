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
  useDisclosure,
  Link,
  Box,
} from '@chakra-ui/react'
import { usePortfolio } from '../../PortfolioProvider'
import { ClaimNetworkBlock } from './ClaimNetworkBlock'
import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { GqlChainValues } from '@repo/lib/shared/services/api/generated/graphql-enums'
import { chainToSlugMap } from '../../../pool/pool.utils'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useMemo, useState, type ReactNode } from 'react'
import ClaimProtocolRevenueModal from '../ClaimProtocolRevenueModal'
import ClaimHiddenHandRewardsModal from '../ClaimHiddenHandRewardsModal'
import { useRouter } from 'next/navigation'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { useHasMerklRewards } from '../../merkl/useHasMerklRewards'
import { MerklAlert } from '../../merkl/MerklAlert'
import { motion } from 'motion/react'
import { easeOut } from 'motion'
import { isBalancer, isBeets, PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { getChainId, getChainName } from '@repo/lib/config/app.config'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { WalletIcon } from '@repo/lib/shared/components/icons/WalletIcon'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { isAfter } from 'date-fns'
import { LabelWithTooltip } from '@repo/lib/shared/components/tooltips/LabelWithTooltip'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { sumRecoveredFundsTotal, useRecoveredFunds } from '../recovered-funds/useRecoveredFunds'
import { ClaimRecoveredFundsModal } from '../recovered-funds/ClaimRecoveredFundsModal'
import { BalAlertLink } from '@repo/lib/shared/components/alerts/BalAlertLink'
import { RecoveredFundsLearnMoreModal } from '../recovered-funds/RecoveredFundsLearnMoreModal'
import { isChainDeprecated } from '@repo/lib/modules/chains/chain.utils'

interface NetworkConfig {
  chain: GqlChain
  name: string
  displayProps?: Record<string, any>
}

const balancerNetworksConfig: NetworkConfig[] = [
  { chain: GqlChainValues.Mainnet, name: 'Ethereum', displayProps: {} },
  {
    chain: GqlChainValues.Arbitrum,
    name: 'Arbitrum',
    displayProps: { display: { base: 'none', md: 'block' } },
  },
  {
    chain: GqlChainValues.Base,
    name: 'Base',
    displayProps: { display: { base: 'none', md: 'none', lg: 'block' } },
  },
]

const beetsNetworksConfig: NetworkConfig[] = [
  { chain: GqlChainValues.Sonic, name: 'Sonic', displayProps: {} },
]

const SLOT_COUNT = 3
const GRID_COLUMNS = { base: 1, md: 2, lg: 3 }

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

  const { hasRecoveredFunds, claims: recoveredFundsClaims } = useRecoveredFunds()

  const [isOpenedProtocolRevenueModal, setIsOpenedProtocolRevenueModal] = useState(false)
  const [isOpenedHiddenHandRewardsModal, setIsOpenedHiddenHandRewardsModal] = useState(false)

  const {
    isOpen: isClaimRecoveredFundModalOpen,
    onOpen: openClaimRecoveredFundModal,
    onClose: onClaimRecoveredFundModalClose,
  } = useDisclosure()

  const {
    isOpen: isRecoveredFundsLearnMoreModalOpen,
    onOpen: openRecoveredFundsLearnMoreModal,
    onClose: onRecoveredFundsLearnMoreModalClose,
  } = useDisclosure()

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
    ([a], [b]) =>
      (totalFiatClaimableBalanceByChain[b]?.toNumber() || 0) -
      (totalFiatClaimableBalanceByChain[a]?.toNumber() || 0)
  )

  const hasChainRewards = Object.values(totalFiatClaimableBalanceByChain).some(
    balance => balance.toNumber() > 0
  )
  const noRewards = !hasProtocolRewards && !hasChainRewards

  // hidden hand claims expire after 30 June 2026
  const julyFirstMidnightUTC = new Date(Date.UTC(2026, 6, 1, 0, 0, 0))
  const isPastJulyFirst = isAfter(new Date(), julyFirstMidnightUTC)

  const deprecatedChains = poolsWithChain
    .map(item => item[0])
    .filter(chain => isChainDeprecated(chain as GqlChain)) as GqlChain[]

  // Build claimable items
  const claimableItems = useMemo(() => {
    const items = []

    poolsWithChain.forEach(([, pools]) => {
      if (pools[0] && totalFiatClaimableBalanceByChain[pools[0].chain].toNumber() > 0) {
        items.push({
          type: 'chain',
          chain: pools[0].chain,
          amount: totalFiatClaimableBalanceByChain[pools[0].chain].toNumber(),
        })
      }
    })

    if (hasProtocolRewards) {
      items.push({
        type: 'protocol',
        chain: GqlChainValues.Mainnet,
        amount: protocolRewardsBalance.toNumber(),
      })
    }

    if (hasHiddenHandRewards && !isPastJulyFirst) {
      items.push({
        type: 'hidden-hand',
        chain: PROJECT_CONFIG.defaultNetwork,
        amount: hiddenHandRewardsData.totalValueUsd,
      })
    }

    if (isBalancer && hasRecoveredFunds) {
      items.push({
        type: 'recovered-funds',
        chain: PROJECT_CONFIG.defaultNetwork,
        amount: sumRecoveredFundsTotal(recoveredFundsClaims),
        icon: '/images/icons/heart.svg',
      })
    }

    // Sort by amount (highest first)
    return items.sort((a, b) => b.amount - a.amount)
  }, [
    poolsWithChain,
    totalFiatClaimableBalanceByChain,
    hasProtocolRewards,
    protocolRewardsBalance,
    hasHiddenHandRewards,
    isPastJulyFirst,
    hiddenHandRewardsData,
    hasRecoveredFunds,
    recoveredFundsClaims,
  ])

  return (
    <FadeInOnView>
      <Stack gap={5}>
        <Heading size="h4" variant="special">
          Claimable incentives
        </Heading>
        {hasHiddenHandRewards && !isPastJulyFirst && (
          <AnimatedAlert>
            <BalAlert
              content="Your Hidden Hand rewards are expiring soon. Hidden Hand has been shutdown. Claim your incentives before they permanently expire after June 30, 2026 (23:59 UTC)."
              status="warning"
            />
          </AnimatedAlert>
        )}
        {isBalancer && hasRecoveredFunds && (
          <AnimatedAlert>
            <BalAlert
              content={
                <Text color="font.dark" fontWeight="medium">
                  Claim your share of recovered funds from the November 2025 security incident
                  affecting some v2 Composable Stable pools.{' '}
                  <BalAlertLink onClick={openRecoveredFundsLearnMoreModal}>Learn more</BalAlertLink>
                </Text>
              }
              status="warning"
            />
          </AnimatedAlert>
        )}
        {deprecatedChains.length > 0 && (
          <AnimatedAlert>
            <DeprecatedChainsAlert chains={deprecatedChains} />
          </AnimatedAlert>
        )}
        {isLoadingRewards || isLoadingPortfolio ? (
          <SimpleGrid columns={GRID_COLUMNS} spacing="md">
            {Array.from({ length: SLOT_COUNT }).map((_, index) => (
              <Skeleton height="85px" key={`claim-network-skeleton-${index}`} w="full" />
            ))}
          </SimpleGrid>
        ) : !isConnected ? (
          <ConnectButton.Custom>
            {({ openConnectModal }: { openConnectModal: () => void }) => (
              <SimpleGrid columns={GRID_COLUMNS} spacing="md">
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
            {hasMerklRewards && (
              <AnimatedAlert>
                <MerklAlert />
              </AnimatedAlert>
            )}
            {noRewards && (
              <SimpleGrid columns={GRID_COLUMNS} spacing="md">
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
            {claimableItems.length > 0 && (
              <SimpleGrid columns={GRID_COLUMNS} spacing="md">
                {claimableItems.map((item, index) => {
                  const handleClick = () => {
                    switch (item.type) {
                      case 'protocol':
                        setIsOpenedProtocolRevenueModal(true)
                        break
                      case 'hidden-hand':
                        setIsOpenedHiddenHandRewardsModal(true)
                        break
                      case 'recovered-funds':
                        openClaimRecoveredFundModal()
                        break
                      default:
                        router.push(`/portfolio/${chainToSlugMap[item.chain]}`)
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
                        icon={item.icon}
                        networkTotalClaimableFiatBalance={item.amount}
                        onClick={handleClick}
                        title={getCardTitle(item.type)}
                      />
                    </motion.div>
                  )
                })}
                {claimableItems.length < SLOT_COUNT &&
                  Array.from({ length: SLOT_COUNT - claimableItems.length }).map((_, i) => {
                    const slotIndex = claimableItems.length + i

                    const displayProps =
                      slotIndex === 2
                        ? { base: 'none', md: 'none', lg: 'block' }
                        : { base: 'none', md: 'block' }

                    return <Box aria-hidden display={displayProps} key={`placeholder-${i}`} />
                  })}
              </SimpleGrid>
            )}
          </>
        )}
      </Stack>
      <ClaimProtocolRevenueModal
        isOpen={isOpenedProtocolRevenueModal}
        onClose={() => setIsOpenedProtocolRevenueModal(false)}
      />
      <ClaimHiddenHandRewardsModal
        isOpen={isOpenedHiddenHandRewardsModal}
        onClose={() => setIsOpenedHiddenHandRewardsModal(false)}
      />
      <ClaimRecoveredFundsModal
        isOpen={isClaimRecoveredFundModalOpen}
        onClose={onClaimRecoveredFundModalClose}
      />
      <RecoveredFundsLearnMoreModal
        isOpen={isRecoveredFundsLearnMoreModalOpen}
        onClose={onRecoveredFundsLearnMoreModalClose}
      />
    </FadeInOnView>
  )
}

function AnimatedAlert({ children }: { children: ReactNode }) {
  return (
    <motion.div animate={{ opacity: 1, height: 'auto' }} initial={{ opacity: 0, height: 0 }} layout>
      {children}
    </motion.div>
  )
}

function getCardTitle(itemType: string) {
  switch (itemType) {
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
    case 'recovered-funds':
      return 'v2 incident recovered funds'
    default:
      return undefined
  }
}

function DeprecatedChainsAlert({ chains }: { chains: GqlChain[] }) {
  const listFormatter = new Intl.ListFormat('en-GB', {
    style: 'long',
    type: 'conjunction',
  })
  const chainNames = listFormatter.format(chains.map(getChainName))
  const title = `${chainNames} ${chains.length > 1 ? 'are' : 'is'} being sunset on Balancer soon.`
  const content = `Claim your incentives asap before ${chains.length > 1 ? 'they are' : 'it is'} no longer supported.`
  const learnMoreLink =
    'https://forum.balancer.fi/t/bip-906-deprecation-of-polygon-zkevm-fraxtal-and-mode/6951'

  return (
    <BalAlert
      content={
        <HStack>
          <Text color="#000" fontWeight="bold">
            {title}
          </Text>
          <Text color="#000">{content}</Text>
          <Link
            _hover={{
              color: '#555',
            }}
            color="#000"
            fontWeight="bold"
            href={learnMoreLink}
            isExternal
            textDecoration="underline"
          >
            Learn more
          </Link>
        </HStack>
      }
      status="warning"
    />
  )
}
