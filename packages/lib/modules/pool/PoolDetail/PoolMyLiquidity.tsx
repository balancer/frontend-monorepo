'use client'

import TokenRow from '../../tokens/TokenRow/TokenRow'
import ButtonGroup, {
  ButtonGroupOption,
} from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import {
  Divider,
  Button,
  Card,
  Flex,
  HStack,
  Heading,
  Skeleton,
  Text,
  VStack,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react'
import { useMemo, useState, useLayoutEffect } from 'react'
import { usePool } from '../PoolProvider'
import { Address } from 'viem'
import { usePathname, useRouter } from 'next/navigation'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { keyBy } from 'lodash'
import {
  getAuraPoolLink,
  getProportionalExitAmountsFromScaledBptIn,
  getXavePoolLink,
} from '../pool.utils'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import {
  getUserTotalBalanceInt,
  getUserWalletBalanceInt,
  getUserTotalBalanceUsd,
  getUserWalletBalance,
  getUserWalletBalanceUsd,
  calcStakedBalanceInt,
  calcStakedBalanceUsd,
  shouldMigrateStake,
  calcGaugeStakedBalance,
} from '../user-balance.helpers'
import { isVebalPool, shouldBlockAddLiquidity, calcUserShareOfPool, isFx } from '../pool.helpers'
import { getCanStake, migrateStakeTooltipLabel } from '../actions/stake.helpers'
import { InfoOutlineIcon } from '@chakra-ui/icons'
import { GqlPoolStakingType } from '@repo/lib/shared/services/api/generated/graphql'
import { ArrowUpRight } from 'react-feather'
import { getChainId } from '@repo/lib/config/app.config'
import { VeBalLink } from '../../vebal/VebalRedirectModal'
import {
  PartnerRedirectModal,
  RedirectPartner,
} from '@repo/lib/shared/components/modals/PartnerRedirectModal'
import { getCompositionTokens } from '../pool-tokens.utils'

function getTabs(isVeBalPool: boolean) {
  return [
    {
      value: 'total',
      label: 'Total',
    },
    {
      value: 'unstaked',
      label: isVeBalPool ? 'Unlocked' : 'Unstaked',
    },
    {
      value: 'gauge',
      label: isVeBalPool ? 'Locked' : 'Staked',
    },
  ]
}

export default function PoolMyLiquidity() {
  const { pool, chain, isLoadingOnchainUserBalances, myLiquiditySectionRef } = usePool()
  const { toCurrency } = useCurrency()
  const { isConnected, isConnecting } = useUserAccount()
  const router = useRouter()
  const partnerRedirectDisclosure = useDisclosure()
  const [redirectPartner, setRedirectPartner] = useState<RedirectPartner>(RedirectPartner.Aura)
  const [redirectPartnerUrl, setRedirectPartnerUrl] = useState<string>()

  const isVeBal = isVebalPool(pool.id)
  const tabs = useMemo(() => {
    const tabsArr = getTabs(isVeBal)

    if (
      pool.staking?.aura &&
      !pool.staking.aura.isShutdown &&
      tabsArr.findIndex(tab => tab.value === 'aura') === -1
    ) {
      tabsArr.push({
        value: 'aura',
        label: 'Aura',
      })
    } else if (!pool.staking?.aura) {
      const index = tabsArr.findIndex(tab => tab.value === 'aura')
      if (index > -1) {
        tabsArr.splice(index, 1)
      }
    }

    return tabsArr
  }, [isVeBal, pool])

  const [activeTab, setActiveTab] = useState<ButtonGroupOption>(tabs[0])
  const pathname = usePathname()
  const [height, setHeight] = useState(0)

  const isAddLiquidityBlocked = shouldBlockAddLiquidity(pool)

  useLayoutEffect(() => {
    if (myLiquiditySectionRef && myLiquiditySectionRef.current) {
      setHeight(myLiquiditySectionRef.current.offsetHeight)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleTabChanged(option: ButtonGroupOption) {
    setActiveTab(option)
  }

  function getStakingType(tabsValue: string) {
    switch (tabsValue) {
      case 'gauge':
        if (isVeBal) return GqlPoolStakingType.Vebal
        return GqlPoolStakingType.Gauge
      case 'aura':
        return GqlPoolStakingType.Aura
      default:
        return GqlPoolStakingType.Gauge
    }
  }

  function getBptBalanceForTab() {
    const rawTotalBalance = getUserTotalBalanceInt(pool)

    switch (activeTab.value) {
      case 'total':
        return rawTotalBalance
      case 'gauge':
      case 'aura':
        return calcStakedBalanceInt(pool, getStakingType(activeTab.value))
      case 'unstaked':
        return getUserWalletBalanceInt(pool)
      default:
        return rawTotalBalance
    }
  }

  function calcUserPoolTokenBalances() {
    const poolTokens = pool.poolTokens.map(({ balance, decimals, address }) => ({
      balance,
      decimals,
      address,
    }))

    return keyBy(
      getProportionalExitAmountsFromScaledBptIn(
        getBptBalanceForTab(),
        poolTokens,
        pool.dynamicData.totalShares
      ),
      'address'
    )
  }

  function getTitlePrefix() {
    switch (activeTab.value) {
      case 'total':
        return 'My total balance'
      case 'gauge':
        return isVeBal ? 'Locked' : 'Staked on Balancer'
      case 'aura':
        return 'Staked on Aura'
      case 'unstaked':
        return isVeBal ? 'Unlocked' : 'My unstaked balance'
      default:
        return ''
    }
  }

  const stakedBalance = calcStakedBalanceUsd(pool, getStakingType(activeTab.value))
  const unstakedBalance = getUserWalletBalanceUsd(pool)

  const lockBtnText =
    bn(stakedBalance).gt(0) && bn(unstakedBalance).isEqualTo(0) ? 'Extend lock' : 'Lock'

  function getTotalBalanceUsd() {
    if (!isConnected || isConnecting) return 0

    switch (activeTab.value) {
      case 'total':
        return getUserTotalBalanceUsd(pool)
      case 'gauge':
      case 'aura':
        return stakedBalance
      case 'unstaked':
        return unstakedBalance
      default:
        return getUserTotalBalanceUsd(pool)
    }
  }

  const totalBalanceUsd = getTotalBalanceUsd() || 0
  const poolTokenBalancesForTab = calcUserPoolTokenBalances()

  function tokenBalanceFor(tokenAddress: string) {
    const poolTokenBalance = poolTokenBalancesForTab[tokenAddress]

    if (!isConnected || isConnecting || !poolTokenBalance) return '0'

    return poolTokenBalance.amount
  }

  const canStake = getCanStake(pool)
  const hasUnstakedBalance = bn(getUserWalletBalance(pool)).gt(0)
  const hasGaugeStakedBalance = bn(calcGaugeStakedBalance(pool)).gt(0)
  const shareOfPool = calcUserShareOfPool(pool)
  const shareofPoolLabel = bn(shareOfPool).gt(0) ? fNum('sharePercent', shareOfPool) : <>&mdash;</>
  const chainId = getChainId(chain)

  const options = useMemo(() => {
    return tabs.map(tab => ({
      ...tab,
      disabled: tab.value !== 'total' && !canStake,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs, pool])

  function openRedirectModal(partner: RedirectPartner) {
    setRedirectPartner(partner)
    let url
    if (partner === RedirectPartner.Aura && pool?.staking?.aura?.auraPoolId) {
      url = getAuraPoolLink(chainId, pool.staking.aura.auraPoolId)
    } else if (partner === RedirectPartner.Xave && pool?.address && pool.chain) {
      url = getXavePoolLink(pool.chain, pool.address)
    }
    setRedirectPartnerUrl(url)
    partnerRedirectDisclosure.onOpen()
  }

  function handleAddLiquidity() {
    if (isFx(pool.type)) {
      openRedirectModal(RedirectPartner.Xave)
    } else {
      router.push(`${pathname}/add-liquidity`)
    }
  }

  function handleRemoveLiquidity() {
    if (isFx(pool.type)) {
      openRedirectModal(RedirectPartner.Xave)
    } else {
      router.push(`${pathname}/remove-liquidity`)
    }
  }

  const compositionTokens = getCompositionTokens(pool)

  return (
    <Card h="fit-content" ref={myLiquiditySectionRef}>
      <VStack spacing="md" width="full">
        <Flex
          alignItems="start"
          direction={{ base: 'column', sm: 'row' }}
          gap="ms"
          justifyContent="space-between"
          width="full"
        >
          <Heading backgroundClip="text" bg="font.special" fontWeight="bold" size="h5">
            My liquidity
          </Heading>
          <ButtonGroup
            currentOption={activeTab}
            groupId="my-liquidity"
            onChange={handleTabChanged}
            options={options}
            size="xxs"
            width="max-content"
          />
        </Flex>
        <Divider />
        <VStack spacing="md" width="full">
          <HStack justifyContent="space-between" width="full">
            <VStack alignItems="flex-start">
              <Heading fontWeight="bold" size="h6">
                {getTitlePrefix()}
              </Heading>
              <Text fontSize="0.85rem" variant="secondary">
                Pool share
              </Text>
            </VStack>
            <VStack alignItems="flex-end">
              {isLoadingOnchainUserBalances || isConnecting ? (
                <Skeleton h="5" w="12" />
              ) : (
                <Heading fontWeight="bold" size="h6">
                  {toCurrency(totalBalanceUsd)}
                </Heading>
              )}
              <Text fontSize="0.85rem" variant="secondary">
                {shareofPoolLabel}
              </Text>
            </VStack>
          </HStack>
          <Divider />
          <VStack alignItems="flex-start" h={`${height - 270}px`} spacing="md" width="full">
            {activeTab.value === 'aura' && !totalBalanceUsd && pool.staking?.aura ? (
              <HStack bg="aura.purple" justify="space-between" mb="3xl" p="2" rounded="md" w="full">
                <Text color="white">Aura APR: {fNum('apr', pool.staking.aura.apr)}</Text>
                <Button
                  color="white"
                  onClick={() => openRedirectModal(RedirectPartner.Aura)}
                  variant="outline"
                >
                  <HStack>
                    <Text>Learn more</Text>
                    <ArrowUpRight size={16} />
                  </HStack>
                </Button>
              </HStack>
            ) : (
              compositionTokens.map(poolToken => {
                return (
                  <VStack key={`pool-${poolToken.address}`} w="full">
                    <TokenRow
                      abbreviated={false}
                      address={poolToken.address as Address}
                      chain={chain}
                      pool={pool}
                      value={tokenBalanceFor(poolToken.address)}
                      {...(poolToken.hasNestedPool && {
                        isNestedBpt: true,
                      })}
                    />
                    {poolToken.hasNestedPool && poolToken.nestedPool && (
                      <VStack pl="8" w="full">
                        {poolToken.nestedPool.tokens.map(nestedPoolToken => {
                          return (
                            <TokenRow
                              abbreviated={false}
                              address={nestedPoolToken.address as Address}
                              chain={chain}
                              iconSize={35}
                              isNestedPoolToken
                              key={`nested-pool-${nestedPoolToken.address}`}
                              value={bn(nestedPoolToken.balance).times(shareOfPool).toString()}
                            />
                          )
                        })}
                      </VStack>
                    )}
                  </VStack>
                )
              })
            )}
            <PartnerRedirectModal
              isOpen={partnerRedirectDisclosure.isOpen}
              onClose={partnerRedirectDisclosure.onClose}
              partner={redirectPartner}
              redirectUrl={redirectPartnerUrl}
            />
          </VStack>
          <Divider />
          <HStack justifyContent="flex-start" mt="md" width="full">
            <Button
              flex="1"
              isDisabled={isAddLiquidityBlocked}
              maxW="120px"
              onClick={() => handleAddLiquidity()}
              variant="primary"
            >
              Add
            </Button>
            <Button
              flex="1"
              isDisabled={!hasUnstakedBalance}
              maxW="120px"
              onClick={() => handleRemoveLiquidity()}
              variant={hasUnstakedBalance ? 'tertiary' : 'disabled'}
            >
              Remove
            </Button>
            <Text opacity="0.25" px={{ base: '0', sm: 'ms' }} variant="secondary">
              |
            </Text>
            {isVeBal ? (
              <VeBalLink
                flex="1"
                triggerEl={
                  <Button variant="secondary" w="100%">
                    {lockBtnText}
                  </Button>
                }
              />
            ) : (
              <>
                <Button
                  flex="1"
                  isDisabled={!(canStake && hasUnstakedBalance)}
                  maxW="120px"
                  onClick={() => router.push(`${pathname}/stake`)}
                  variant={canStake && hasUnstakedBalance ? 'secondary' : 'disabled'}
                >
                  Stake
                </Button>
                {shouldMigrateStake(pool) ? (
                  <Tooltip label={migrateStakeTooltipLabel}>
                    <Button
                      flex="1"
                      maxW="120px"
                      onClick={() => router.push(`${pathname}/migrate-stake`)}
                      rightIcon={<InfoOutlineIcon fontSize="sm" />}
                      variant="secondary"
                    >
                      Migrate stake
                    </Button>
                  </Tooltip>
                ) : (
                  <Button
                    flex="1"
                    isDisabled={!hasGaugeStakedBalance}
                    maxW="120px"
                    onClick={() => router.push(`${pathname}/unstake`)}
                    variant={hasGaugeStakedBalance ? 'tertiary' : 'disabled'}
                  >
                    Unstake
                  </Button>
                )}
              </>
            )}
          </HStack>
        </VStack>
      </VStack>
    </Card>
  )
}
