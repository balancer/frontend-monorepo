import { HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { sepoliaTestPublicClient } from '@repo/test/utils/wagmi/wagmi-test-clients'
import { Pool } from '../../../pool.types'
import { NestedAddLiquidityV3Handler } from './NestedAddLiquidityV3.handler'
import { selectAddLiquidityHandler } from './selectAddLiquidityHandler'
import { fetchPoolMock } from '../../../__mocks__/fetchPoolMock'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { BALANCER_COMPOSITE_LIQUIDITY_ROUTER_NESTED } from '@balancer/sdk'
import { getChainId } from '@repo/lib/config/app.config'

function selectNestedHandler(pool: Pool) {
  return selectAddLiquidityHandler(pool) as NestedAddLiquidityV3Handler
}

const wethAddress = '0x7b79995e5f793a07bc00c21412e50ecae098e7f9'
const usdcAaveAddress = '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8' // Sepolia underlying usdcAave faucet address
const usdtAaveAddress = '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0' // Sepolia underlying usdcAave faucet address
const poolId = '0x693cc6a39bbf35464f53d6a5dbf7d6c2fa93741c' // Boosted Aave USDC-USDT / WETH
const chain = GqlChain.Sepolia
const nestedPool = await fetchPoolMock({ poolId, chain })

// Unskip when sepolia V3 pools are available in production api
describe('When adding nested liquidity for a weighted pool', () => {
  test('has zero price impact', async () => {
    const handler = selectNestedHandler(nestedPool)

    const humanAmountsIn: HumanTokenAmountWithSymbol[] = [
      { humanAmount: '100', tokenAddress: usdcAaveAddress, symbol: 'USDC' },
    ]
    const priceImpact = await handler.getPriceImpact(humanAmountsIn)
    expect(priceImpact).toBeGreaterThan(0)
  })

  test('with single token input', async () => {
    const handler = selectNestedHandler(nestedPool)

    const humanAmountsIn: HumanTokenAmountWithSymbol[] = [
      { humanAmount: '1', tokenAddress: usdcAaveAddress, symbol: 'USDC' },
    ]

    const result = await handler.simulate(humanAmountsIn, defaultTestUserAccount)

    expect(result.bptOut.amount).toBeGreaterThan(0n)
  })

  test('with multiple token input', async () => {
    const handler = selectNestedHandler(nestedPool)

    const humanAmountsIn: HumanTokenAmountWithSymbol[] = [
      { humanAmount: '0.1', tokenAddress: wethAddress, symbol: 'WETH' },
      { humanAmount: '0.1', tokenAddress: usdcAaveAddress, symbol: 'USDC' },
      { humanAmount: '0.1', tokenAddress: usdtAaveAddress, symbol: 'USDT' },
    ]

    const result = await handler.simulate(humanAmountsIn, defaultTestUserAccount)

    expect(result.bptOut.amount).toBeGreaterThan(0n)
  })

  test('builds Tx Config', async () => {
    const humanAmountsIn: HumanTokenAmountWithSymbol[] = [
      { humanAmount: '1', tokenAddress: usdcAaveAddress, symbol: 'USDC' },
    ]

    const handler = selectNestedHandler(nestedPool)

    // Store query response in handler instance
    const queryOutput = await handler.simulate(humanAmountsIn, defaultTestUserAccount)

    const result = await handler.buildCallData({
      humanAmountsIn,
      account: defaultTestUserAccount,
      slippagePercent: '0.2',
      queryOutput: queryOutput,
    })

    expect(result.to).toBe(BALANCER_COMPOSITE_LIQUIDITY_ROUTER_NESTED[getChainId(chain)])
    expect(result.data).toBeDefined()
    expect(result.account).toBe(defaultTestUserAccount)

    const { account, data, to, value } = result

    const hash = await sepoliaTestPublicClient.sendTransaction({
      account,
      chain: sepoliaTestPublicClient.chain,
      data,
      to,
      value,
    })

    const transactionReceipt = await sepoliaTestPublicClient.waitForTransactionReceipt({
      hash,
    })

    expect(transactionReceipt).toBeDefined()
  })
})
