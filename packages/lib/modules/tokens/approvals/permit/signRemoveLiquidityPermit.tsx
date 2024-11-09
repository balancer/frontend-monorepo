// eslint-disable-next-line max-len
import { constructRemoveBaseBuildCallInput } from '@repo/lib/modules/pool/actions/add-liquidity/handlers/add-liquidity.utils'
import { ensureError } from '@repo/lib/shared/utils/errors'
import {
  Address,
  Permit,
  PermitHelper,
  PublicWalletClient,
  RemoveLiquidityQueryOutput,
} from '@balancer/sdk'
import { isBoosted, isV3WithNestedActionsPool } from '@repo/lib/modules/pool/pool.helpers'
import { Pool } from '@repo/lib/modules/pool/PoolProvider'

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
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    client: sdkClient!,
    owner: permitInput.account,
  }

  if (isV3WithNestedActionsPool(pool)) {
    return PermitHelper.signRemoveLiquidityNestedApproval({
      ...baseParams,
      // TODO: We can inline baseParams if the SDK renames bptAmountIn to bptIn to match the naming with the rest of the output types
      // bptAmountIn: baseInput.bptIn,
    })
  }

  if (isBoosted(pool)) return PermitHelper.signRemoveLiquidityBoostedApproval(baseParams)

  return PermitHelper.signRemoveLiquidityApproval(baseParams)
}
