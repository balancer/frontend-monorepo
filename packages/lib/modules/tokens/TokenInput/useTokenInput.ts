import { Numberish, bn } from '@repo/lib/shared/utils/numbers'
import { ChangeEvent } from 'react'
import { useTokenBalances } from '../TokenBalancesProvider'
import { useTokenInputsValidation } from '../TokenInputsValidationProvider'
import { Address } from 'viem'
import { ApiToken, CustomToken } from '../token.types'

export function overflowProtected(value: Numberish, decimalLimit: number): string {
  const stringValue = value.toString()
  const [numberSegment, decimalSegment] = stringValue.split('.')

  if (numberSegment && decimalSegment && decimalSegment.length > decimalLimit) {
    const maxLength = numberSegment.length + decimalLimit + 1
    return stringValue.slice(0, maxLength)
  } else return stringValue
}

type Params = {
  token: ApiToken | CustomToken | undefined
  disableBalanceValidation?: boolean
  onChange?: (event: { currentTarget: { value: string } }) => void
}

export function useTokenInput({
  token,
  disableBalanceValidation = false,
  onChange: parentOnChange,
}: Params) {
  const { setValidationError } = useTokenInputsValidation()
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

    if (value && userBalance !== undefined && !disableBalanceValidation) {
      if (bn(value).gt(bn(userBalance.formatted))) {
        return setValidationError(tokenAddress, 'Exceeds balance')
      }
    }

    setValidationError(tokenAddress, '')
  }

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.currentTarget.value
    updateValue(newValue)
  }

  return {
    handleOnChange,
    updateValue,
    validateInput,
  }
}
