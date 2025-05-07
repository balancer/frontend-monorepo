import {
  Address,
  Permit,
  PermitHelper,
  PublicWalletClient,
  RemoveLiquidityNestedQueryOutput,
  RemoveLiquidityQueryOutput,
} from '@balancer/sdk'
import { constructRemoveBaseBuildCallInput } from '@repo/lib/modules/pool/actions/add-liquidity/handlers/add-liquidity.utils'
import { isBoosted, isV3WithNestedActionsPool } from '@repo/lib/modules/pool/pool.helpers'
import { Pool } from '@repo/lib/modules/pool/pool.types'
import { ensureError } from '@repo/lib/shared/utils/errors'

export interface PermitRemoveLiquidityInput {
  account: Address
  slippagePercent: string
  sdkQueryOutput: RemoveLiquidityQueryOutput
}

type Params = {
  sdkClient?: PublicWalletClient
  permitInput: PermitRemoveLiquidityInput
  wethIsEth: boolean
  pool: Pool
}
export async function signRemoveLiquidityPermit({
  wethIsEth,
  sdkClient,
  permitInput,
  pool,
}: Params): Promise<Permit | undefined> {
  if (!sdkClient) return undefined

  try {
    const signature = await signPermit({ permitInput, wethIsEth, sdkClient, pool })
    return signature
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)
    // When the user explicitly rejects in the wallet we return undefined to ignore the error and do nothing
    if (error.name === 'UserRejectedRequestError') return
    throw error
  }
}

async function signPermit({ permitInput, wethIsEth, sdkClient, pool }: Params): Promise<Permit> {
  const baseInput = constructRemoveBaseBuildCallInput({
    wethIsEth,
    slippagePercent: permitInput.slippagePercent,
    sdkQueryOutput: permitInput.sdkQueryOutput as RemoveLiquidityQueryOutput,
  })

  const baseParams = {
    ...baseInput,

    client: sdkClient!,
    owner: permitInput.account,
  }

  if (isV3WithNestedActionsPool(pool)) {
    // Cast to unknown to avoid type assertion as this concrete case has a very specific type
    // that requires bptAmountIn (when others don't)
    const nestedOutput = permitInput.sdkQueryOutput as unknown as RemoveLiquidityNestedQueryOutput

    return PermitHelper.signRemoveLiquidityNestedApproval({
      ...baseParams,
      bptAmountIn: nestedOutput.bptAmountIn,
    })
  }

  if (isBoosted(pool)) return PermitHelper.signRemoveLiquidityBoostedApproval(baseParams)

  return PermitHelper.signRemoveLiquidityApproval(baseParams)
}
