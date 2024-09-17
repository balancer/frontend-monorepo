/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import {
  Box,
  BoxProps,
  Button,
  HStack,
  Input,
  InputGroup,
  InputProps,
  InputRightAddon,
  Skeleton,
  Text,
  VStack,
  forwardRef,
  useTheme,
} from '@chakra-ui/react'
import { GqlChain, GqlToken } from '@/lib/shared/services/api/generated/graphql'
import { useTokens } from '../TokensProvider'
import { useTokenBalances } from '../TokenBalancesProvider'
import { useTokenInput } from './useTokenInput'
import { useCurrency } from '@/lib/shared/hooks/useCurrency'
import { blockInvalidNumberInput, bn, fNum } from '@/lib/shared/utils/numbers'
import { TokenIcon } from '../TokenIcon'
import { useTokenInputsValidation } from '../TokenInputsValidationProvider'
import { ChevronDown } from 'react-feather'
import { WalletIcon } from '@/lib/shared/components/icons/WalletIcon'
import { usePriceImpact } from '@/lib/modules/price-impact/PriceImpactProvider'
import { useEffect, useState } from 'react'
import { useIsMounted } from '@/lib/shared/hooks/useIsMounted'
import { isNativeAsset } from '@/lib/shared/utils/addresses'

type TokenInputSelectorProps = {
  token: GqlToken | undefined
  weight?: string
  toggleTokenSelect?: () => void
}

type TokenConfigProps = {
  label: string
  variant: string
  showIcon: boolean
}

function TokenInputSelector({ token, weight, toggleTokenSelect }: TokenInputSelectorProps) {
  const [tokenConfig, setTokenConfig] = useState<TokenConfigProps | undefined>(undefined)

  useEffect(() => {
    if (token) {
      setTokenConfig({ label: token.symbol, variant: 'tertiary', showIcon: true })
    } else if (toggleTokenSelect) {
      setTokenConfig({ label: 'Select token', variant: 'secondary', showIcon: false })
    }
  }, [token])

  return tokenConfig ? (
    <Button
      variant={tokenConfig.variant}
      onClick={toggleTokenSelect}
      cursor={toggleTokenSelect ? 'pointer' : 'default'}
    >
      {tokenConfig && tokenConfig.showIcon && (
        <Box mr="sm">
          <TokenIcon logoURI={token?.logoURI} alt={tokenConfig.label} size={22} loading="lazy" />
        </Box>
      )}
      {tokenConfig && tokenConfig.label}
      {weight && (
        <Text fontWeight="normal" ml="sm" fontSize="sm">
          {fNum('weight', weight)}
        </Text>
      )}
      {toggleTokenSelect && (
        <Box ml="sm">
          <ChevronDown size={16} />
        </Box>
      )}
    </Button>
  ) : (
    <Skeleton height="40px" width="110px" />
  )
}

type TokenInputFooterProps = {
  token: GqlToken | undefined
  value?: string
  updateValue: (value: string) => void
  hasPriceImpact?: boolean
  isLoadingPriceImpact?: boolean
}

function TokenInputFooter({
  token,
  value,
  updateValue,
  hasPriceImpact,
  isLoadingPriceImpact,
}: TokenInputFooterProps) {
  const { balanceFor, isBalancesLoading } = useTokenBalances()
  const { usdValueForToken } = useTokens()
  const { toCurrency } = useCurrency()
  const { hasValidationError, getValidationError } = useTokenInputsValidation()
  const { priceImpact, priceImpactColor, priceImpactLevel } = usePriceImpact()
  const isMounted = useIsMounted()

  const hasError = hasValidationError(token)
  const inputLabelColor = hasError ? 'input.fontHintError' : 'grayText'

  const balance = token ? balanceFor(token?.address) : undefined
  const userBalance = token ? balance?.formatted || '0' : '0'
  const usdValue = value && token ? usdValueForToken(token, value) : '0'

  const noBalance = !token || bn(userBalance).isZero()
  const _isNativeAsset = token && isNativeAsset(token.chain, token.address)

  const showPriceImpact = !isLoadingPriceImpact && hasPriceImpact && priceImpact

  function handleBalanceClick() {
    // We return for _isNativeAsset because you can't use your full native asset
    // balance, you need to save some for a swap.
    if (noBalance || _isNativeAsset) return

    if (value && bn(value).eq(userBalance)) {
      updateValue('')
    } else {
      updateValue(userBalance)
    }
  }

  return (
    <HStack h="4" w="full" justify="space-between">
      {isBalancesLoading || !isMounted ? (
        <Skeleton w="12" h="full" />
      ) : (
        <Text
          variant="secondary"
          fontSize="sm"
          color={showPriceImpact ? priceImpactColor : 'font.secondary'}
        >
          {toCurrency(usdValue, { abbreviated: false })}
          {showPriceImpact &&
            priceImpactLevel !== 'unknown' &&
            ` (-${fNum('priceImpact', priceImpact)})`}
        </Text>
      )}
      {isBalancesLoading || !isMounted ? (
        <Skeleton w="12" h="full" />
      ) : (
        <HStack
          title="Use wallet balance"
          cursor={noBalance || _isNativeAsset ? 'default' : 'pointer'}
          onClick={handleBalanceClick}
          color={inputLabelColor}
          _hover={noBalance || _isNativeAsset ? {} : { color: 'font.highlight' }}
        >
          {hasError && (
            <Text fontSize="sm" color="inherit">
              {getValidationError(token)}
            </Text>
          )}
          <Text fontSize="sm" color="inherit">
            {fNum('token', userBalance, { abbreviated: false })}
          </Text>
          <Box>
            <WalletIcon size={16} />
          </Box>
        </HStack>
      )}
    </HStack>
  )
}

type Props = {
  address?: string
  chain?: GqlChain | number
  weight?: string
  value?: string
  hideFooter?: boolean
  boxProps?: BoxProps
  onChange?: (event: { currentTarget: { value: string } }) => void
  toggleTokenSelect?: () => void
  hasPriceImpact?: boolean
  isLoadingPriceImpact?: boolean
  disableBalanceValidation?: boolean
}

export const TokenInput = forwardRef(
  (
    {
      address,
      chain,
      weight,
      value,
      boxProps,
      onChange,
      toggleTokenSelect,
      hideFooter = false,
      hasPriceImpact = false,
      isLoadingPriceImpact = false,
      disableBalanceValidation = false,
      ...inputProps
    }: InputProps & Props,
    ref
  ) => {
    const { isBalancesLoading } = useTokenBalances()

    const [inputTitle, setInputTitle] = useState<string>('')

    const { colors } = useTheme()
    const { getToken } = useTokens()
    const token = address && chain ? getToken(address, chain) : undefined
    const { hasValidationError } = useTokenInputsValidation()

    const { handleOnChange, updateValue, validateInput } = useTokenInput({
      token,
      onChange,
      disableBalanceValidation,
    })

    const tokenInputSelector = TokenInputSelector({ token, weight, toggleTokenSelect })
    const footer = hideFooter
      ? undefined
      : TokenInputFooter({ token, value, updateValue, hasPriceImpact, isLoadingPriceImpact })

    const boxShadow = hasValidationError(token) ? `0 0 0 1px ${colors.red[500]}` : undefined

    useEffect(() => {
      if (!isBalancesLoading) {
        validateInput(value || '')
        setInputTitle(value || '')
      }
    }, [value, token?.address, isBalancesLoading])

    return (
      <Box
        borderRadius="md"
        p={['ms', 'md']}
        shadow="innerBase"
        bg="background.level0"
        border="white"
        boxShadow={boxShadow}
        w="full"
        {...boxProps}
      >
        <VStack align="start" spacing="md">
          <InputGroup border="transparent" background="transparent">
            <Box w="full" position="relative">
              <Input
                ref={ref}
                type="number"
                placeholder="0.00"
                autoComplete="off"
                autoCorrect="off"
                min={0}
                border="0px solid transparent"
                bg="transparent"
                shadow="none"
                p="0"
                fontSize="3xl"
                fontWeight="medium"
                value={value}
                title={inputTitle}
                onChange={handleOnChange}
                onKeyDown={blockInvalidNumberInput}
                outline="none"
                boxShadow="none"
                _hover={{
                  border: '0px solid transparent',
                  boxShadow: 'none',
                }}
                _focus={{
                  outline: 'none',
                  border: '0px solid transparent',
                  boxShadow: 'none',
                }}
                {...inputProps}
              />
              <Box
                position="absolute"
                bgGradient="linear(to-r, transparent, background.level0 70%)"
                w="8"
                h="full"
                top={0}
                right={0}
                zIndex={9999}
              ></Box>
            </Box>

            {tokenInputSelector && (
              <InputRightAddon bg="transparent" border="none" p="0" pl="1">
                {tokenInputSelector}
              </InputRightAddon>
            )}
          </InputGroup>
          {footer && footer}
        </VStack>
      </Box>
    )
  }
)
