import { InputAmount, InitPoolInputV3 } from '@balancer/sdk'

export type InputAmountWithSymbol = InputAmount & { symbol: string }

export type ExtendedInitPoolInputV3 = Omit<InitPoolInputV3, 'amountsIn'> & {
  amountsIn: InputAmountWithSymbol[]
}
