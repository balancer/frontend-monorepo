import {
  Box,
  Button,
  ButtonProps,
  Checkbox,
  HStack,
  Popover,
  RadioGroup,
  Tag,
  Text,
  VStack,
  Separator,
} from '@chakra-ui/react'
import { ReactNode } from 'react'
import { ChevronDown } from 'react-feather'
import useMeasure from 'react-use-measure'

type Props<Value> = {
  label: string
  options: Option<Value>[]
  toggleOption: (checked: boolean, value: Value) => void
  isChecked: (value: Value) => boolean
  toggleAll?: () => void
} & ButtonProps

type Option<Value> = {
  label: ReactNode
  value: Value
  selectedLabel?: ReactNode
  icon?: ReactNode
}

export function MultiSelect<Value = string>({
  label,
  options,
  toggleOption,
  isChecked,
  toggleAll,
  ...buttonProps
}: Props<Value>) {
  const [ref, { width }] = useMeasure()

  const contentWidth = width > 200 ? `${width}px` : 'auto'

  const selectedOptions = options.filter(option => isChecked(option.value))

  const hasSelectedOptions = selectedOptions.length > 0

  return (
    <Popover.Root
      lazyMount
      positioning={{
        placement: 'bottom-start',
        preventOverflow: true,
      }}
      variant="multiSelect"
    >
      <Popover.Trigger asChild>
        <Button h="auto" py="sm" ref={ref} variant="tertiary" w="full" {...buttonProps}>
          <HStack justify="space-between" w="full">
            {hasSelectedOptions ? (
              <HStack gap="6px" overflow="hidden" w="full">
                <HStack gap="xs">
                  {selectedOptions.map(option =>
                    option.selectedLabel ? (
                      <Box key={`selected-option-label-${option.value}`}>
                        {option.selectedLabel}
                      </Box>
                    ) : (
                      <Tag.Root key={`selected-label-${option.value}`}>{option.label}</Tag.Root>
                    )
                  )}
                </HStack>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  lineClamp={1}
                  overflow="hidden"
                  textOverflow="ellipsis"
                  truncate
                  whiteSpace="nowrap"
                >
                  {selectedOptions.map(option => option.label).join(', ')}
                </Text>
              </HStack>
            ) : (
              <Box fontWeight="medium">{label}</Box>
            )}
            <ChevronDown size={16} />
          </HStack>
        </Button>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content motionProps={{ animate: { scale: 1, opacity: 1 } }} w={contentWidth}>
          <Popover.Body>
            <VStack align="start" gap="sm" w="full">
              {!!toggleAll && (
                <>
                  <RadioGroup.Root py="xs" value={!hasSelectedOptions ? 'all' : ''}>
                    <RadioGroup.Item onClick={toggleAll} value="all">
                      <RadioGroup.ItemHiddenInput />
                      <RadioGroup.ItemControl />
                      <RadioGroup.ItemText>
                        <Text fontSize="sm" fontWeight="medium">
                          All networks
                        </Text>
                      </RadioGroup.ItemText>
                    </RadioGroup.Item>
                  </RadioGroup.Root>
                  <Separator />
                </>
              )}
              <VStack align="start" gap="ms" py="xs" w="full">
                {options.map(option => (
                  <Checkbox.Root
                    checked={isChecked(option.value)}
                    fontWeight="medium"
                    key={`checkbox-${String(option.value)}`}
                    onCheckedChange={(e: { checked: boolean | 'indeterminate' }) =>
                      toggleOption(!!e.checked, option.value)
                    }
                  >
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
                          <HStack>
                            {option.icon}
                            <Text fontSize="sm">{option.label}</Text>
                          </HStack>
                        </Checkbox.Label>
                      </Checkbox.Root>
                    </Checkbox.Label>
                  </Checkbox.Root>
                ))}
              </VStack>
            </VStack>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  )
}
