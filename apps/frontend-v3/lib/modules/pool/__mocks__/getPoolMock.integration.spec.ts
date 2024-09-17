import { gyro2CLP_USDC_DAI, recoveryModePoolId } from '@/lib/debug-helpers'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { getPoolMock } from './getPoolMock'

/**
  Use these tests to manually create/update pool mocks
  Examples of pool mocks used by our tests:
    /lib/modules/pool/__mocks__/...
  We could eventually automate the mock generation by saving the results but we manually copy-paste them for now
*/
describe.skip('Fetch pool data for mock definition', () => {
  // DAO-st-WMATIC
  const polygonNestedId =
    '0x60f46b189736c0d2ae52a79382b64c1e2a86b0d9000200000000000000000cc4' as const
  test('Generate polygon nested pool mock', async () => {
    const pool = await getPoolMock(polygonNestedId, GqlChain.Polygon)

    console.log(JSON.stringify(pool))
  })

  test('Generate mainnet nested pool mock', async () => {
    const mainnetNestedPoolId = '0x08775ccb6674d6bdceb0797c364c2653ed84f3840002000000000000000004f0' // Balancer 50WETH-50-3pool
    const pool = await getPoolMock(mainnetNestedPoolId, GqlChain.Mainnet)

    console.log(JSON.stringify(pool))
  })

  test('Generate gyro2 pool mock', async () => {
    // 2CLP-USDC-DAI
    const pool = await getPoolMock(gyro2CLP_USDC_DAI, GqlChain.Polygon)

    console.log(JSON.stringify(pool))
  })

  test('Generate gyroE pool mock', async () => {
    const gyroEId = '0xf01b0684c98cd7ada480bfdf6e43876422fa1fc10002000000000000000005de' //ECLP-wstETH-wETH
    const pool = await getPoolMock(gyroEId, GqlChain.Mainnet)

    console.log(JSON.stringify(pool))
  })

  test('Generate recovery mode pool mock', async () => {
    const pool = await getPoolMock(recoveryModePoolId, GqlChain.Mainnet)

    console.log(JSON.stringify(pool))
  })

  test('Generate meta stable pool mock', async () => {
    const metaStablePoolId = '0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080' //B-stETH-STABLE
    const pool = await getPoolMock(metaStablePoolId, GqlChain.Mainnet)

    console.log(JSON.stringify(pool))
  })

  test('Generate composable stable pool mock', async () => {
    const composableStablePoolId =
      '0x156c02f3f7fef64a3a9d80ccf7085f23cce91d76000000000000000000000570' // Balancer vETH/WETH StablePool
    const pool = await getPoolMock(composableStablePoolId, GqlChain.Mainnet)

    console.log(JSON.stringify(pool))
  })
})
