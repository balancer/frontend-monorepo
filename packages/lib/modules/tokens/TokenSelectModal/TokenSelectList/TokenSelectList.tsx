'use client'

import { Box, BoxProps, Button, HStack, Text, Divider } from '@chakra-ui/react'
import { TokenSelectListRow } from './TokenSelectListRow'
import { GqlChain, GqlToken } from '@repo/lib/shared/services/api/generated/graphql'
import { useTokenBalances } from '../../TokenBalancesProvider'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTokenSelectList } from './useTokenSelectList'
import { GroupedVirtuoso, GroupedVirtuosoHandle } from 'react-virtuoso'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { CoinsIcon } from '@repo/lib/shared/components/icons/CoinsIcon'
import { WalletIcon } from '@repo/lib/shared/components/icons/WalletIcon'
import { useTokens } from '../../TokensProvider'
import { Address } from 'viem'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'

type Props = {
  chain: GqlChain
  tokens: GqlToken[]
  excludeNativeAsset?: boolean
  pinNativeAsset?: boolean
  listHeight: number
  searchTerm?: string
  currentToken?: Address
  onTokenSelect: (token: GqlToken) => void
}
function OtherTokens() {
  return (
    <Box bg="background.level1">
      <Divider />
      <HStack pt="sm" px="md">
        <Box color="font.secondary">
          <CoinsIcon size={20} />
        </Box>
        <Text color="font.secondary" fontSize="sm">
          Other tokens
        </Text>
      </HStack>
      <Divider pt="2" />
    </Box>
  )
}

interface InYourWalletProps {
  isConnected: boolean
  openConnectModal: (() => void) | undefined
  hasNoTokensInWallet: boolean
}

function InYourWallet({ isConnected, openConnectModal, hasNoTokensInWallet }: InYourWalletProps) {
  return (
    <Box mr="0" pb="0">
      <Divider />
      <Box bg="background.level1" px="md" py="sm">
        <HStack zIndex="1">
          <Box color="font.secondary">
            <WalletIcon size={20} />
          </Box>
          <Text color="font.secondary" fontSize="sm">
            In your wallet
          </Text>
          {!isConnected && (
            <Button
              _hover={{ color: 'font.linkHover' }}
              color="font.link"
              height="24px !important"
              ml="auto"
              onClick={openConnectModal}
              padding="0"
              size="sm"
              variant="link"
            >
              Connect wallet
            </Button>
          )}
          {isConnected && hasNoTokensInWallet && (
            <Box ml="auto">
              <Text color="red.500" fontSize="sm" fontWeight="bold">
                No tokens on this network
              </Text>
            </Box>
          )}
        </HStack>
      </Box>
      {isConnected && !hasNoTokensInWallet && <Divider />}
    </Box>
  )
}

interface TokenRowProps {
  index: number
  token: GqlToken
  isConnected: boolean
  balanceFor: (token: GqlToken) => any
  isBalancesLoading: boolean
  isLoadingTokenPrices: boolean
  activeIndex: number
  isCurrentToken: (token: GqlToken) => boolean
  onTokenSelect: (token: GqlToken) => void
}

function TokenRow({
  index,
  token,
  isConnected,
  balanceFor,
  isBalancesLoading,
  isLoadingTokenPrices,
  activeIndex,
  isCurrentToken,
  onTokenSelect,
}: TokenRowProps) {
  const userBalance = isConnected ? balanceFor(token) : undefined

  return (
    <TokenSelectListRow
      active={index === activeIndex}
      isBalancesLoading={isBalancesLoading || isLoadingTokenPrices}
      isCurrentToken={isCurrentToken(token)}
      onClick={() => !isCurrentToken(token) && onTokenSelect(token)}
      token={token}
      userBalance={userBalance}
    />
  )
}

function renderTokenRow(
  index: number,
  activeIndex: number,
  balanceFor: (token: GqlToken) => any,
  isBalancesLoading: boolean,
  isConnected: boolean,
  isCurrentToken: (token: GqlToken) => boolean,
  isLoadingTokenPrices: boolean,
  onTokenSelect: (token: GqlToken) => void,
  tokensToShow: GqlToken[]
) {
  return (
    <TokenRow
      activeIndex={activeIndex}
      balanceFor={balanceFor}
      index={index}
      isBalancesLoading={isBalancesLoading}
      isConnected={isConnected}
      isCurrentToken={isCurrentToken}
      isLoadingTokenPrices={isLoadingTokenPrices}
      onTokenSelect={onTokenSelect}
      token={tokensToShow[index]}
    />
  )
}

export function TokenSelectList({
  chain,
  tokens,
  excludeNativeAsset = false,
  pinNativeAsset = false,
  listHeight,
  searchTerm,
  currentToken,
  onTokenSelect,
  ...rest
}: Props & BoxProps) {
  const ref = useRef<GroupedVirtuosoHandle>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const { balanceFor, isBalancesLoading } = useTokenBalances()
  const { isLoadingTokenPrices } = useTokens()
  const { isConnected } = useUserAccount()
  const { orderedTokens } = useTokenSelectList(
    chain,
    tokens,
    excludeNativeAsset,
    pinNativeAsset,
    searchTerm
  )
  const { openConnectModal } = useConnectModal()

  const tokensWithBalance = isConnected
    ? orderedTokens.filter(token => balanceFor(token)?.amount)
    : []
  const tokensWithoutBalance = orderedTokens.filter(token => !tokensWithBalance.includes(token))
  const tokensToShow = [...tokensWithBalance, ...tokensWithoutBalance]

  const isCurrentToken = (token: GqlToken) =>
    !!currentToken && isSameAddress(token.address, currentToken)

  const groups = [
    <InYourWallet
      hasNoTokensInWallet={!tokensWithBalance.length}
      isConnected={isConnected}
      key="in-your-wallet"
      openConnectModal={openConnectModal}
    />,
    <OtherTokens key="other-tokens" />,
  ]
  const groupCounts = [tokensWithBalance.length, tokensWithoutBalance.length]

  const decrementActiveIndex = () => setActiveIndex(prev => Math.max(prev - 1, 0))
  const incrementActiveIndex = () =>
    setActiveIndex(prev => Math.min(prev + 1, tokensToShow.length - 1))
  const hotkeyOpts = { enableOnFormTags: true }

  const selectActiveToken = () => {
    const token = tokensToShow[activeIndex]
    if (token) {
      onTokenSelect(token)
    }
  }

  useHotkeys('up', decrementActiveIndex, hotkeyOpts)
  useHotkeys('shift+tab', decrementActiveIndex, hotkeyOpts)
  useHotkeys('down', incrementActiveIndex, hotkeyOpts)
  useHotkeys('tab', incrementActiveIndex, hotkeyOpts)
  useHotkeys('enter', selectActiveToken, [tokensToShow, activeIndex], hotkeyOpts)

  useEffect(() => {
    ref.current?.scrollIntoView({ index: activeIndex, behavior: 'auto' })
  }, [activeIndex])

  return (
    <Box height={listHeight} {...rest}>
      {tokensToShow.length === 0 ? (
        <Box p="lg">
          <Text color="font.error" fontWeight="bold" mb="xxs">
            No tokens found
          </Text>
          <Text color="font.secondary" fontSize="sm">
            Are you sure this token is on this network?
          </Text>
          <Text color="font.secondary" fontSize="sm">
            You can search by token name, symbol or address
          </Text>
        </Box>
      ) : (
        <GroupedVirtuoso
          groupContent={index => groups[index]}
          groupCounts={groupCounts}
          itemContent={index =>
            renderTokenRow(
              index,
              activeIndex,
              balanceFor,
              isBalancesLoading,
              isConnected,
              isCurrentToken,
              isLoadingTokenPrices,
              onTokenSelect,
              tokensToShow
            )
          }
          ref={ref}
          style={{ height: listHeight }}
        />
      )}
    </Box>
  )
}
