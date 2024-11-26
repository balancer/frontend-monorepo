import { ApolloClient } from '@apollo/client'
import { Path } from '@balancer/sdk'
import { GetSorSwapsDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { ProtocolVersion } from '../../pool/pool.types'
import { SdkSimulateSwapResponse, SimulateSwapInputs } from '../swap.types'
import { BaseDefaultSwapHandler } from './BaseDefaultSwap.handler'

export class DefaultSwapHandler extends BaseDefaultSwapHandler {
  name = 'DefaultSwapHandler'

  constructor(public apolloClient: ApolloClient<object>) {
    super()
  }

  async simulate({ ...variables }: SimulateSwapInputs): Promise<SdkSimulateSwapResponse> {
    const { data } = await this.apolloClient.query({
      query: GetSorSwapsDocument,
      variables: {
        ...variables,
        queryBatchSwap: false,
      }, // We don't need the API to do a query because we're doing that via the SDK below.
      fetchPolicy: 'no-cache',
      notifyOnNetworkStatusChange: true,
    })

    const hopCount: number = data.swaps.routes[0]?.hops?.length || 0
    const paths = data.swaps.paths.map(
      path =>
        ({
          ...path,
          inputAmountRaw: BigInt(path.inputAmountRaw),
          outputAmountRaw: BigInt(path.outputAmountRaw),
        }) as Path
    )

    return this.runSimulation({
      protocolVersion: data.swaps.protocolVersion as ProtocolVersion,
      paths,
      hopCount,
      swapInputs: variables,
    })
  }
}
