import { isAddress, zeroAddress } from 'viem'
import {
  MIN_SWAP_FEE_PERCENTAGE,
  MAX_SWAP_FEE_PERCENTAGE,
  MIN_AMPLIFICATION_PARAMETER,
  MAX_AMPLIFICATION_PARAMETER,
  SupportedPoolTypes,
} from './constants'

export class PoolSettingsValidator {
  static poolHooksContract = (
    value: string,
    isValidPoolHooksContract: boolean | undefined,
    isLoadingPoolHooksContract: boolean
  ) => {
    if (value === '') return false
    if (value === zeroAddress) return true
    if (isLoadingPoolHooksContract) return true
    if (value && !isAddress(value)) return 'Invalid address'
    if (value && !isValidPoolHooksContract) return 'Invalid pool hooks contract'
    return true
  }

  static pauseManager = (value: string) => {
    if (!isAddress(value)) return 'Invalid address'
    return true
  }

  static swapFeeManager = (value: string) => {
    if (!isAddress(value)) return 'Invalid address'
    return true
  }

  static swapFeePercentage = (value: string, poolType: SupportedPoolTypes) => {
    const numValue = Number(value)
    if (numValue < MIN_SWAP_FEE_PERCENTAGE[poolType] || numValue > MAX_SWAP_FEE_PERCENTAGE)
      return `Value must be between ${MIN_SWAP_FEE_PERCENTAGE[poolType]} and ${MAX_SWAP_FEE_PERCENTAGE}`
    return true
  }

  static amplificationParameter = (value: string) => {
    const numValue = Number(value)
    if (numValue < MIN_AMPLIFICATION_PARAMETER || numValue > MAX_AMPLIFICATION_PARAMETER)
      return `Value must be between ${MIN_AMPLIFICATION_PARAMETER} and ${MAX_AMPLIFICATION_PARAMETER}`
    return true
  }
}
