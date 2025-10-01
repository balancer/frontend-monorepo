'use client'

import { AlertProps, Text } from '@chakra-ui/react'
import { ErrorAlert } from './ErrorAlert'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { bn } from '@repo/lib/shared/utils/numbers'

type Props = AlertProps & {
  validTokens: ApiToken[]
  amountsOut: HumanTokenAmountWithAddress[]
}

/**
 * if user attempts to remove underlying token amount greater than max withdraw of erc4626 vault
 */
export function UnderlyingRemoveError({ amountsOut, validTokens }: Props) {
  const humanUnderlyingAmountsOut = amountsOut.filter(humanAmount =>
    validTokens.some(
      token =>
        token.address === humanAmount.tokenAddress &&
        token.wrappedToken &&
        token.useUnderlyingForAddRemove
    )
  )

  const errorMessages = humanUnderlyingAmountsOut
    .map(humanUnderlyingAmountOut => {
      const underlyingToken = validTokens.find(
        token => humanUnderlyingAmountOut.tokenAddress === token.address
      )
      const wrappedToken = underlyingToken?.wrappedToken
      if (!underlyingToken || !wrappedToken || !underlyingToken?.maxWithdraw) return undefined
      if (bn(humanUnderlyingAmountOut.humanAmount).gt(bn(underlyingToken.maxWithdraw))) {
        return `The maximum amount of ${underlyingToken?.symbol} that can be withdrawn from the ${wrappedToken.symbol} vault is currently ${wrappedToken.maxWithdraw}`
      }
    })
    .filter((message): message is string => message !== undefined)

  return errorMessages.length > 0 ? (
    <>
      {errorMessages.map(errorMessage => (
        <ErrorAlert key={errorMessage} title="Amount exceeds market limits">
          <Text color="black" variant="secondary">
            {errorMessage}
          </Text>
        </ErrorAlert>
      ))}
    </>
  ) : null
}
