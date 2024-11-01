import {
  Address,
  ExactInQueryOutput,
  ExactOutQueryOutput,
  Permit2,
  Permit2Helper,
  PublicWalletClient,
  Slippage,
  SwapKind,
} from '@balancer/sdk'
import { ensureError } from '@repo/lib/shared/utils/errors'
import { get24HoursFromNowInSecs } from '@repo/lib/shared/utils/time'
import { NoncesByTokenAddress } from './usePermit2Allowance'
import { TokenAmountIn } from './useSignPermit2'

type SignPermit2SwapParams = {
  sdkClient?: PublicWalletClient
  nonces?: NoncesByTokenAddress
  wethIsEth: boolean
  account: Address
  slippagePercent: string
  queryOutput: ExactInQueryOutput | ExactOutQueryOutput
  tokenIn?: TokenAmountIn
}
export async function signPermit2Swap(params: SignPermit2SwapParams): Promise<Permit2 | undefined> {
  if (!params.nonces) throw new Error('Missing nonces in signPermitSwap')
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
  queryOutput,
  slippagePercent,
  nonces,
  tokenIn,
  wethIsEth,
}: SignPermit2SwapParams): Promise<Permit2> {
  if (!sdkClient) throw new Error('Missing sdkClient')
  if (!nonces) throw new Error('Missing nonces')
  if (!tokenIn) throw new Error('Missing token in')

  // Instead of MaxAllowanceTransferAmount(MaxUint160) we use MaxUint159 to avoid overflow issues
  const MaxUint159 = BigInt('0x7fffffffffffffffffffffffffffffffffffffff')
  const MaxAllowance = MaxUint159

  const maximizedQueryOutput = { ...queryOutput }
  if (maximizedQueryOutput.swapKind === SwapKind.GivenIn)
    {maximizedQueryOutput.amountIn.amount = MaxAllowance}
  if (maximizedQueryOutput.swapKind === SwapKind.GivenOut)
    {maximizedQueryOutput.amountOut.amount = MaxAllowance}

  const signature = await Permit2Helper.signSwapApproval({
    client: sdkClient,
    owner: account,
    nonce: nonces[tokenIn.address],
    // Permit2 allowance expires in 24H
    expiration: get24HoursFromNowInSecs(),
    queryOutput: maximizedQueryOutput,
    wethIsEth,
    slippage: Slippage.fromPercentage(`${Number(slippagePercent)}`),
  })

  return signature
}
