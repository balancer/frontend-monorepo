import { Box, Button, ButtonProps, HStack, Icon, HoverCard, Text } from '@chakra-ui/react'
import { LayoutGroup, motion } from 'framer-motion'
import { ReactNode } from 'react'
import { Info } from 'react-feather'

export type ButtonGroupOption = {
  value: string
  label: string | ReactNode
  disabled?: boolean
  tabTooltipLabel?: string // Popover tooltip on full tab hover
  iconTooltipLabel?: string // Popover tooltip on icon hover
  rightIcon?: React.ReactNode
}

type Props = {
  currentOption?: ButtonGroupOption
  options: Readonly<ButtonGroupOption[]>
  onChange: (option: ButtonGroupOption) => void
  groupId: string
  fontSize?: ButtonProps['fontSize']
  isCompact?: boolean
  isFullWidth?: boolean
  isGray?: boolean
  minWidth?: ButtonProps['minWidth']
  size?: ButtonProps['size']
  width?: ButtonProps['width']
}

export default function ButtonGroup(props: Props) {
  const { groupId, options, currentOption, isFullWidth, isGray, isCompact, fontSize = 'xs' } = props

  return (
    <LayoutGroup id={groupId}>
      <HStack
        background={isGray ? 'gray.600' : 'level0'}
        gap={isCompact ? '0' : '1'}
        p="1"
        pt={isCompact ? '0' : '3px'} // TODO: maybe there a better way to align the buttons
        rounded="md"
        shadow="innerXl"
        w={isFullWidth ? 'full' : undefined}
      >
        {options.map(function (option) {
          const isActive = currentOption?.value === option.value
          return option?.tabTooltipLabel ? (
            <Box flex="1" key={`button-group-option-${option.value}`}>
              <HoverCard.Root>
                <HoverCard.Trigger asChild>
                  <Box _hover={{ opacity: 0.75 }} transition="opacity 0.2s var(--ease-out-cubic)">
                    <GroupOptionButton
                      data-active={isActive}
                      isActive={isActive}
                      option={option}
                      {...props}
                      fontSize={fontSize}
                    />
                  </Box>
                </HoverCard.Trigger>
                <HoverCard.Positioner>
                  <HoverCard.Content maxW="300px" p="sm" w="auto">
                    <Text fontSize="sm" variant="secondary">
                      {option.tabTooltipLabel}
                    </Text>
                  </HoverCard.Content>
                </HoverCard.Positioner>
              </HoverCard.Root>
            </Box>
          ) : (
            <Box flex="1" key={`button-group-option-${option.value}`}>
              <GroupOptionButton
                data-active={isActive}
                isActive={isActive}
                option={option}
                {...props}
                fontSize={fontSize}
              />
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
  fontSize,
  groupId,
  isCompact,
  isGray,
  minWidth,
  size,
  width,
  onChange,
}: { option: ButtonGroupOption; isActive: boolean } & Props) {
  const variant = isActive ? 'buttonGroupActive' : 'buttonGroupInactive'
  const variantGray = isActive ? 'buttonGroupActiveGray' : 'buttonGroupInactiveGray'
  const variantCompact = isActive ? 'buttonGroupActiveCompact' : 'buttonGroupInactiveCompact'
  const variantToUse = isCompact ? variantCompact : isGray ? variantGray : variant

  return (
    <Button
      bg="transparent"
      disabled={option.disabled}
      id={`button-group-${option.value}`}
      minWidth={minWidth}
      onClick={() => onChange(option)}
      position="relative"
      role="group"
      size={size}
      variant={variantToUse}
      width={width || 'full'}
    >
      {isActive && (
        <Box
          asChild
          bg="background.button.secondary"
          borderRadius="4px"
          css={
            isCompact
              ? {
                  _dark: {
                    bg: 'background.level4',
                  },
                }
              : undefined
          }
          inset="0"
          position="absolute"
          shadow="md"
        >
          <motion.div layoutId={`active-${groupId}`} />
        </Box>
      )}
      <Box
        css={
          isCompact && isActive
            ? {
                _dark: {
                  color: 'white',
                },
              }
            : undefined
        }
        fontSize={fontSize}
        position="relative"
        zIndex="8"
      >
        {option.label}
      </Box>
      {!option.tabTooltipLabel && option.iconTooltipLabel ? (
        <IconPopover option={option} />
      ) : undefined}
    </Button>
  )
}

function IconPopover({ option }: { option: ButtonGroupOption }) {
  return (
    <HoverCard.Root
      positioning={{
        placement: 'top',
      }}
    >
      <HoverCard.Trigger asChild>
        <Icon asChild>
          <Info />
        </Icon>
      </HoverCard.Trigger>
      <HoverCard.Positioner>
        <HoverCard.Content maxW="300px" p="sm" w="auto">
          <Text fontSize="sm" textAlign="left" variant="secondary" whiteSpace="pre-wrap">
            {option.iconTooltipLabel}
          </Text>
        </HoverCard.Content>
      </HoverCard.Positioner>
    </HoverCard.Root>
  )
}
