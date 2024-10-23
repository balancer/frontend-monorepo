/* eslint-disable max-len */
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { WalletIcon } from '@repo/lib/shared/components/icons/WalletIcon'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { Card, HStack, Spacer, VStack, Text, Box, Tooltip } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { XOctagon } from 'react-feather'
import { useAddLiquidity } from '../AddLiquidityProvider'
import { TokenInputs } from './TokenInputs'
import { useProportionalInputs } from './useProportionalInputs'
import { useMaximumInputs } from './useMaximumInputs'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { hasNoLiquidity } from '../../LiquidityActionHelpers'
import { usePool } from '../../../PoolProvider'

type Props = {
  tokenSelectDisclosureOpen: () => void
  requiresProportionalInput: boolean
  totalUSDValue: string
}

export function TokenInputsWithAddable({
  tokenSelectDisclosureOpen,
  requiresProportionalInput,
  totalUSDValue,
}: Props) {
  const { isConnected } = useUserAccount()
  const { toCurrency } = useCurrency()
  const { setHumanAmountIn } = useAddLiquidity()
  const [wantsProportional, setWantsProportional] = useState(false)

  const {
    handleProportionalHumanInputChange,
    handleMaximizeUserAmounts: handleMaximizeUserAmountsForProportionalInput,
    isMaximized: isMaximizedForProportionalInput,
    maximizedUsdValue: maximizedUsdValueForProportionalInput,
    canMaximize: canMaximizeForProportionalInput,
    setIsMaximized: setIsMaximizedForProportionalInput,
    clearAmountsIn,
  } = useProportionalInputs()
  const { pool } = usePool()

  const {
    canMaximize: canMaximizeForMaximumInput,
    isMaximized: isMaximizedForMaximumInput,
    maximizedUsdValue: maximizedUsdValueForMaximumInput,
    handleMaximizeUserAmounts: handleMaximizeUserAmountsForMaximumInput,
    setIsMaximized: setIsMaximizedForMaximumInput,
  } = useMaximumInputs()

  const isProportional = requiresProportionalInput || wantsProportional

  const handleMaximizeUserAmounts = isProportional
    ? handleMaximizeUserAmountsForProportionalInput
    : handleMaximizeUserAmountsForMaximumInput

  const isMaximized = isProportional ? isMaximizedForProportionalInput : isMaximizedForMaximumInput

  const maximizedUsdValue = isProportional
    ? maximizedUsdValueForProportionalInput
    : maximizedUsdValueForMaximumInput

  const canMaximize = isProportional ? canMaximizeForProportionalInput : canMaximizeForMaximumInput

  const setIsMaximized = isProportional
    ? setIsMaximizedForProportionalInput
    : setIsMaximizedForMaximumInput

  const setAmountIn = isProportional ? handleProportionalHumanInputChange : setHumanAmountIn

  useEffect(() => {
    if (totalUSDValue !== maximizedUsdValue) {
      setIsMaximized(false)
    } else {
      setIsMaximized(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalUSDValue, wantsProportional])

  function handleWantsProportional() {
    setWantsProportional(!wantsProportional)
    clearAmountsIn()
  }

  return (
    <VStack spacing="md" w="full">
      {requiresProportionalInput && !hasNoLiquidity(pool) && (
        <BalAlert content="This pool requires liquidity to be added proportionally" status="info" />
      )}
      {isConnected && (
        <Card p={['sm', 'ms']} variant="subSection" w="full">
          <HStack w="full">
            <Box as="span" color="grayText">
              <WalletIcon size={18} />
            </Box>
            <HStack spacing="xs">
              {!requiresProportionalInput && canMaximizeForProportionalInput ? (
                <Text color="grayText" fontSize="sm">
                  <Box
                    as="span"
                    color="font.highlight"
                    cursor="pointer"
                    onClick={handleWantsProportional}
                  >
                    {`${wantsProportional ? 'Proportional ' : 'Total '}`}
                  </Box>
                  addable pool tokens
                </Text>
              ) : (
                <Text color="grayText" fontSize="sm">
                  Addable pool tokens
                </Text>
              )}
            </HStack>
            <Spacer />
            {canMaximize && (
              <>
                <Text color="grayText" fontSize="sm">
                  {toCurrency(maximizedUsdValue, { abbreviated: false })}
                </Text>
                {isMaximized && (
                  <Text color="grayText" cursor="not-allowed" fontSize="sm" opacity="0.5">
                    Maxed
                  </Text>
                )}
                {!isMaximized && (
                  <Text
                    color="font.highlight"
                    cursor="pointer"
                    fontSize="sm"
                    onClick={() => handleMaximizeUserAmounts()}
                  >
                    Max
                  </Text>
                )}
              </>
            )}
            {!canMaximize && (
              <Tooltip
                label={
                  requiresProportionalInput
                    ? 'For pools that require proportional liquidity, you need a balance above zero for every token in order to add any liquidity.'
                    : 'You have no eligible tokens that can be added to this pool. Go swap to get at least one pool token. '
                }
              >
                <HStack>
                  <Text color="red.400" fontSize="sm">
                    {toCurrency('0', { abbreviated: false })}
                  </Text>
                  <Box color="red.400">
                    <XOctagon size={14} />
                  </Box>
                </HStack>
              </Tooltip>
            )}
          </HStack>
        </Card>
      )}
      <TokenInputs
        customSetAmountIn={setAmountIn}
        tokenSelectDisclosureOpen={tokenSelectDisclosureOpen}
      />
    </VStack>
  )
}
