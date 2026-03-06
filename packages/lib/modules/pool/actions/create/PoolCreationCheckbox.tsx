import { HStack, Text, Checkbox } from '@chakra-ui/react'
import { InfoIconPopover } from './InfoIconPopover'

interface PoolCreationCheckboxProps {
  label: string
  labelColor?: string
  title?: string
  tooltip?: string
  isChecked: boolean
  disabled?: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function PoolCreationCheckbox({
  title,
  label,
  labelColor,
  tooltip,
  isChecked,
  disabled,
  onChange,
}: PoolCreationCheckboxProps) {
  return (
    <>
      {title && (
        <HStack gap="xs">
          <Text>{title}</Text>
          {tooltip && <InfoIconPopover message={tooltip} placement="right-start" />}
        </HStack>
      )}
      <Checkbox.Root checked={isChecked} disabled={disabled} onCheckedChange={onChange} size="lg">
        <Checkbox.HiddenInput />
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Label>
          <Checkbox.Root>
            <Checkbox.HiddenInput />
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
          </Checkbox.Root>
          <Checkbox.Root>
            <Checkbox.HiddenInput />
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Label>
              <Checkbox.Root>
                <Checkbox.HiddenInput />
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
              </Checkbox.Root>
            </Checkbox.Label>
          </Checkbox.Root>
          <Checkbox.Root>
            <Checkbox.HiddenInput />
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Label>
              <Text color={labelColor}>{label}</Text>
            </Checkbox.Label>
          </Checkbox.Root>
        </Checkbox.Label>
      </Checkbox.Root>
    </>
  )
}
