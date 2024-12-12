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
  Link,
} from '@chakra-ui/react'
import { Address } from 'viem'
import { useTokens } from '../TokensProvider'
import {
  GqlChain,
  GqlPoolTokenDisplay,
  GqlToken,
} from '@repo/lib/shared/services/api/generated/graphql'
import { ReactNode, useEffect, useState } from 'react'
import { TokenIcon } from '../TokenIcon'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { Numberish, fNum, isZero } from '@repo/lib/shared/utils/numbers'
import { Pool } from '../../pool/PoolProvider'
import { TokenInfoPopover } from '../TokenInfoPopover'
import { ChevronDown } from 'react-feather'
import { BullseyeIcon } from '@repo/lib/shared/components/icons/BullseyeIcon'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import NextLink from 'next/link'
import { getNestedPoolPath } from '../../pool/pool.utils'

type DataProps = {
  address: Address
  chain: GqlChain
  token?: GqlToken
  displayToken?: GqlPoolTokenDisplay
  pool?: Pool
  disabled?: boolean
  showSelect?: boolean
  showInfoPopover?: boolean
  isBpt?: boolean
  isNestedBpt?: boolean
  isNestedPoolToken?: boolean
  iconSize?: number
}

function TokenInfo({
  address,
  chain,
  token,
  displayToken,
  pool,
  disabled,
  showSelect = false,
  showInfoPopover = true,
  isBpt = false,
  isNestedPoolToken = false,
  iconSize = 40,
}: DataProps) {
  const tokenSymbol = isBpt ? 'LP token' : token?.symbol || displayToken?.symbol
  const tokenName = isBpt ? pool?.name : token?.name || displayToken?.name

  const headingProps = {
    as: 'h6' as const,
    fontSize: isNestedPoolToken ? 'md' : 'lg',
    fontWeight: 'bold',
    lineHeight: isNestedPoolToken ? '20px' : '24px',
    variant: disabled ? 'secondary' : 'primary',
  }

  const tokenNameProps = {
    fontSize: isNestedPoolToken ? 'sm' : 'md',
    fontWeight: 'medium',
    lineHeight: '24px',
    variant: 'secondary',
  }

  return (
    <HStack spacing="sm">
      {!isBpt && (
        <TokenIcon address={address} alt={token?.symbol || address} chain={chain} size={iconSize} />
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
}

export default function TokenRow({
  label,
  address,
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
  showZeroAmountAsDash = false,
  toggleTokenSelect,
  iconSize,
}: TokenRowProps) {
  const { getToken, usdValueForToken, usdValueForBpt } = useTokens()
  const { toCurrency } = useCurrency()
  const [amount, setAmount] = useState<string>('')
  const [usdValue, setUsdValue] = useState<string | undefined>(undefined)
  const token = getToken(address, chain)
  const displayToken = pool?.displayTokens.find(t => isSameAddress(t.address, address))

  // TokenRowTemplate default props
  const props = {
    address,
    chain,
    token,
    displayToken,
    pool,
    disabled,
    iconSize,
    isNestedPoolToken,
  }

  useEffect(() => {
    if (value) {
      if ((isBpt || isNestedBpt) && pool) {
        setUsdValue(usdValueForBpt(address, chain, value))
      } else if (token) {
        setUsdValue(usdValueForToken(token, value))
      }

      setAmount(fNum('token', value, { abbreviated }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const headingProps = {
    as: 'h6' as const,
    fontSize: isNestedPoolToken ? 'md' : 'lg',
    fontWeight: isNestedPoolToken ? 'normal' : 'bold',
    lineHeight: isNestedPoolToken ? '20px' : '24px',
  }

  const subTextProps = {
    fontSize: isNestedPoolToken ? 'sm' : 'md',
    fontWeight: 'medium',
    lineHeight: '24px',
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
          <VStack alignItems="flex-end" spacing="xs" textAlign="right">
            {isLoading ? (
              <>
                <Skeleton h="4" w="10" />
                <Skeleton h="4" w="10" />
              </>
            ) : (
              <>
                <Heading {...headingProps} title={value.toString()}>
                  {isZero(amount) && showZeroAmountAsDash ? '-' : amount ? amount : '0'}
                </Heading>
                <Text {...subTextProps}>
                  {showZeroAmountAsDash && usdValue && isZero(usdValue)
                    ? '-'
                    : toCurrency(usdValue ?? '0', { abbreviated })}
                </Text>
              </>
            )}
          </VStack>
          {actualWeight && (
            <VStack alignItems="flex-end" spacing="xs" w="24">
              {isLoading ? (
                <>
                  <Skeleton h="4" w="10" />
                  <Skeleton h="4" w="10" />
                </>
              ) : (
                <>
                  <Heading {...headingProps}>
                    {fNum('weight', actualWeight, { abbreviated: false })}
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
                              transition="opacity 0.2s var(--ease-out-cubic)"
                            >
                              <BullseyeIcon />
                            </Box>
                          </PopoverTrigger>
                          <PopoverContent maxW="300px" p="sm" w="auto">
                            <Text fontSize="sm" variant="secondary">
                              The target weight percentage set for this token in the context of a
                              Weighted Pool.
                            </Text>
                          </PopoverContent>
                        </Popover>
                      </>
                    ) : (
                      <>
                        <Text fontSize="sm" fontWeight="medium" variant="secondary">
                          N/A
                        </Text>
                        <Popover trigger="hover">
                          <PopoverTrigger>
                            <Box
                              _hover={{ opacity: 1 }}
                              opacity="0.5"
                              transition="opacity 0.2s var(--ease-out-cubic)"
                            >
                              <BullseyeIcon />
                            </Box>
                          </PopoverTrigger>
                          <PopoverContent p="sm">
                            <Text fontSize="sm" variant="secondary">
                              Target weights are only applicable to tokens within Weighted Pools.
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
