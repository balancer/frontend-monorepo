import {
  Input,
  InputGroup,
  InputProps,
  InputRightElement,
  useBoolean,
  VStack,
} from '@chakra-ui/react'
import { blockInvalidNumberInput, bn, clamp } from '@repo/lib/shared/utils/numbers'
import { Percent } from 'react-feather'
import { useState } from 'react'

interface PercentageInputProps extends InputProps {
  percentage: string
  setPercentage: (value: string) => void
}

function parseValue(value: string) {
  return value.replace('%', '')
}

export function VoteWeightInput({
  percentage,
  setPercentage,
  min = 0,
  max = 100,
  ...inputPros
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

  return (
    <VStack align="start" w="full">
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
          {...inputPros}
        />
        <InputRightElement pointerEvents="none">
          <Percent color="grayText" size="20px" />
        </InputRightElement>
      </InputGroup>
    </VStack>
  )
}
