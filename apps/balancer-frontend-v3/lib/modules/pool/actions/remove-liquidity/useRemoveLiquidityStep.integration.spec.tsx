/* eslint-disable max-len */
import { aWjAuraWethPoolElementMock } from '@/test/msw/builders/gqlPoolElement.builders'
import {
  DefaultRemoveLiquidityTestProvider,
  buildDefaultPoolTestProvider,
} from '@/test/utils/custom-renderers'
import { PropsWithChildren } from 'react'
import { RemoveLiquidityProvider } from './RemoveLiquidityProvider'

const PoolProvider = buildDefaultPoolTestProvider(aWjAuraWethPoolElementMock())

export const Providers = ({ children }: PropsWithChildren) => (
  <PoolProvider>
    <RemoveLiquidityProvider>
      <DefaultRemoveLiquidityTestProvider>{children}</DefaultRemoveLiquidityTestProvider>
    </RemoveLiquidityProvider>
  </PoolProvider>
)

// async function testConstructRemoveLiquidityStep() {
//   const { result } = testHook(
//     () => {
//       // return useConstructRemoveLiquidityStep(poolId)
//       // https://github.com/testing-library/react-hooks-testing-library/issues/615#issuecomment-835814029
//       return {
//         providerResult: useRemoveLiquidity(),
//         constructStepResult: useConstructRemoveLiquidityStep(poolId),
//       }
//     },
//     {
//       wrapper: Providers,
//     }
//   )
//   return result
// }

test.skip('Throws error when user tries to remove liquidity in a pool where they does not have balance', async () => {
  // const result = await testConstructRemoveLiquidityStep()
  // // User fills token inputs
  // act(() => {
  //   result.current.providerResult.setProportionalType()
  // })
  // await waitFor(() => expect(result.current.providerResult.amountsOut).toBeDefined())
  // act(() => result.current.constructStepResult.step.activateStep())
  // await waitFor(() =>
  //   expect(result.current.constructStepResult.step.simulation.isFetched).toBeTruthy()
  // )
  // await waitFor(() =>
  //   expect(result.current.constructStepResult.step.simulation.error).toBeDefined()
  // )
  // expect(result.current.constructStepResult.step.simulation.error?.cause).toMatchInlineSnapshot(`
  //   [ExecutionRevertedError: Execution reverted with reason: BAL#434.
  //   Details: execution reverted: BAL#434
  //   Version: viem@1.18.1]
  // `)
})
