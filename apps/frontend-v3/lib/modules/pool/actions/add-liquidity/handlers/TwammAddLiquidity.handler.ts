import { SupportedChainId } from '@/lib/config/config.types'
import { TransactionConfig } from '@/lib/modules/web3/contracts/contract.types'
import { emptyAddress } from '@/lib/modules/web3/contracts/wagmi-helpers'
import { Token, TokenAmount } from '@balancer/sdk'
import { BuildAddLiquidityInput } from '../add-liquidity.types'
import { AddLiquidityHandler } from './AddLiquidity.handler'
import { HumanTokenAmountWithAddress } from '@/lib/modules/tokens/token.types'

/**
 * TwammAddLiquidityHandler is a handler that implements the
 * AddLiquidityHandler interface for TWAMM adds.
 * This is just a fake example to show how to implement edge-case handlers.
 */
export class TwammAddLiquidityHandler implements AddLiquidityHandler {
  humanAmountsIn?: HumanTokenAmountWithAddress[]

  constructor(private chainId: SupportedChainId) {}

  // TODO: This is a non-sense example implementation
  public async simulate(humanAmountsIn: HumanTokenAmountWithAddress[]) {
    this.humanAmountsIn = humanAmountsIn
    const tokenAmount = TokenAmount.fromHumanAmount(
      {} as unknown as Token,
      humanAmountsIn[0]?.humanAmount || '0'
    )
    const bptOut: TokenAmount = tokenAmount
    return { bptOut }
  }

  // TODO: This is a non-sense example implementation
  public async getPriceImpact(humanAmountsIn: HumanTokenAmountWithAddress[]): Promise<number> {
    return Number(humanAmountsIn[0].humanAmount)
  }

  // TODO: This is a non-sense example implementation
  public async buildCallData({ account }: BuildAddLiquidityInput): Promise<TransactionConfig> {
    if (!this.humanAmountsIn || !this.humanAmountsIn[0]) {
      throw new Error(
        `Missing humanAmountsIn.
This probably means that you tried to run build callData before running queryAddLiquidity`
      )
    }

    const value = BigInt(this.humanAmountsIn[0].humanAmount)

    return {
      account,
      chainId: this.chainId,
      data: '0xTwammExample',
      to: emptyAddress,
      value,
    }
  }
}
