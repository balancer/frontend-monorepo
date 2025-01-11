import { HStack, Text } from '@chakra-ui/react'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { bpsToPercentage } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/myVotes.helpers'
import React from 'react'
import {
  getExceededWeight,
  getUnallocatedWeight,
} from '@repo/lib/modules/vebal/vote/Votes/MyVotes/myVotes.helpers'
import { VoteUnallocatedTooltip } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/VoteUnallocatedTooltip'
import { VoteExceededTooltip } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/VoteExceededTooltip'
import { VoteTimeLockedTooltip } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/VoteTimeLockedTooltip'

interface Props {
  timeLocked?: boolean
  timeLockedEndDate?: Date
  total?: boolean
  skipTotalWarnings?: boolean
  weight: string | number
  variant: 'primary' | 'secondary'
}

export function VoteWeight({
  timeLocked,
  weight,
  variant,
  total = false,
  skipTotalWarnings = false,
  timeLockedEndDate,
}: Props) {
  const exceededWeight = getExceededWeight(weight)
  const unallocatedWeight = getUnallocatedWeight(weight)

  const showExceededWarning = total && !skipTotalWarnings && exceededWeight > 0
  const showUnallocatedWarning = total && !skipTotalWarnings && unallocatedWeight > 0

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
    </HStack>
  )
}
