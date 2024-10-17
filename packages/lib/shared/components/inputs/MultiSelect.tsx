import {
  Box,
  Button,
  ButtonProps,
  Checkbox,
  Divider,
  HStack,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Radio,
  Tag,
  VStack,
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
    <Popover variant="multiSelect" preventOverflow placement="bottom-start">
      <PopoverTrigger>
        <Button ref={ref} variant="tertiary" w="full" h="auto" py="sm" {...buttonProps}>
          <HStack w="full" justify="space-between">
            {hasSelectedOptions ? (
              <HStack spacing="xs" wrap="wrap">
                {selectedOptions.map(option =>
                  option.selectedLabel ? (
                    <Box key={`selected-option-label-${option.value}`}>{option.selectedLabel}</Box>
                  ) : (
                    <Tag key={`selected-label-${option.value}`}>{option.label}</Tag>
                  )
                )}
              </HStack>
            ) : (
              <Box>{label}</Box>
            )}
            <ChevronDown size={16} />
          </HStack>
        </Button>
      </PopoverTrigger>
      <PopoverContent w={contentWidth}>
        <PopoverBody>
          <VStack align="start" w="full" spacing="sm">
            {!!toggleAll && (
              <>
                <Radio isChecked={!hasSelectedOptions} onChange={toggleAll}>
                  All networks
                </Radio>
                <Divider />
              </>
            )}
            <VStack align="start" w="full" spacing="xs">
              {options.map(option => (
                <Checkbox
                  key={`checkbox-${String(option.value)}`}
                  isChecked={isChecked(option.value)}
                  onChange={e => toggleOption(e.target.checked, option.value)}
                >
                  {option.label}
                </Checkbox>
              ))}
            </VStack>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
