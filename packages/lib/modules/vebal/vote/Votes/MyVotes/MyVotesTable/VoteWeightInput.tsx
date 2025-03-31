import {
  Input,
  InputGroup,
  InputProps,
  InputRightElement,
  Tooltip,
  useBoolean,
  VStack,
} from '@chakra-ui/react'
import { blockInvalidNumberInput, bn } from '@repo/lib/shared/utils/numbers'
import { Percent } from 'react-feather'
import { useState } from 'react'
import { clamp } from 'lodash'
import { votingTimeLockedEndDate } from '../myVotes.helpers'
import { dateTimeLabelFor } from '@repo/lib/shared/utils/time'

interface PercentageInputProps extends InputProps {
  percentage: string
  setPercentage: (value: string) => void
  isTimeLocked: boolean
  lastVoteTime: number | undefined
}

function parseValue(value: string) {
  return value.replace('%', '')
}

export function VoteWeightInput({
  percentage,
  setPercentage,
  isTimeLocked,
  lastVoteTime,
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

  const [isEditing, { toggle }] = useBoolean(false)
  const [editingValue, setEditingValue] = useState(parseFloat(percentage).toFixed(2))

  const endOfLocking = dateTimeLabelFor(votingTimeLockedEndDate(lastVoteTime || 0))

  return (
    <VStack align="start" w="full">
      <Tooltip
        isDisabled={isTimeLocked}
        label={`Your vote is timelocked. Once you vote on a pool, your vote is fixed for 10 days. No edits can be made until ${endOfLocking}`}
      >
        <InputGroup>
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
            onChange={handleChange}
            onFocus={() => {
              setEditingValue(parseFloat(percentage).toFixed(2))
              toggle()
            }}
            onKeyDown={blockInvalidNumberInput}
            type="number"
            value={isEditing ? editingValue : parseFloat(percentage).toFixed(2)}
            {...inputProps}
          />
          <InputRightElement pointerEvents="none">
            <Percent color="grayText" size="20px" />
          </InputRightElement>
        </InputGroup>
      </Tooltip>
    </VStack>
  )
}
