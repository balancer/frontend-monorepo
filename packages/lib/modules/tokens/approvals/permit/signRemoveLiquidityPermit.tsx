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
import { isBoosted } from '@repo/lib/modules/pool/pool.helpers'
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

  const signPermitFn = isBoosted(pool)
    ? PermitHelper.signRemoveLiquidityBoostedApproval
    : PermitHelper.signRemoveLiquidityApproval

  const signature = await signPermitFn({
    ...baseInput,
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    client: sdkClient!,
    owner: permitInput.account,
  })
  return signature
}
