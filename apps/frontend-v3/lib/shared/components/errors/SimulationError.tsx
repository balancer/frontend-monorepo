import { GenericError } from './GenericError'

type Props = {
  simulationQuery: {
    isError: boolean
    error: any
  }
}
export function SimulationError({ simulationQuery }: Props) {
  if (!simulationQuery.isError) return

  return <GenericError error={simulationQuery.error}></GenericError>
}
