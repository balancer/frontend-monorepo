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
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useTokens } from '../TokensProvider'
import { useTokenBalances } from '../TokenBalancesProvider'
import { useTokenInput } from './useTokenInput'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { blockInvalidNumberInput, bn, fNum } from '@repo/lib/shared/utils/numbers'
import { TokenIcon } from '../TokenIcon'
import { useTokenInputsValidation } from '../TokenInputsValidationProvider'
import { ChevronDown } from 'react-feather'
import { WalletIcon } from '@repo/lib/shared/components/icons/WalletIcon'
import { usePriceImpact } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { useEffect, useState } from 'react'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'
import { isNativeAsset } from '@repo/lib/shared/utils/addresses'
import { getPriceImpactLabel } from '../../price-impact/price-impact.utils'
import { ApiToken, CustomToken } from '../token.types'
import { useUserAccount } from '../../web3/UserAccountProvider'

type TokenInputSelectorProps = {
  token: ApiToken | CustomToken | undefined
  weight?: string
  onToggleTokenClicked?: () => void
}

type TokenSelectorConfigProps = {
  label: string
  variant: string
  showIcon: boolean
}

export function TokenInputSelector({
  token,
  weight,
  onToggleTokenClicked,
}: TokenInputSelectorProps) {
  const [tokenConfig, setTokenConfig] = useState<TokenSelectorConfigProps | undefined>(undefined)
  const DEFAULT_TOKEN_LABEL = 'Select token'

  useEffect(() => {
    if (token) {
      setTokenConfig({ label: token.symbol, variant: 'tertiary', showIcon: true })
    } else if (onToggleTokenClicked) {
      setTokenConfig({ label: DEFAULT_TOKEN_LABEL, variant: 'secondary', showIcon: false })
    }
  }, [token])
  const tokenSymbolColor = tokenConfig?.label === DEFAULT_TOKEN_LABEL ? 'font.dark' : 'font.primary'

  return tokenConfig ? (
    <Button
      aria-label={tokenConfig.label}
      cursor={onToggleTokenClicked ? 'pointer' : 'default'}
      justifyContent="space-between"
      onClick={() => onToggleTokenClicked?.()}
      variant={tokenConfig.variant}
      width="full"
    >
      <HStack spacing="sm">
        {tokenConfig && tokenConfig.showIcon && (
          <Box>
            <TokenIcon alt={tokenConfig.label} logoURI={token?.logoURI} size={22} />
          </Box>
        )}
        {tokenConfig && tokenConfig.label && (
          <Text color={tokenSymbolColor} fontWeight="bold">
            {tokenConfig.label}
          </Text>
        )}
      </HStack>
      {weight && (
        <Text fontSize="sm" fontWeight="normal" ml="sm">
          {fNum('weight', weight)}
        </Text>
      )}
      {onToggleTokenClicked && (
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
  token: ApiToken | CustomToken | undefined
  value?: string
  updateValue: (value: string) => void
  hasPriceImpact?: boolean
  isLoadingPriceImpact?: boolean
  priceMessage?: string
  customUserBalance?: string
  isDisabled?: boolean
  customUsdPrice?: number
}

function TokenInputFooter({
  token,
  value,
  updateValue,
  hasPriceImpact,
  isLoadingPriceImpact,
  priceMessage,
  customUserBalance,
  isDisabled,
  customUsdPrice,
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
  const userBalance = customUserBalance || (token ? balance?.formatted || '0' : '0')
  const usdValue =
    value && customUsdPrice
      ? bn(value).times(customUsdPrice).toString()
      : value && token
        ? usdValueForToken(token, value)
        : '0'

  const noBalance = !token || bn(userBalance).isZero()
  const _isNativeAsset = token && isNativeAsset(token.chain, token.address)

  const showPriceImpact = !isLoadingPriceImpact && hasPriceImpact && priceImpact
  const hasDisabledInteraction = noBalance || _isNativeAsset || isDisabled

  function handleBalanceClick() {
    // We return for _isNativeAsset because you can't use your full native asset
    // balance, you need to save some for a swap.
    if (hasDisabledInteraction) return

    if (value && bn(value).eq(userBalance)) {
      updateValue('')
    } else {
      updateValue(userBalance)
    }
  }

  return (
    <HStack h="4" justify="space-between" w="full">
      {isBalancesLoading || !isMounted ? (
        <Skeleton h="full" w="12" />
      ) : (
        <Text
          color={showPriceImpact ? priceImpactColor : 'font.secondary'}
          fontSize="sm"
          opacity={!priceMessage && usdValue === '0' ? 0.5 : 1}
          variant="secondary"
        >
          {priceMessage ? priceMessage : toCurrency(usdValue, { abbreviated: false })}
          {showPriceImpact && priceImpactLevel !== 'unknown' && getPriceImpactLabel(priceImpact)}
        </Text>
      )}
      {isBalancesLoading || !isMounted ? (
        <Skeleton h="full" w="12" />
      ) : (
        <HStack
          _hover={hasDisabledInteraction ? {} : { color: 'font.highlight' }}
          color={inputLabelColor}
          cursor={hasDisabledInteraction ? 'default' : 'pointer'}
          gap="xs"
          onClick={handleBalanceClick}
          title="Use wallet balance"
        >
          {hasError && (
            <Text color="inherit" fontSize="sm">
              {getValidationError(token)}
            </Text>
          )}
          <Text color={noBalance ? 'font.error' : 'inherit'} fontSize="sm">
            {fNum('token', userBalance, { abbreviated: false })}
          </Text>
          <Box color={noBalance ? 'font.error' : undefined}>
            <WalletIcon size={16} />
          </Box>
        </HStack>
      )}
    </HStack>
  )
}

type Props = {
  address?: string
  apiToken?: ApiToken | CustomToken
  chain?: GqlChain | number
  weight?: string
  value?: string
  boxProps?: BoxProps
  onChange?: (event: { currentTarget: { value: string } }) => void
  onToggleTokenClicked?: () => void
  hasPriceImpact?: boolean
  isLoadingPriceImpact?: boolean
  priceMessage?: string
  disableBalanceValidation?: boolean
  customUserBalance?: string
  customUsdPrice?: number
}

export const TokenInput = forwardRef(
  (
    {
      address,
      apiToken,
      chain,
      weight,
      value,
      boxProps,
      onChange,
      onToggleTokenClicked,
      hasPriceImpact = false,
      isLoadingPriceImpact = false,
      priceMessage,
      disableBalanceValidation = false,
      customUserBalance,
      customUsdPrice,
      ...inputProps
    }: InputProps & Props,
    ref
  ) => {
    const { userAddress } = useUserAccount()
    const { isBalancesLoading } = useTokenBalances()

    const [inputTitle, setInputTitle] = useState<string>('')

    const { colors } = useTheme()
    const { getToken } = useTokens()
    const tokenFromAddress = address && chain ? getToken(address, chain) : undefined

    const token = apiToken || tokenFromAddress

    const { hasValidationError } = useTokenInputsValidation()

    const { handleOnChange, updateValue, validateInput } = useTokenInput({
      token,
      onChange,
      disableBalanceValidation,
    })

    const boxShadow = hasValidationError(token) ? `0 0 0 1px ${colors.red[500]}` : undefined

    useEffect(() => {
      if (!isBalancesLoading) {
        validateInput(value || '')
        setInputTitle(value || '')
      }
    }, [value, token?.address, isBalancesLoading, userAddress])

    return (
      <Box
        bg="background.level0"
        border="white"
        borderRadius="md"
        boxShadow={boxShadow}
        p={['ms', 'md']}
        shadow="innerBase"
        w="full"
        {...boxProps}
      >
        <VStack align="start" spacing="md">
          <InputGroup background="transparent" border="transparent">
            <Box position="relative" w="full">
              <Input
                _focus={{
                  outline: 'none',
                  border: '0px solid transparent',
                  boxShadow: 'none',
                }}
                _hover={{
                  border: '0px solid transparent',
                  boxShadow: 'none',
                }}
                autoComplete="off"
                autoCorrect="off"
                bg="transparent"
                border="0px solid transparent"
                boxShadow="none"
                fontSize="3xl"
                fontWeight="medium"
                isDisabled={!token}
                min={0}
                onChange={handleOnChange}
                onKeyDown={blockInvalidNumberInput}
                onWheel={e => {
                  // Avoid changing the input value when scrolling
                  return e.currentTarget.blur()
                }}
                outline="none"
                p="0"
                placeholder="0.00"
                ref={ref}
                shadow="none"
                step="any"
                title={inputTitle}
                type="number"
                value={value}
                {...inputProps}
              />
              {token && (
                <Box
                  bgGradient="linear(to-r, transparent, background.level0 70%)"
                  h="full"
                  position="absolute"
                  right={0}
                  top={0}
                  w="8"
                  zIndex={9999}
                />
              )}
            </Box>

            <InputRightAddon bg="transparent" border="none" p="0" pl="1">
              <TokenInputSelector
                onToggleTokenClicked={onToggleTokenClicked}
                token={token}
                weight={weight}
              />
            </InputRightAddon>
          </InputGroup>

          <TokenInputFooter
            customUsdPrice={customUsdPrice}
            customUserBalance={customUserBalance}
            hasPriceImpact={hasPriceImpact}
            isDisabled={inputProps.isDisabled}
            isLoadingPriceImpact={isLoadingPriceImpact}
            priceMessage={priceMessage}
            token={token}
            updateValue={updateValue}
            value={value}
          />
        </VStack>
      </Box>
    )
  }
)
