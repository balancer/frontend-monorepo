import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { BalAlertLink } from '@repo/lib/shared/components/alerts/BalAlertLink'
import { ErrorAlert } from '@repo/lib/shared/components/errors/ErrorAlert'
import { buildCowSwapUrl } from '../cow/cow.utils'
import { parseSwapError } from './swap.helpers'
import { useSwap } from './SwapProvider'
import { getDiscordLink } from '@repo/lib/shared/utils/links'
import { swapApolloNetworkErrorMessage } from '@repo/lib/shared/utils/errors'

type Props = {
  errorMessage?: string
}
export function SwapSimulationError({ errorMessage }: Props) {
  const { tokenIn, tokenOut, selectedChain } = useSwap()

  const showCowSwapLink = PROJECT_CONFIG.cowSupportedNetworks.includes(selectedChain)

  if (errorMessage?.includes('Must contain at least 1 path')) {
    return (
      <ErrorAlert title={`Not enough liquidity on ${PROJECT_CONFIG.projectName}`}>
        Your swap amount is too high to find a route through the available liquidity on{' '}
        {PROJECT_CONFIG.projectName}. Try reducing your swap size
        {showCowSwapLink && (
          <>
            {' '}
            or try{' '}
            <BalAlertLink
              href={buildCowSwapUrl({
                chain: selectedChain,
                tokenInAddress: tokenIn.address,
                tokenOutAddress: tokenOut.address,
              })}
            >
              CoW Swap
            </BalAlertLink>
          </>
        )}
        .
      </ErrorAlert>
    )
  }

  if (errorMessage === swapApolloNetworkErrorMessage) {
    const discordUrl = getDiscordLink()

    return (
      <ErrorAlert title="Network error">
        It looks like there was a network error while fetching the swap. Please check your internet
        connection and try again. You can report the problem in{' '}
        <BalAlertLink href={discordUrl}>our discord</BalAlertLink> if the issue persists.
      </ErrorAlert>
    )
  }

  return <ErrorAlert title="Error fetching swap">{parseSwapError(errorMessage)}</ErrorAlert>
}
