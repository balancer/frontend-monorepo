/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { Box, Button, HStack, Heading, Skeleton, Text, Tooltip, VStack } from '@chakra-ui/react'
import { Address } from 'viem'
import { useTokens } from '../TokensProvider'
import {
  GqlChain,
  GqlPoolTokenDisplay,
  GqlToken,
} from '@/lib/shared/services/api/generated/graphql'
import { ReactNode, useEffect, useState } from 'react'
import { TokenIcon } from '../TokenIcon'
import { useCurrency } from '@/lib/shared/hooks/useCurrency'
import { Numberish, fNum, isZero } from '@/lib/shared/utils/numbers'
import { Pool } from '../../pool/PoolProvider'
import { bptUsdValue } from '../../pool/pool.helpers'
import { TokenInfoPopover } from '../TokenInfoPopover'
import { ChevronDown } from 'react-feather'
import { BullseyeIcon } from '@/lib/shared/components/icons/BullseyeIcon'
import { isSameAddress } from '@/lib/shared/utils/addresses'

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
  const tokenSymbol = isBpt ? 'LP token' : token?.symbol || pool?.symbol || displayToken?.symbol
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
          {showInfoPopover ? (
            <TokenInfoPopover chain={chain} isBpt={isBpt} tokenAddress={address} />
          ) : null}
        </HStack>
        <Text fontSize="0.85rem" fontWeight="medium" variant="secondary">
          {tokenName}
        </Text>
      </VStack>
      {showSelect ? (
        <Box ml="sm">
          <ChevronDown size={16} />
        </Box>
      ) : null}
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
          {actualWeight ? (
            <VStack alignItems="flex-end" spacing="xs" w="24">
              {isLoading ? (
                <>
                  <Skeleton h="4" w="10" />
                  <Skeleton h="4" w="10" />
                </>
              ) : (
                <>
                  <Heading as="h6" fontSize="lg" fontWeight="bold">
                    {fNum('weight', actualWeight, { abbreviated: false })}
                  </Heading>
                  {targetWeight ? (
                    <HStack align="start" spacing="xs">
                      <Text fontSize="sm" fontWeight="medium" variant="secondary">
                        {fNum('weight', targetWeight)}
                      </Text>
                      <Tooltip label="Target weight">
                        <Box>
                          <BullseyeIcon />
                        </Box>
                      </Tooltip>
                    </HStack>
                  ) : null}
                </>
              )}
            </VStack>
          ) : null}
        </HStack>
      </HStack>
    </VStack>
  )
}
