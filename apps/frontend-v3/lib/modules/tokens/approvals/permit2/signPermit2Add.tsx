import { Pool } from '@/lib/modules/pool/PoolProvider'
import { ensureError } from '@/lib/shared/utils/errors'
import { get24HoursFromNowInSecs } from '@/lib/shared/utils/time'
import {
  AddLiquidityBaseQueryOutput,
  AddLiquidityQueryOutput,
  Address,
  Permit2,
  Permit2Helper,
  PublicWalletClient,
  TokenAmount,
} from '@balancer/sdk'
import { HumanTokenAmountWithAddress } from '../../token.types'
import { NoncesByTokenAddress } from './usePermit2Allowance'
import { constructBaseBuildCallInput } from '@/lib/modules/pool/actions/add-liquidity/handlers/add-liquidity.utils'
import { filterWrappedNativeAsset } from '../../token.helpers'

export interface Permit2AddLiquidityInput {
  account: Address
  slippagePercent: string
  sdkQueryOutput: AddLiquidityQueryOutput
}

type SignPermit2Params = {
  sdkClient?: PublicWalletClient
  pool: Pool
  humanAmountsIn: HumanTokenAmountWithAddress[]
  permit2Input: Permit2AddLiquidityInput
  nonces: NoncesByTokenAddress
  wethIsEth: boolean
}
export async function signPermit2Add(params: SignPermit2Params): Promise<Permit2 | undefined> {
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
  pool,
  humanAmountsIn,
  wethIsEth,
  permit2Input,
  nonces,
}: SignPermit2Params): Promise<Permit2> {
  if (!sdkClient) throw new Error('Missing sdkClient')
  const baseInput = constructBaseBuildCallInput({
    humanAmountsIn,
    slippagePercent: permit2Input.slippagePercent,
    sdkQueryOutput: permit2Input.sdkQueryOutput as AddLiquidityBaseQueryOutput,
    pool,
  })

  const filteredAmountsIn = filterWrappedNativeAsset({
    wethIsEth,
    chain: pool.chain,
    amountsIn: baseInput.amountsIn,
  })

  const signature = await Permit2Helper.signAddLiquidityApproval({
    ...baseInput,
    client: sdkClient,
    owner: permit2Input.account,
    nonces: filteredAmountsIn.map(a => nonces[a.token.address]),
    amountsIn: maximizePositiveAmounts(filteredAmountsIn),
    // Permit2 allowance expires in 24H
    expirations: filteredAmountsIn.map(() => get24HoursFromNowInSecs()),
  })

  return signature
}

// Instead of MaxAllowanceTransferAmount(MaxUint160) we use MaxUint159 to avoid overflow issues
const MaxUint159 = BigInt('0x7fffffffffffffffffffffffffffffffffffffff')
const MaxAllowance = MaxUint159

// Maximize amounts for permit2 approval for amounts > 0n
function maximizePositiveAmounts(amountsIn: TokenAmount[]): TokenAmount[] {
  return amountsIn.map(
    item =>
      ({
        ...item,
        amount: item.amount > 0n ? MaxAllowance : item.amount,
      } as TokenAmount)
  )
}
