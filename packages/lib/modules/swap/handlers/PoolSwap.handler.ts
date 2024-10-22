import { Path, TokenApi } from '@balancer/sdk'
import { GqlSorSwapType, GqlToken } from '@repo/lib/shared/services/api/generated/graphql'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { Hex, parseUnits } from 'viem'
import { ProtocolVersion } from '../../pool/pool.types'
import { SdkSimulateSwapResponse, SimulateSwapInputs } from '../swap.types'
import { BaseDefaultSwapHandler } from './BaseDefaultSwap.handler'

export class PoolSwapHandler extends BaseDefaultSwapHandler {
  name = 'PoolSwapHandler'

  constructor(
    public poolId: Hex,
    public tokens: GqlToken[],
    public poolVersion: ProtocolVersion,
  ) {
    super()
  }

  async simulate({ ...variables }: SimulateSwapInputs): Promise<SdkSimulateSwapResponse> {
    const { swapType, swapAmount } = variables

    const tokenIn = this.tokens.find(token => isSameAddress(token.address, variables.tokenIn))

    if (!tokenIn) {
      throw new Error('TokenIn not found in pool swap handler')
    }

    const tokenOut = this.tokens.find(token => isSameAddress(token.address, variables.tokenOut))

    if (!tokenOut) {
      throw new Error('TokenIn not found in pool swap handler')
    }

    const inputAmountRaw: bigint =
      swapType === GqlSorSwapType.ExactIn ? parseUnits(swapAmount, tokenIn.decimals) : 0n
    const outputAmountRaw: bigint =
      swapType === GqlSorSwapType.ExactOut ? parseUnits(swapAmount, tokenOut.decimals) : 0n

    const poolPath: Path = {
      pools: [this.poolId],
      inputAmountRaw,
      outputAmountRaw,
      protocolVersion: this.poolVersion,
      tokens: [tokenIn as TokenApi, tokenOut as TokenApi],
    }

    const paths = [poolPath]

    return this.runSimulation({
      protocolVersion: this.poolVersion,
      paths,
      hopCount: 1,
      swapInputs: variables,
    })
  }
}
