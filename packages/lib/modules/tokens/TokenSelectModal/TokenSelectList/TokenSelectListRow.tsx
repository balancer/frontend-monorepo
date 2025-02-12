'use client'

import { Box, BoxProps, HStack, VStack, Text } from '@chakra-ui/react'
import { TokenIcon } from '../../TokenIcon'
import { TokenAmount } from '../../token.types'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useTokens } from '../../TokensProvider'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { TokenInfoPopover } from '../../TokenInfoPopover'
import { ApiToken } from '../../token.types'

type Props = {
  token: ApiToken
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
    rounded: 'md',
    mb: 'sm',
    _hover: isCurrentToken
      ? {}
      : {
          bg: active ? 'background.level3' : 'background.level2',
        },
    transition: 'all 0.2s var(--ease-out-cubic)',
  }

  return (
    <Box {...boxStyles} {...rest} role="group">
      <HStack height="full" justify="space-between" maxW="full" spacing="md">
        <HStack height="full" maxW="full" spacing="ms">
          <Box
            _groupHover={isCurrentToken ? {} : { transform: 'scale(1.075)' }}
            transition="all 0.2s var(--ease-out-cubic)"
          >
            <TokenIcon address={token.address} alt={token.symbol} chain={token.chain} />
          </Box>
          <VStack align="start" height="full" justify="center" maxW="full" spacing="none">
            <HStack spacing="xxs">
              <Text color={active ? 'font.link' : 'font.primary'} fontWeight="bold">
                {token.symbol}
              </Text>
              <Box onClick={e => e.stopPropagation()}>
                <TokenInfoPopover chain={token.chain} tokenAddress={token.address} />
              </Box>
            </HStack>
            <Text
              color="grayText"
              fontSize="sm"
              fontWeight="medium"
              lineHeight="1"
              maxW="80"
              pr="lg"
              title={token.name}
              whiteSpace="normal"
            >
              {token.name}
            </Text>
          </VStack>
        </HStack>
        {isConnected && tokenBalance !== '0' && (
          <VStack align="end" justify="center" spacing="none">
            <Text
              color={active ? 'font.link' : 'font.primary'}
              fontWeight="bold"
              title={userBalance?.amount.toString()}
            >
              {tokenBalance}
            </Text>
            <Text color="grayText" fontSize="sm" fontWeight="medium">
              {fiatValue}
            </Text>
          </VStack>
        )}
      </HStack>
    </Box>
  )
}
