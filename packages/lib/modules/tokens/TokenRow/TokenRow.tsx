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
import { bptUsdValue } from '../../pool/pool.helpers'
import { TokenInfoPopover } from '../TokenInfoPopover'
import { ChevronDown } from 'react-feather'
import { BullseyeIcon } from '@repo/lib/shared/components/icons/BullseyeIcon'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'

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
}: DataProps) {
  const tokenSymbol = isBpt ? 'LP token' : token?.symbol || displayToken?.symbol
  const tokenName = isBpt ? pool?.name : token?.name || displayToken?.name

  return (
    <HStack spacing="sm">
      {!isBpt && (
        <TokenIcon chain={chain} address={address} size={40} alt={token?.symbol || address} />
      )}
      <VStack spacing="none" alignItems="flex-start">
        <HStack spacing="none">
          <Heading
            fontWeight="bold"
            as="h6"
            fontSize="md"
            variant={disabled ? 'secondary' : 'primary'}
          >
            {tokenSymbol}
          </Heading>
          {showInfoPopover && (
            <TokenInfoPopover tokenAddress={address} chain={chain} isBpt={isBpt} />
          )}
        </HStack>
        <Text fontWeight="medium" variant="secondary" fontSize="0.85rem">
          {tokenName}
        </Text>
      </VStack>
      {showSelect && (
        <Box ml="sm">
          <ChevronDown size={16} />
        </Box>
      )}
    </HStack>
  )
}

type Props = {
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
  pool?: Pool
  showZeroAmountAsDash?: boolean
  toggleTokenSelect?: () => void
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
  pool,
  abbreviated = true,
  showZeroAmountAsDash = false,
  toggleTokenSelect,
}: Props) {
  const { getToken, usdValueForToken } = useTokens()
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
  }

  useEffect(() => {
    if (value) {
      if (isBpt && pool) {
        setUsdValue(bptUsdValue(pool, value))
      } else if (token) {
        setUsdValue(usdValueForToken(token, value))
      }

      setAmount(fNum('token', value, { abbreviated }))
    }
  }, [value])

  return (
    <VStack align="start" w="full" spacing="md">
      {label && typeof label === 'string' ? <Text color="grayText">{label}</Text> : label}
      <HStack width="full" justifyContent="space-between">
        {toggleTokenSelect ? (
          <Button variant="tertiary" onClick={toggleTokenSelect} cursor="pointer" size="xl" p="2">
            <TokenInfo {...props} showInfoPopover={false} showSelect />
          </Button>
        ) : (
          <TokenInfo {...props} isBpt={isBpt} />
        )}

        <HStack align="start" spacing="none">
          <VStack spacing="xs" alignItems="flex-end" textAlign="right">
            {isLoading ? (
              <>
                <Skeleton w="10" h="4" />
                <Skeleton w="10" h="4" />
              </>
            ) : (
              <>
                <Heading fontWeight="bold" as="h6" fontSize="md" title={value.toString()}>
                  {isZero(amount) && showZeroAmountAsDash ? '-' : amount ? amount : '0'}
                </Heading>
                <Text fontWeight="medium" variant="secondary" fontSize="sm">
                  {showZeroAmountAsDash && usdValue && isZero(usdValue)
                    ? '-'
                    : toCurrency(usdValue ?? '0', { abbreviated })}
                </Text>
              </>
            )}
          </VStack>
          {actualWeight && (
            <VStack spacing="xs" alignItems="flex-end" w="24">
              {isLoading ? (
                <>
                  <Skeleton w="10" h="4" />
                  <Skeleton w="10" h="4" />
                </>
              ) : (
                <>
                  <Heading fontWeight="bold" as="h6" fontSize="md">
                    {fNum('weight', actualWeight, { abbreviated: false })}
                  </Heading>
                  <HStack spacing="xs" align="center">
                    {targetWeight ? (
                      <>
                        <Text fontWeight="medium" variant="secondary" fontSize="sm">
                          {fNum('weight', targetWeight)}
                        </Text>
                        <Popover trigger="hover">
                          <PopoverTrigger>
                            <Box
                              opacity="0.5"
                              transition="opacity 0.2s var(--ease-out-cubic)"
                              _hover={{ opacity: 1 }}
                            >
                              <BullseyeIcon />
                            </Box>
                          </PopoverTrigger>
                          <PopoverContent p="sm" w="auto" maxW="300px">
                            <Text fontSize="sm" variant="secondary">
                              The target weight percentage set for this token in the context of a
                              Weighted Pool.
                            </Text>
                          </PopoverContent>
                        </Popover>
                      </>
                    ) : (
                      <>
                        <Text fontWeight="medium" variant="secondary" fontSize="sm">
                          N/A
                        </Text>
                        <Popover trigger="hover">
                          <PopoverTrigger>
                            <Box
                              opacity="0.5"
                              transition="opacity 0.2s var(--ease-out-cubic)"
                              _hover={{ opacity: 1 }}
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
