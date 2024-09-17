'use client'

import TokenRow from '../../tokens/TokenRow/TokenRow'
import ButtonGroup, {
  ButtonGroupOption,
} from '@/lib/shared/components/btns/button-group/ButtonGroup'
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
import React, { useMemo, useState, useLayoutEffect } from 'react'
import { usePool } from '../PoolProvider'
import { Address } from 'viem'
import { usePathname, useRouter } from 'next/navigation'
import { useCurrency } from '@/lib/shared/hooks/useCurrency'
import { keyBy } from 'lodash'
import {
  getAuraPoolLink,
  getProportionalExitAmountsFromScaledBptIn,
  getXavePoolLink,
} from '../pool.utils'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { bn, fNum } from '@/lib/shared/utils/numbers'
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
import { GqlPoolStakingType } from '@/lib/shared/services/api/generated/graphql'
import { ArrowUpRight } from 'react-feather'
import { getChainId } from '@/lib/config/app.config'
import { VeBalLink } from '../../vebal/VebalRedirectModal'
import {
  PartnerRedirectModal,
  RedirectPartner,
} from '@/lib/shared/components/modals/PartnerRedirectModal'

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

  return (
    <Card ref={myLiquiditySectionRef} h="fit-content">
      <VStack spacing="md" width="full">
        <Flex
          width="full"
          justifyContent="space-between"
          direction={{ base: 'column', sm: 'row' }}
          gap="ms"
          alignItems="start"
        >
          <Heading bg="font.special" backgroundClip="text" fontWeight="bold" size="h5">
            My liquidity
          </Heading>
          <ButtonGroup
            size="xxs"
            currentOption={activeTab}
            options={options}
            onChange={handleTabChanged}
            groupId="my-liquidity"
            width="max-content"
          />
        </Flex>
        <Divider />
        <VStack spacing="md" width="full">
          <HStack width="full" justifyContent="space-between">
            <VStack alignItems="flex-start">
              <Heading fontWeight="bold" size="h6">
                {getTitlePrefix()}
              </Heading>
              <Text variant="secondary" fontSize="0.85rem">
                Pool share
              </Text>
            </VStack>
            <VStack alignItems="flex-end">
              {isLoadingOnchainUserBalances || isConnecting ? (
                <Skeleton w="12" h="5" />
              ) : (
                <Heading fontWeight="bold" size="h6">
                  {toCurrency(totalBalanceUsd)}
                </Heading>
              )}
              <Text variant="secondary" fontSize="0.85rem">
                {shareofPoolLabel}
              </Text>
            </VStack>
          </HStack>
          <Divider />
          <VStack spacing="md" width="full" alignItems="flex-start" h={`${height - 270}px}`}>
            {activeTab.value === 'aura' && !totalBalanceUsd && pool.staking?.aura ? (
              <HStack w="full" bg="aura.purple" p="2" rounded="md" mb="3xl" justify="space-between">
                <Text color="white">Aura APR: {fNum('apr', pool.staking.aura.apr)}</Text>
                <Button
                  color="white"
                  variant="outline"
                  onClick={() => openRedirectModal(RedirectPartner.Aura)}
                >
                  <HStack>
                    <Text>Learn more</Text>
                    <ArrowUpRight size={16} />
                  </HStack>
                </Button>
              </HStack>
            ) : (
              pool.displayTokens.map(token => {
                return (
                  <TokenRow
                    chain={chain}
                    key={`my-liquidity-token-${token.address}`}
                    address={token.address as Address}
                    value={tokenBalanceFor(token.address)}
                    isLoading={isLoadingOnchainUserBalances || isConnecting}
                    abbreviated={false}
                  />
                )
              })
            )}
            <PartnerRedirectModal
              partner={redirectPartner}
              redirectUrl={redirectPartnerUrl}
              isOpen={partnerRedirectDisclosure.isOpen}
              onClose={partnerRedirectDisclosure.onClose}
            />
          </VStack>
          <Divider />
          <HStack mt="md" width="full" justifyContent="flex-start">
            <Button
              onClick={() => handleAddLiquidity()}
              variant="primary"
              flex="1"
              isDisabled={isAddLiquidityBlocked}
              maxW="120px"
            >
              Add
            </Button>
            <Button
              onClick={() => handleRemoveLiquidity()}
              variant={hasUnstakedBalance ? 'tertiary' : 'disabled'}
              isDisabled={!hasUnstakedBalance}
              flex="1"
              maxW="120px"
            >
              Remove
            </Button>
            <Text variant="secondary" opacity="0.25" px={{ base: '0', sm: 'ms' }}>
              |
            </Text>
            {isVeBal ? (
              <VeBalLink
                flex="1"
                triggerEl={
                  <Button w="100%" variant="secondary">
                    {lockBtnText}
                  </Button>
                }
              />
            ) : (
              <>
                <Button
                  onClick={() => router.push(`${pathname}/stake`)}
                  variant={canStake && hasUnstakedBalance ? 'secondary' : 'disabled'}
                  isDisabled={!(canStake && hasUnstakedBalance)}
                  flex="1"
                  maxW="120px"
                >
                  Stake
                </Button>
                {shouldMigrateStake(pool) ? (
                  <Tooltip label={migrateStakeTooltipLabel}>
                    <Button
                      onClick={() => router.push(`${pathname}/migrate-stake`)}
                      variant="secondary"
                      rightIcon={<InfoOutlineIcon fontSize="sm" />}
                      flex="1"
                      maxW="120px"
                    >
                      Migrate stake
                    </Button>
                  </Tooltip>
                ) : (
                  <Button
                    onClick={() => router.push(`${pathname}/unstake`)}
                    variant={hasGaugeStakedBalance ? 'tertiary' : 'disabled'}
                    isDisabled={!hasGaugeStakedBalance}
                    flex="1"
                    maxW="120px"
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
