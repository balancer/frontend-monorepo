'use client'

import { AlertProps, Text } from '@chakra-ui/react'
import { ErrorAlert } from './ErrorAlert'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { bn } from '@repo/lib/shared/utils/numbers'

type Props = AlertProps & {
  validTokens: ApiToken[]
  humanAmountsIn: HumanTokenAmountWithAddress[]
}

/**
 * if user attempts to add underlying token amount greater than max deposit of erc4626 vault
 */
export function UnderlyingAddError({ humanAmountsIn, validTokens }: Props) {
  const humanUnderlyingAmountsIn = humanAmountsIn.filter(humanAmount =>
    validTokens.some(
      token =>
        token.address === humanAmount.tokenAddress &&
        token.wrappedToken &&
        token.useUnderlyingForAddRemove
    )
  )

  const errorMessages = humanUnderlyingAmountsIn
    .map(humanUnderlyingAmountIn => {
      const wrappedToken = validTokens.find(
        token => humanUnderlyingAmountIn.tokenAddress === token.underlyingToken?.address
      )
      if (!wrappedToken || !wrappedToken.maxDeposit) return undefined
      if (bn(humanUnderlyingAmountIn.humanAmount).gt(bn(wrappedToken.maxDeposit))) {
        return `The maximum amount of ${humanUnderlyingAmountIn.symbol} that can be deposited into ${wrappedToken.name} is currently ${wrappedToken.maxDeposit}`
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
