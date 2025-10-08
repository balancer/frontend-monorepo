'use client'
import {
  Box,
  Button,
  HStack,
  Heading,
  Skeleton,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  VStack,
  Flex,
  Link,
} from '@chakra-ui/react'
import { Address } from 'viem'
import { useTokens } from '../TokensProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ReactNode, useEffect, useState } from 'react'
import { TokenIcon } from '../TokenIcon'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { Numberish, bn, fNum, formatFalsyValueAsDash } from '@repo/lib/shared/utils/numbers'
import { Pool } from '../../pool/pool.types'
import { TokenInfoPopover } from '../TokenInfoPopover'
import { ChevronDown } from 'react-feather'
import { BullseyeIcon } from '@repo/lib/shared/components/icons/BullseyeIcon'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import NextLink from 'next/link'
import { getNestedPoolPath, getPoolTypeLabel } from '../../pool/pool.utils'
import { ApiToken, CustomToken } from '../token.types'
import { getFlatUserReferenceTokens } from '../../pool/pool-tokens.utils'
import { usePoolTokenPriceWarnings } from '../../pool/usePoolTokenPriceWarnings'
import { TokenMissingPriceWarning } from '../TokenMissingPriceWarning'

export type TokenInfoProps = {
  address: Address
  symbol?: string
  chain: GqlChain
  token?: ApiToken | CustomToken
  poolToken?: ApiToken
  pool?: Pool
  disabled?: boolean
  showSelect?: boolean
  showInfoPopover?: boolean
  isBpt?: boolean
  isNestedBpt?: boolean
  isNestedPoolToken?: boolean
  iconSize?: number
  logoURI?: string
}

function TokenInfo({
  address,
  chain,
  token,
  poolToken,
  symbol,
  pool,
  disabled,
  showSelect = false,
  showInfoPopover = true,
  isBpt = false,
  isNestedPoolToken = false,
  iconSize = 40,
  logoURI,
}: TokenInfoProps) {
  const tokenSymbol = isBpt ? '‘LP’ pool token' : poolToken?.symbol || token?.symbol || symbol
  const tokenName = isBpt ? pool?.symbol : poolToken?.name || token?.name

  const headingProps = {
    as: 'h6' as const,
    fontSize: isNestedPoolToken ? 'sm' : 'md',
    fontWeight: 'bold',
    lineHeight: isNestedPoolToken ? '18px' : '24px',
    variant: disabled ? 'secondary' : 'primary',
  }

  const tokenNameProps = {
    fontSize: isNestedPoolToken ? 'xs' : 'sm',
    fontWeight: 'medium',
    lineHeight: isNestedPoolToken ? '12px' : '18px',
    variant: 'secondary',
  }

  return (
    <HStack spacing={{ base: 'sm', md: 'ms' }}>
      {!isBpt && (
        <TokenIcon
          address={address}
          alt={token?.symbol || address}
          chain={chain}
          logoURI={poolToken?.logoURI || token?.logoURI || logoURI}
          overflow="visible"
          size={iconSize}
        />
      )}
      <VStack alignItems="flex-start" spacing="none">
        <HStack spacing="none">
          {isBpt && pool ? (
            <Link as={NextLink} href={getNestedPoolPath({ pool, nestedPoolAddress: address })}>
              <Heading {...headingProps}>{tokenSymbol}</Heading>
            </Link>
          ) : (
            <Heading {...headingProps}>{tokenSymbol}</Heading>
          )}
          {showInfoPopover && (
            <TokenInfoPopover chain={chain} isBpt={isBpt} tokenAddress={address} />
          )}
        </HStack>
        <Text {...tokenNameProps}>{tokenName}</Text>
      </VStack>
      {showSelect && (
        <Box ml="sm">
          <ChevronDown size={16} />
        </Box>
      )}
    </HStack>
  )
}

export type TokenRowProps = {
  label?: string | ReactNode
  address: Address
  symbol?: string
  chain: GqlChain
  value: Numberish
  actualWeight?: string
  targetWeight?: string
  usdValue?: string
  disabled?: boolean
  isLoading?: boolean
  abbreviated?: boolean
  isBpt?: boolean
  isNestedBpt?: boolean
  isNestedPoolToken?: boolean
  pool?: Pool
  showZeroAmountAsDash?: boolean
  toggleTokenSelect?: () => void
  iconSize?: number
  logoURI?: string
  customToken?: CustomToken
  customUsdPrice?: number
}

export default function TokenRow({
  label,
  address,
  symbol,
  value,
  actualWeight,
  targetWeight,
  chain,
  disabled,
  isLoading,
  isBpt,
  isNestedBpt,
  isNestedPoolToken,
  pool,
  abbreviated = true,
  showZeroAmountAsDash = true,
  toggleTokenSelect,
  iconSize,
  logoURI,
  customToken,
  customUsdPrice,
}: TokenRowProps) {
  const { getToken, usdValueForToken, usdValueForTokenAddress, prices, tokens } = useTokens()
  const { toCurrency } = useCurrency()
  const [amount, setAmount] = useState<string>('')
  const [usdValue, setUsdValue] = useState<string | undefined>(undefined)
  const { isAnyTokenWithoutPrice, tokenPriceTip, tokensWithoutPrice, tokenWeightTip } =
    usePoolTokenPriceWarnings(pool)

  const token = customToken || getToken(address, chain)
  const userReferenceTokens = pool ? getFlatUserReferenceTokens(pool) : []
  const poolToken = userReferenceTokens.find(t => isSameAddress(t.address, address))
  const priceCheckAddress = token?.address ?? poolToken?.address ?? address

  const isTokenPriceMissing =
    !!priceCheckAddress &&
    Object.keys(tokensWithoutPrice ?? {}).some(a => isSameAddress(a as Address, priceCheckAddress))

  // TokenRowTemplate default props
  const props: TokenInfoProps = {
    address,
    chain,
    token,
    poolToken,
    pool,
    disabled,
    iconSize,
    isNestedPoolToken,
    symbol,
    logoURI,
  }

  useEffect(() => {
    if (value) {
      if (customUsdPrice) {
        setUsdValue(bn(customUsdPrice).times(value).toString())
      } else if ((isBpt || isNestedBpt) && pool) {
        setUsdValue(usdValueForTokenAddress(address, chain, value))
      } else if (token) {
        setUsdValue(usdValueForToken(token, value))
      } else if (poolToken) {
        // For not allowed tokens, token is undefined so we fallback to poolToken
        setUsdValue(usdValueForToken(poolToken, value))
      }

      setAmount(value.toString())
    }
  }, [value, prices, tokens])

  const headingProps = {
    as: 'h6' as const,
    fontSize: isNestedPoolToken ? 'sm' : 'md',
    fontWeight: isNestedPoolToken ? 'medium' : 'bold',
    lineHeight: isNestedPoolToken ? '18px' : '24px',
  }

  const subTextProps = {
    fontSize: isNestedPoolToken ? 'xs' : 'sm',
    fontWeight: 'medium',
    lineHeight: isNestedPoolToken ? '12px' : '18px',
    variant: 'secondary',
  }

  return (
    <VStack align="start" spacing="md" w="full">
      {label && typeof label === 'string' ? <Text color="grayText">{label}</Text> : label}
      <HStack justifyContent="space-between" width="full">
        {toggleTokenSelect ? (
          <Button cursor="pointer" onClick={toggleTokenSelect} p="2" size="xl" variant="tertiary">
            <TokenInfo {...props} showInfoPopover={false} showSelect />
          </Button>
        ) : (
          <TokenInfo {...props} isBpt={isBpt || isNestedBpt} />
        )}
        <HStack align="start" spacing="none">
          <VStack alignItems="flex-end" spacing="none" textAlign="right">
            {isLoading ? (
              <>
                <Skeleton h="4" w="10" />
                <Skeleton h="4" w="10" />
              </>
            ) : (
              <>
                <Heading {...headingProps} title={value.toString()}>
                  {formatFalsyValueAsDash(amount, val => fNum('token', val), {
                    showZeroAmountAsDash,
                  })}
                </Heading>
                {isTokenPriceMissing ? (
                  <TokenMissingPriceWarning message={tokenPriceTip} />
                ) : (
                  <Text {...subTextProps}>
                    {formatFalsyValueAsDash(usdValue, toCurrency, {
                      abbreviated,
                      showZeroAmountAsDash,
                    })}
                  </Text>
                )}
              </>
            )}
          </VStack>
          {actualWeight && (
            <VStack alignItems="flex-end" spacing="none" w="24">
              {isLoading ? (
                <>
                  <Skeleton h="4" w="10" />
                  <Skeleton h="4" w="10" />
                </>
              ) : (
                <>
                  <Heading {...headingProps}>
                    {isAnyTokenWithoutPrice ? (
                      <TokenMissingPriceWarning message={tokenWeightTip} />
                    ) : (
                      fNum('weight', actualWeight, { abbreviated: false })
                    )}
                  </Heading>
                  <HStack align="center" spacing="xs">
                    {targetWeight ? (
                      <>
                        <Text {...subTextProps}>{fNum('weight', targetWeight)}</Text>
                        <Popover trigger="hover">
                          <PopoverTrigger>
                            <Box
                              _hover={{ opacity: 1 }}
                              opacity="0.5"
                              position="relative"
                              top="1px"
                              transition="opacity 0.2s var(--ease-out-cubic)"
                            >
                              <BullseyeIcon />
                            </Box>
                          </PopoverTrigger>
                          <PopoverContent maxW="300px" p="sm" w="auto">
                            <Text fontSize="sm" variant="secondary">
                              The target weight percentage set for this token in the context of a{' '}
                              {pool ? getPoolTypeLabel(pool.type) : 'this'} pool.
                            </Text>
                          </PopoverContent>
                        </Popover>
                      </>
                    ) : (
                      <>
                        <Popover trigger="hover">
                          <PopoverTrigger>
                            <HStack cursor="default" data-group>
                              <Flex alignItems="center" height="24px">
                                <Text
                                  _groupHover={{ color: 'font.maxContrast' }}
                                  fontSize="sm"
                                  fontWeight="medium"
                                  position="relative"
                                  top="1px"
                                  transition="color 0.2s var(--ease-out-cubic)"
                                  variant="secondary"
                                >
                                  N/A
                                </Text>
                              </Flex>

                              <Box
                                _groupHover={{ color: 'font.highlight' }}
                                _hover={{ opacity: 1 }}
                                opacity="0.5"
                                position="relative"
                                top="1px"
                                transition="opacity 0.2s var(--ease-out-cubic)"
                              >
                                <BullseyeIcon />
                              </Box>
                            </HStack>
                          </PopoverTrigger>
                          <PopoverContent p="sm">
                            <Text fontSize="sm" variant="secondary">
                              There is no concept of a target weight for tokens within{' '}
                              {pool ? getPoolTypeLabel(pool.type) : 'this'} pools. Target weights
                              only apply to tokens within Weighted pools.
                            </Text>
                          </PopoverContent>
                        </Popover>
                      </>
                    )}
                  </HStack>
                </>
              )}
            </VStack>
          )}
        </HStack>
      </HStack>
    </VStack>
  )
}
