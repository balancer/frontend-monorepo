/*
 MIGRATION NOTE: The following Chakra UI hooks have been removed.
 Please replace them with the suggested alternatives:

//   - useBoolean: Use react-use: useToggle or useState

 See: https://chakra-ui.com/docs/get-started/migration#hooks
*/
import { Input, InputGroup, InputProps, Box, VStack } from '@chakra-ui/react';
import { Tooltip } from '@repo/lib/shared/components/tooltips/Tooltip';
import { blockInvalidNumberInput, bn } from '@repo/lib/shared/utils/numbers'
import { Percent } from 'react-feather'
import { useState, useCallback } from 'react'
import { clamp } from 'lodash'
import { votingTimeLockedEndDate } from '../myVotes.helpers'
import { dateTimeLabelFor } from '@repo/lib/shared/utils/time'

interface PercentageInputProps extends InputProps {
  percentage: string
  setPercentage: (value: string) => void
  isTimeLocked: boolean
  isLockExpired: boolean | undefined
  isGaugeExpired: boolean | undefined
  noBalance: boolean | undefined
  isTooShort: boolean | undefined
  lastVoteTime: number | undefined
  isDisabled?: boolean
}

function parseValue(value: string) {
  return value.replace('%', '')
}

export function VoteWeightInput({
  percentage,
  setPercentage,
  isTimeLocked,
  isLockExpired,
  isGaugeExpired,
  noBalance,
  isTooShort,
  lastVoteTime,
  isDisabled,
  min = 0,
  max = 100,
  ...inputProps
}: PercentageInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseValue(e.currentTarget.value)
    setEditingValue(value)

    const numberValue = parseFloat(value)
    if (Number.isNaN(numberValue)) return

    const _min = min ? bn(min).toNumber() : -Number.MAX_SAFE_INTEGER
    const _max = max ? bn(max).toNumber() : Number.MAX_SAFE_INTEGER
    setPercentage(clamp(numberValue, _min, _max).toString())
  }

  const [isEditing, setIsEditing] = useState(false)
  const toggle = useCallback(() => setIsEditing(prev => !prev), [])
  const [editingValue, setEditingValue] = useState(parseFloat(percentage).toFixed(2))

  const endOfLocking = dateTimeLabelFor(votingTimeLockedEndDate(lastVoteTime || 0))

  let tooltipLabel = ''
  if (isTimeLocked) {
    tooltipLabel = `Your vote is timelocked.
    Once you vote on a pool, your vote is fixed for 10 days.
    No edits can be made until ${endOfLocking}`
  } else if (isLockExpired) {
    tooltipLabel =
      "You can't vote because your lock has expired. Get new veBAL to vote by extending your lock."
  } else if (isGaugeExpired) {
    tooltipLabel = 'This pool gauge is expired. You must vote with 0% to reallocate these votes.'
  } else if (noBalance) {
    tooltipLabel = `You can't vote because you have no veBAL.
    Extend your lock / get new veBAL to edit your votes`
  } else if (isTooShort) {
    tooltipLabel = `You can't vote because you have no veBAL.
    Extend your lock / get new veBAL to edit your votes`
  } else {
    tooltipLabel = 'Unknown reason'
  }

  function getInputValue() {
    return isEditing ? editingValue : parseFloat(percentage).toFixed(2)
  }

  return (
    <VStack align="start" w="full">
      <Tooltip disabled={!isDisabled} content={tooltipLabel}>
        <InputGroup endElement={
          <Box color="font.primary" pointerEvents="none">
            <Box bg="background.level2" p="3px" rounded="sm" shadow="sm">
              <Percent color="currentColor" size="13px" />
            </Box>
          </Box>
        }>
          <Input
            autoComplete="off"
            autoCorrect="off"
            bg="background.level1"
            max={max}
            min={0}
            onBlur={() => {
              setEditingValue(parseFloat(percentage).toFixed(2))
              toggle()
            }}
            onValueChange={handleChange}
            onFocus={() => {
              setEditingValue(parseFloat(percentage).toFixed(2))
              toggle()
            }}
            onKeyDown={blockInvalidNumberInput}
            type="number"
            value={String(getInputValue())}
            disabled={isDisabled}
            {...inputProps}
          />
        </InputGroup>
      </Tooltip>
    </VStack>
  );
}
