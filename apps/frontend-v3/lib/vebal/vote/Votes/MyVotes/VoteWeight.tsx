import { HStack, Text } from '@chakra-ui/react'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { bpsToPercentage } from '@bal/lib/vebal/vote/Votes/MyVotes/myVotes.helpers'
import {
  getExceededWeight,
  getUnallocatedWeight,
} from '@bal/lib/vebal/vote/Votes/MyVotes/myVotes.helpers'
import { VoteUnallocatedTooltip } from '@bal/lib/vebal/vote/Votes/MyVotes/VoteUnallocatedTooltip'
import { VoteExceededTooltip } from '@bal/lib/vebal/vote/Votes/MyVotes/VoteExceededTooltip'
import { VoteTimeLockedTooltip } from '@bal/lib/vebal/vote/Votes/MyVotes/VoteTimeLockedTooltip'
import { VoteExpiredTooltip } from '@bal/lib/vebal/vote/VoteExpiredTooltip'
import { AlertIcon } from '@repo/lib/shared/components/icons/AlertIcon'

interface Props {
  timeLocked?: boolean
  timeLockedEndDate?: Date
  total?: boolean
  skipTotalWarnings?: boolean
  weight: BigNumber
  variant: 'primary' | 'secondary'
  isGaugeExpired?: boolean
}

export function VoteWeight({
  timeLocked,
  weight,
  variant,
  total = false,
  skipTotalWarnings = false,
  timeLockedEndDate,
  isGaugeExpired,
}: Props) {
  const exceededWeight = getExceededWeight(weight)
  const unallocatedWeight = getUnallocatedWeight(weight)

  const showExceededWarning = total && !skipTotalWarnings && exceededWeight.gt(0)
  const showUnallocatedWarning = total && !skipTotalWarnings && unallocatedWeight.gt(0)

  function getFontColor() {
    if (total) {
      if (showExceededWarning) {
        return 'red.400'
      }
      if (showUnallocatedWarning) {
        return 'font.warning'
      }
      return 'font.maxContrast'
    }

    if (isGaugeExpired) {
      return 'font.warning'
    }

    return variant === 'secondary' ? 'font.secondary' : undefined
  }

  const fontColor = getFontColor()

  return (
    <HStack>
      {timeLocked && <VoteTimeLockedTooltip timeLockedEndDate={timeLockedEndDate} usePortal />}
      <Text color={fontColor} fontWeight={700}>
        {fNum('apr', bpsToPercentage(weight))}
      </Text>
      {showExceededWarning && <VoteExceededTooltip exceededWeight={exceededWeight} usePortal />}
      {showUnallocatedWarning && (
        <VoteUnallocatedTooltip unallocatedWeight={unallocatedWeight} usePortal />
      )}
      {isGaugeExpired && (
        <VoteExpiredTooltip usePortal>
          <HStack color="font.warning">
            <AlertIcon height="16px" width="16px" />
          </HStack>
        </VoteExpiredTooltip>
      )}
    </HStack>
  )
}
