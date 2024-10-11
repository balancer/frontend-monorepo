// eslint-disable-next-line max-len
import { constructRemoveBaseBuildCallInput } from '@/lib/modules/pool/actions/add-liquidity/handlers/add-liquidity.utils'
import { ensureError } from '@/lib/shared/utils/errors'
import {
  Address,
  Permit,
  PermitHelper,
  PublicWalletClient,
  RemoveLiquidityQueryOutput,
} from '@balancer/sdk'

export interface PermitRemoveLiquidityInput {
  account: Address
  slippagePercent: string
  sdkQueryOutput: RemoveLiquidityQueryOutput
}

type Params = {
  sdkClient?: PublicWalletClient
  permitInput: PermitRemoveLiquidityInput
  wethIsEth: boolean
}
export async function signRemoveLiquidityPermit({
  wethIsEth,
  sdkClient,
  permitInput,
}: Params): Promise<Permit | undefined> {
  if (!sdkClient) return undefined

  try {
    const signature = await signPermit({ permitInput, wethIsEth, sdkClient })
    return signature
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)
    // When the user explicitly rejects in the wallet we return undefined to ignore the error and do nothing
    if (error.name === 'UserRejectedRequestError') return
    throw error
  }
}

async function signPermit({ permitInput, wethIsEth, sdkClient }: Params): Promise<Permit> {
  const baseInput = constructRemoveBaseBuildCallInput({
    wethIsEth,
    slippagePercent: permitInput.slippagePercent,
    sdkQueryOutput: permitInput.sdkQueryOutput as RemoveLiquidityQueryOutput,
  })
  const signature = await PermitHelper.signRemoveLiquidityApproval({
    ...baseInput,
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    client: sdkClient!,
    owner: permitInput.account,
  })
  return signature
}
