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
        <TokenIcon address={address} alt={token?.symbol || address} chain={chain} size={40} />
      )}
      <VStack alignItems="flex-start" spacing="none">
        <HStack spacing="none">
          <Heading
            as="h6"
            fontSize="md"
            fontWeight="bold"
            variant={disabled ? 'secondary' : 'primary'}
          >
            {tokenSymbol}
          </Heading>
          {showInfoPopover && (
            <TokenInfoPopover chain={chain} isBpt={isBpt} tokenAddress={address} />
          )}
        </HStack>
        <Text fontSize="0.85rem" fontWeight="medium" variant="secondary">
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
}: TokenRowProps) {
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
    <VStack align="start" spacing="md" w="full">
      {label && typeof label === 'string' ? <Text color="grayText">{label}</Text> : label}
      <HStack justifyContent="space-between" width="full">
        {toggleTokenSelect ? (
          <Button cursor="pointer" onClick={toggleTokenSelect} p="2" size="xl" variant="tertiary">
            <TokenInfo {...props} showInfoPopover={false} showSelect />
          </Button>
        ) : (
          <TokenInfo {...props} isBpt={isBpt} />
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
                <Heading as="h6" fontSize="md" fontWeight="bold" title={value.toString()}>
                  {isZero(amount) && showZeroAmountAsDash ? '-' : amount ? amount : '0'}
                </Heading>
                <Text fontSize="sm" fontWeight="medium" variant="secondary">
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
                  <Heading as="h6" fontSize="md" fontWeight="bold">
                    {fNum('weight', actualWeight, { abbreviated: false })}
                  </Heading>
                  <HStack align="center" spacing="xs">
                    {targetWeight ? (
                      <>
                        <Text fontSize="sm" fontWeight="medium" variant="secondary">
                          {fNum('weight', targetWeight)}
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
