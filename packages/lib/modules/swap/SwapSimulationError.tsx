import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { Text } from '@chakra-ui/react'
import { BalAlertLink } from '@repo/lib/shared/components/alerts/BalAlertLink'
import { ErrorAlert } from '@repo/lib/shared/components/errors/ErrorAlert'
import { buildCowSwapUrl } from '../cow/cow.utils'
import { parseSwapError } from './swap.helpers'
import { useSwap } from './SwapProvider'
import { swapApolloNetworkErrorMessage } from '@repo/lib/shared/utils/errors'
import { DiscordLink } from '@repo/lib/shared/components/links/DiscordLink'

type Props = {
  errorMessage?: string
}
export function SwapSimulationError({ errorMessage }: Props) {
  const { tokenIn, tokenOut, selectedChain } = useSwap()

  const showCowSwapLink = PROJECT_CONFIG.cowSupportedNetworks.includes(selectedChain)
  const projectName = PROJECT_CONFIG.projectName

  if (errorMessage?.includes('Must contain at least 1 path')) {
    return (
      <ErrorAlert title={`Not enough liquidity on ${PROJECT_CONFIG.projectName}`}>
        <Text color="#000" fontSize="sm">
          Your swap amount is too high to find a route through the available liquidity on{' '}
          {projectName}. If there is some liquidity available on {projectName}, you can reduce yobur
          swap size
          {showCowSwapLink && (
            <>
              {' '}
              or try{' '}
              <BalAlertLink
                color="#000"
                fontSize="sm"
                href={buildCowSwapUrl({
                  chain: selectedChain,
                  tokenInAddress: tokenIn.address,
                  tokenOutAddress: tokenOut.address,
                })}
                isExternal
              >
                CoW Swap
              </BalAlertLink>
            </>
          )}
          .
        </Text>
      </ErrorAlert>
    )
  }

  if (errorMessage === swapApolloNetworkErrorMessage) {
    return (
      <ErrorAlert title="Network error">
        It looks like there was a network error while fetching the swap. Please check your internet
        connection and try again. You can report the problem in <DiscordLink /> if the issue
        persists.
      </ErrorAlert>
    )
  }

  return <ErrorAlert title="Error fetching swap">{parseSwapError(errorMessage)}</ErrorAlert>
}
