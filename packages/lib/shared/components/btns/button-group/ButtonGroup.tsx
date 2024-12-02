import {
  Box,
  Button,
  ButtonProps,
  HStack,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react'
import { LayoutGroup, motion } from 'framer-motion'
import { ReactNode } from 'react'

export type ButtonGroupOption = {
  value: string
  label: string | ReactNode
  disabled?: boolean
  tooltipLabel?: string
  rightIcon?: ButtonProps['rightIcon']
}

type Props = {
  currentOption?: ButtonGroupOption
  options: Readonly<ButtonGroupOption[]>
  onChange: (option: ButtonGroupOption) => void
  groupId: string
  size?: ButtonProps['size']
  width?: ButtonProps['width']
  isFullWidth?: boolean
  hasLargeTextLabel?: boolean
}

export default function ButtonGroup(props: Props) {
  const { groupId, options, currentOption, isFullWidth } = props
  return (
    <LayoutGroup id={groupId}>
      <HStack
        background="level0"
        p="1"
        rounded="md"
        shadow="innerXl"
        spacing="1"
        w={isFullWidth ? 'full' : undefined}
      >
        {options.map(option => {
          const isActive = currentOption?.value === option.value
          return option?.tooltipLabel ? (
            <Popover key={`button-group-option-${option.value}`} trigger="hover">
              <PopoverTrigger>
                <Box _hover={{ opacity: 0.75 }} transition="opacity 0.2s var(--ease-out-cubic)">
                  <GroupOptionButton isActive={isActive} option={option} {...props} />
                </Box>
              </PopoverTrigger>
              {option?.tooltipLabel && (
                <PopoverContent maxW="300px" p="sm" w="auto">
                  <Text fontSize="sm" variant="secondary">
                    {option.tooltipLabel}
                  </Text>
                </PopoverContent>
              )}
            </Popover>
          ) : (
            <GroupOptionButton
              isActive={isActive}
              key={`button-group-option-${option.value}`}
              option={option}
              {...props}
            />
          )
        })}
      </HStack>
    </LayoutGroup>
  )
}

function GroupOptionButton({
  option,
  isActive,
  size,
  width,
  groupId,
  hasLargeTextLabel,
  onChange,
}: { option: ButtonGroupOption; isActive: boolean } & Props) {
  return (
    <Button
      bg="transparent"
      id={`button-group-${option.value}`}
      isDisabled={option.disabled}
      key={`button-group-option-${option.value}`}
      onClick={() => onChange(option)}
      position="relative"
      rightIcon={option.rightIcon}
      role="group"
      size={size}
      variant={isActive ? 'buttonGroupActive' : 'buttonGroupInactive'}
      width={width}
    >
      {isActive && (
        <Box
          as={motion.div}
          bg="background.button.secondary"
          borderRadius="4px"
          inset="0"
          layoutId={`active-${groupId}`}
          position="absolute"
          shadow="md"
        />
      )}
      <Box fontSize={hasLargeTextLabel ? 'lg' : undefined} position="relative" zIndex="8">
        {option.label}
      </Box>
    </Button>
  )
}
