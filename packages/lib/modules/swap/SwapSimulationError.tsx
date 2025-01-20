/* eslint-disable react/no-unescaped-entities */
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { BalAlertLink } from '@repo/lib/shared/components/alerts/BalAlertLink'
import { ErrorAlert } from '@repo/lib/shared/components/errors/ErrorAlert'
import { buildCowSwapUrl } from '../cow/cow.utils'
import { parseSwapError } from './swap.helpers'
import { useSwap } from './SwapProvider'

type Props = {
  errorMessage?: string
}
export function SwapSimulationError({ errorMessage }: Props) {
  const { tokenIn, tokenOut, selectedChain } = useSwap()

  if (errorMessage?.includes('must contain at least 1 path')) {
    return (
      <ErrorAlert title="Not enough liquidity">
        There's not enough liquidity on {PROJECT_CONFIG.projectName} connecting these tokens to
        route this swap. Please try with smaller amounts or go to{' '}
        <BalAlertLink
          href={buildCowSwapUrl({
            chain: selectedChain,
            tokenInAddress: tokenIn.address,
            tokenOutAddress: tokenOut.address,
          })}
        >
          Cow Swap.
        </BalAlertLink>
      </ErrorAlert>
    )
  }

  return <ErrorAlert title="Error fetching swap">{parseSwapError(errorMessage)}</ErrorAlert>
}
