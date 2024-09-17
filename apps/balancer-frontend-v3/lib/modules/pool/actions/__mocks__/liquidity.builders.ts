import { balAddress } from '@/lib/debug-helpers'
import { TokenAmount, Token, HumanAmount } from '@balancer/sdk'
import { Address, parseUnits } from 'viem'
import { mock } from 'vitest-mock-extended'

export function aTokenAmountMock(tokenAddress: Address, amount: HumanAmount): TokenAmount {
  const defaultTokenAmount: TokenAmount = mock<TokenAmount>({
    amount: parseUnits(amount, 18),
    token: aToken({ address: tokenAddress }),
  })
  return Object.assign({}, defaultTokenAmount)
}

export function aToken(options?: Partial<Token>): Token {
  const defaultToken = mock<Token>({
    address: balAddress,
    chainId: 1,
    decimals: 18,
    symbol: 'Test token',
  })

  return Object.assign({}, defaultToken, options)
}
