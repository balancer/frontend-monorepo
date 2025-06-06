import { ensureError } from '@repo/lib/shared/utils/errors'
import { Address, Permit2, Permit2Helper, PublicWalletClient, InitPoolInputV3 } from '@balancer/sdk'

type SignPermit2InitParams = {
  sdkClient?: PublicWalletClient
  account: Address
  initPoolInput: InitPoolInputV3
}

export async function signPermit2Init(params: SignPermit2InitParams): Promise<Permit2 | undefined> {
  try {
    const signature = await sign(params)
    return signature
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)
    // When the user explicitly rejects in the wallet we return undefined to ignore the error and do nothing
    if (error.name === 'UserRejectedRequestError') return
    throw error
  }
}

async function sign({
  sdkClient,
  account,
  initPoolInput,
}: SignPermit2InitParams): Promise<Permit2> {
  if (!sdkClient) throw new Error('Missing sdkClient')

  const signature = await Permit2Helper.signInitPoolApproval({
    ...initPoolInput,
    client: sdkClient,
    owner: account,
  })

  return signature
}
