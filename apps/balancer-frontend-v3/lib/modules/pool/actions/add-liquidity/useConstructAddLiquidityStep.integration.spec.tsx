/* eslint-disable max-len */
import { aWjAuraWethPoolElementMock } from '@/test/msw/builders/gqlPoolElement.builders'
import {
  DefaultAddLiquidityTestProvider,
  buildDefaultPoolTestProvider,
} from '@/test/utils/custom-renderers'
import { PropsWithChildren } from 'react'

const PoolProvider = buildDefaultPoolTestProvider(aWjAuraWethPoolElementMock())

export const Providers = ({ children }: PropsWithChildren) => (
  <PoolProvider>
    <DefaultAddLiquidityTestProvider>{children}</DefaultAddLiquidityTestProvider>
  </PoolProvider>
)

// async function testConstructAddLiquidityStep() {
//   const { result } = testHook(
//     () => {
//       // return useConstructRemoveLiquidityStep(poolId)
//       // https://github.com/testing-library/react-hooks-testing-library/issues/615#issuecomment-835814029
//       return {
//         providerResult: useAddLiquidity(),
//         constructStepResult: useConstructAddLiquidityStep(poolId),
//       }
//     },
//     {
//       wrapper: Providers,
//     }
//   )
//   return result
// }

test.skip('TBD', async () => {
  // const result = await testConstructAddLiquidityStep()
  // // User fills token inputs
  // act(() => {
  //   result.current.providerResult.setHumanAmountIn(wETHAddress, '1')
  // })
  // await waitFor(() => expect(result.current.providerResult.bptOut?.amount).toBeDefined())
  // act(() => result.current.constructStepResult.step.activateStep())
  // await waitFor(() =>
  //   expect(result.current.constructStepResult.step.simulation.isError).toBeTruthy()
  // )
  // // expect(result.current.constructStepResult.step.simulation.error).not.toBeNull()
  // console.log(result.current.constructStepResult.step.simulation.error)
})
