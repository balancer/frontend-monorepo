import { Pool } from '@repo/lib/modules/pool/PoolProvider'
import { ensureError } from '@repo/lib/shared/utils/errors'
import { get24HoursFromNowInSecs } from '@repo/lib/shared/utils/time'
import {
  AddLiquidityQueryOutput,
  Address,
  Permit2,
  Permit2Helper,
  PublicWalletClient,
  TokenAmount,
} from '@balancer/sdk'
import { HumanTokenAmountWithAddress } from '../../token.types'
import { NoncesByTokenAddress } from './usePermit2Allowance'
import { constructBaseBuildCallInput } from '@repo/lib/modules/pool/actions/add-liquidity/handlers/add-liquidity.utils'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { isWrappedNativeAsset } from '../../token.helpers'
import { isBoosted, isV3WithNestedActionsPool } from '@repo/lib/modules/pool/pool.helpers'

type SignPermit2AddParams = {
  sdkClient?: PublicWalletClient
  pool: Pool
  humanAmountsIn: HumanTokenAmountWithAddress[]
  nonces?: NoncesByTokenAddress
  wethIsEth: boolean
  account: Address
  slippagePercent: string
  sdkQueryOutput?: AddLiquidityQueryOutput
}
export async function signPermit2Add(params: SignPermit2AddParams): Promise<Permit2 | undefined> {
  if (!params.nonces) throw new Error('Missing nonces in signPermitAdd')

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
  account,
  sdkQueryOutput,
  slippagePercent,
  nonces,
}: SignPermit2AddParams): Promise<Permit2> {
  if (!sdkClient) throw new Error('Missing sdkClient')
  if (!nonces) throw new Error('Missing nonces')
  if (!sdkQueryOutput) throw new Error('Missing sdkQueryOutput')

  const baseInput = constructBaseBuildCallInput({
    humanAmountsIn,
    slippagePercent,
    sdkQueryOutput,
    pool,
  })

  let filteredAmountsIn = filterWrappedNativeAsset({
    wethIsEth,
    chain: pool.chain,
    amountsIn: sdkQueryOutput.amountsIn,
  })

  function getSignFn() {
    if (isV3WithNestedActionsPool(pool)) {
      // this edge case fails if you provide an amountIn with zero amount
      filteredAmountsIn = filteredAmountsIn.filter(a => a.amount > 0n)
      return Permit2Helper.signAddLiquidityNestedApproval
    }
    if (isBoosted(pool)) {
      return Permit2Helper.signAddLiquidityBoostedApproval
    }
    return Permit2Helper.signAddLiquidityApproval
  }

  const signature = await getSignFn()({
    ...baseInput,
    client: sdkClient,
    owner: account,
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
      }) as TokenAmount
  )
}

function filterWrappedNativeAsset({
  amountsIn,
  wethIsEth,
  chain,
}: {
  amountsIn: TokenAmount[]
  wethIsEth: boolean
  chain: GqlChain
}): TokenAmount[] {
  if (!wethIsEth) return amountsIn
  return amountsIn.filter(a => {
    return !isWrappedNativeAsset(a.token.address, chain)
  })
}
