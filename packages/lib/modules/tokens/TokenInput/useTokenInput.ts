import { Numberish, bn, isBnParseable } from '@repo/lib/shared/utils/numbers'
import { ChangeEvent } from 'react'
import { useTokenBalances } from '../TokenBalancesProvider'
import { useTokenInputsValidation } from '../TokenInputsValidationProvider'
import { Address } from 'viem'
import { ApiOrCustomToken } from '../token.types'

export function overflowProtected(value: Numberish, decimalLimit: number): string {
  const stringValue = value.toString()
  const [numberSegment, decimalSegment] = stringValue.split('.')

  if (numberSegment && decimalSegment && decimalSegment.length > decimalLimit) {
    const maxLength = numberSegment.length + decimalLimit + 1
    return stringValue.slice(0, maxLength)
  } else return stringValue
}

export function cleanAmountInput(newValue: string): string {
  let cleanValue = newValue.replace(',', '.')
  cleanValue = cleanValue.replace(/[^\d.]/g, '')
  let separators = 0 // Keep only the first decimal separator, drop any extras (e.g. pasted '1.2.3')
  cleanValue = cleanValue.replace(/\./g, () => (separators++ === 0 ? '.' : ''))
  // A bare leading separator ('.') is not parseable by BigNumber and would crash downstream
  if (cleanValue.startsWith('.')) cleanValue = '0' + cleanValue

  return cleanValue
}

type Params = {
  token: ApiOrCustomToken | undefined
  disableBalanceValidation?: boolean
  onChange?: (event: { currentTarget: { value: string } }) => void
}

const EXCEEDS_BALANCE_ERROR = 'Exceeds balance'

export function useTokenInput({
  token,
  disableBalanceValidation = false,
  onChange: parentOnChange,
}: Params) {
  const { setValidationError, removeValidationErrors } = useTokenInputsValidation()
  const { balanceFor } = useTokenBalances()

  function updateValue(value: string) {
    const safeValue = overflowProtected(value, token?.decimals || 18)

    if (parentOnChange) {
      parentOnChange({ currentTarget: { value: safeValue } })
    }
  }

  function validateInput(value: string) {
    if (!token) return
    const tokenAddress = token.address as Address
    const userBalance = balanceFor(tokenAddress)

    removeValidationErrors(tokenAddress, [EXCEEDS_BALANCE_ERROR])

    if (value && isBnParseable(value) && userBalance !== undefined && !disableBalanceValidation) {
      if (bn(value).gt(bn(userBalance.formatted))) {
        return setValidationError(tokenAddress, EXCEEDS_BALANCE_ERROR)
      }
    }
  }

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateValue(cleanAmountInput(event.currentTarget.value))
  }

  return {
    handleOnChange,
    updateValue,
    validateInput,
  }
}
