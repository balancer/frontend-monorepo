'use client'

import { Box, BoxProps, HStack, VStack, Text } from '@chakra-ui/react'
import { TokenIcon } from '../../TokenIcon'
import { TokenAmount } from '../../token.types'
import { GqlToken } from '@/lib/shared/services/api/generated/graphql'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import { useTokens } from '../../TokensProvider'
import { useCurrency } from '@/lib/shared/hooks/useCurrency'
import { fNum } from '@/lib/shared/utils/numbers'
import { TokenInfoPopover } from '../../TokenInfoPopover'

type Props = {
  token: GqlToken
  userBalance?: TokenAmount
  isBalancesLoading?: boolean
  active?: boolean
  isCurrentToken?: boolean
}

export function TokenSelectListRow({
  token,
  userBalance,
  isBalancesLoading = true,
  active = false,
  isCurrentToken = false,
  ...rest
}: Props & BoxProps) {
  const { isConnected } = useUserAccount()
  const { toCurrency } = useCurrency()
  const { usdValueForToken } = useTokens()

  const tokenBalance =
    userBalance && !isBalancesLoading ? fNum('token', userBalance.formatted) : '-'
  const usdValue =
    userBalance && !isBalancesLoading ? usdValueForToken(token, userBalance.formatted) : '0'
  const fiatValue = userBalance && !isBalancesLoading ? toCurrency(usdValue) : '-'

  const boxStyles: BoxProps = {
    bg: active ? 'background.level2' : 'transparent',
    border: '1px solid',
    borderColor: active ? 'transparent' : 'transparent',
    py: 'sm',
    px: 'md',
    cursor: isCurrentToken ? 'not-allowed' : 'pointer',
    opacity: isCurrentToken ? 0.5 : 1,
    _hover: isCurrentToken
      ? {}
      : {
          bg: active ? 'background.level3' : 'background.level2',
        },
    transition: 'all 0.2s var(--ease-out-cubic)',
  }

  return (
    <Box {...boxStyles} {...rest} role="group">
      <HStack height="full" spacing="md" justify="space-between" maxW="full">
        <HStack height="full" spacing="ms" maxW="full">
          <Box
            transition="all 0.2s var(--ease-out-cubic)"
            _groupHover={isCurrentToken ? {} : { transform: 'scale(1.075)' }}
          >
            <TokenIcon address={token.address} chain={token.chain} alt={token.symbol} />
          </Box>
          <VStack height="full" align="start" justify="center" spacing="none" maxW="full">
            <HStack spacing="xxs">
              <Text color={active ? 'font.link' : 'font.primary'} fontWeight="bold">
                {token.symbol}
              </Text>
              <Box onClick={e => e.stopPropagation()}>
                <TokenInfoPopover tokenAddress={token.address} chain={token.chain} />
              </Box>
            </HStack>
            <Text
              title={token.name}
              fontSize="sm"
              whiteSpace="normal"
              color="grayText"
              fontWeight="medium"
              lineHeight="1"
              pr="lg"
              maxW="80"
            >
              {token.name}
            </Text>
          </VStack>
        </HStack>
        {isConnected && tokenBalance !== '0' && (
          <VStack align="end" justify="center" spacing="none">
            <Text
              title={userBalance?.amount.toString()}
              color={active ? 'font.link' : 'font.primary'}
              fontWeight="bold"
            >
              {tokenBalance}
            </Text>
            <Text fontSize="sm" color="grayText" fontWeight="medium">
              {fiatValue}
            </Text>
          </VStack>
        )}
      </HStack>
    </Box>
  )
}
