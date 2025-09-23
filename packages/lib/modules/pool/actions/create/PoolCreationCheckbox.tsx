import { HStack, Text, Checkbox } from '@chakra-ui/react'
import { InfoIconPopover } from './InfoIconPopover'

interface PoolCreationCheckboxProps {
  label: string
  labelColor?: string
  title?: string
  tooltip?: string
  isChecked: boolean
  isDisabled?: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function PoolCreationCheckbox({
  title,
  label,
  labelColor,
  tooltip,
  isChecked,
  isDisabled,
  onChange,
}: PoolCreationCheckboxProps) {
  return (
    <>
      {title && (
        <HStack spacing="xs">
          <Text>{title}</Text>
          {tooltip && <InfoIconPopover message={tooltip} placement="right-start" />}
        </HStack>
      )}
      <Checkbox disabled={isDisabled} isChecked={isChecked} onChange={onChange} size="lg">
        <Text color={labelColor}>{label}</Text>
      </Checkbox>
    </>
  )
}
