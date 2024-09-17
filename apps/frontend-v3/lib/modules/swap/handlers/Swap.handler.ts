import { ApolloClient } from '@apollo/client'
import { TransactionConfig } from '../../web3/contracts/contract.types'
import { BuildSwapInputs, SimulateSwapResponse, SimulateSwapInputs } from '../swap.types'
import { GqlToken } from '@/lib/shared/services/api/generated/graphql'

/**
 * SwapHandler is an interface that defines the methods that must be implemented by a handler.
 * They take standard inputs from the UI and return frontend standardised outputs.
 */
export interface SwapHandler {
  apolloClient?: ApolloClient<object>
  tokens?: GqlToken[]
  name: string

  simulate(inputs: SimulateSwapInputs): Promise<SimulateSwapResponse>
  build(inputs: BuildSwapInputs): TransactionConfig
}
