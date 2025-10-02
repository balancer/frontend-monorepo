'use client'

import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { BalAlert } from '../../../shared/components/alerts/BalAlert'

type Props = {
  validTokens: ApiToken[]
  amounts: HumanTokenAmountWithAddress[]
  operation: 'add' | 'remove'
}

export function UnderlyingLiqudityOperationWarning({ amounts, validTokens, operation }: Props) {
  const humanUnderlyingAmounts = amounts.filter(humanAmount =>
    validTokens.some(
      token =>
        token.address === humanAmount.tokenAddress &&
        token.wrappedToken &&
        token.useUnderlyingForAddRemove
    )
  )

  const errors = humanUnderlyingAmounts
    .map(({ tokenAddress, humanAmount, symbol: amountSymbol }) => {
      if (operation === 'add') {
        const wrappedToken = validTokens.find(
          validToken => tokenAddress === validToken.underlyingToken?.address
        )
        const { maxDeposit: maxAmount, symbol: vaultSymbol } = wrappedToken ?? {}
        if (!maxAmount || !bn(humanAmount).gt(bn(maxAmount))) return null
        return { amountSymbol, vaultSymbol, maxAmount }
      } else {
        const underlyingToken = validTokens.find(validToken => tokenAddress === validToken.address)
        const { maxWithdraw: maxAmount, symbol: amountSymbol, wrappedToken } = underlyingToken ?? {}
        console.log('maxAmount', maxAmount)
        const { symbol: vaultSymbol } = wrappedToken ?? {}
        if (!maxAmount || !bn(humanAmount).gt(bn(maxAmount))) return null
        return { amountSymbol, vaultSymbol, maxAmount }
      }
    })
    .filter((data): data is NonNullable<typeof data> => data !== null)

  return errors.length > 0
    ? errors.map(({ amountSymbol, maxAmount, vaultSymbol }, idx) => (
        <BalAlert
          content={`The maximum ${operation === 'add' ? 'deposit' : 'withdraw'} amount for the ${vaultSymbol} vault is currently ${fNum('integer', maxAmount)} ${amountSymbol}`}
          key={idx}
          status="warning"
          title="Amount exceeds market limits"
        />
      ))
    : null
}
