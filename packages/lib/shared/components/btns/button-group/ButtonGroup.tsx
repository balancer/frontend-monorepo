import {
  Box,
  Button,
  ButtonProps,
  HStack,
  Icon,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react'
import { LayoutGroup, motion } from 'framer-motion'
import { ReactNode } from 'react'
import { Info } from 'react-feather'

export type ButtonGroupOption = {
  value: string
  label: string | ReactNode
  disabled?: boolean
  tabTooltipLabel?: string // Popover tooltip on full tab hover
  iconTooltipLabel?: string // Popover tooltip on icon hover
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
  isGray?: boolean
}

export default function ButtonGroup(props: Props) {
  const { groupId, options, currentOption, isFullWidth, isGray } = props

  return (
    <LayoutGroup id={groupId}>
      <HStack
        background={isGray ? 'gray.600' : 'level0'}
        p="1"
        pt="3px" // TODO: maybe there a better way to align the buttons
        rounded="md"
        shadow="innerXl"
        spacing="1"
        w={isFullWidth ? 'full' : undefined}
      >
        {options.map(function (option) {
          const isActive = currentOption?.value === option.value
          return option?.tabTooltipLabel ? (
            <Box flex="1" key={`button-group-option-${option.value}`}>
              <Popover trigger="hover">
                <PopoverTrigger>
                  <Box _hover={{ opacity: 0.75 }} transition="opacity 0.2s var(--ease-out-cubic)">
                    <GroupOptionButton isActive={isActive} option={option} {...props} />
                  </Box>
                </PopoverTrigger>
                <PopoverContent maxW="300px" p="sm" w="auto">
                  <Text fontSize="sm" variant="secondary">
                    {option.tabTooltipLabel}
                  </Text>
                </PopoverContent>
              </Popover>
            </Box>
          ) : (
            <Box flex="1" key={`button-group-option-${option.value}`}>
              <GroupOptionButton isActive={isActive} option={option} {...props} />
            </Box>
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
  isGray,
  onChange,
}: { option: ButtonGroupOption; isActive: boolean } & Props) {
  const variant = isActive ? 'buttonGroupActive' : 'buttonGroupInactive'
  const variantGray = isActive ? 'buttonGroupActiveGray' : 'buttonGroupInactiveGray'
  const variantToUse = isGray ? variantGray : variant

  return (
    <Button
      bg="transparent"
      id={`button-group-${option.value}`}
      isDisabled={option.disabled}
      onClick={() => onChange(option)}
      position="relative"
      rightIcon={
        !option.tabTooltipLabel && option.iconTooltipLabel ? (
          <IconPopover option={option} />
        ) : undefined
      }
      role="group"
      size={size}
      variant={variantToUse}
      width={width || 'full'}
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

function IconPopover({ option }: { option: ButtonGroupOption }) {
  return (
    <Popover placement="top" trigger="hover">
      <PopoverTrigger>
        <Icon as={Info} />
      </PopoverTrigger>
      <PopoverContent maxW="300px" p="sm" w="auto">
        <Text fontSize="sm" variant="secondary" whiteSpace="pre-wrap">
          {option.iconTooltipLabel}
        </Text>
      </PopoverContent>
    </Popover>
  )
}
