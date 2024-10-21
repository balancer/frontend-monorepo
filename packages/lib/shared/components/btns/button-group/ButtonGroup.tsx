import { Button, Box, ButtonProps, HStack } from '@chakra-ui/react'
import React, { ReactNode } from 'react'
import { motion, LayoutGroup } from 'framer-motion'

export type ButtonGroupOption = {
  value: string
  label: string | ReactNode
  disabled?: boolean
}

type Props = {
  currentOption?: ButtonGroupOption
  options: Readonly<ButtonGroupOption[]>
  onChange: (option: ButtonGroupOption) => void
  size?: ButtonProps['size']
  width?: string
  groupId: string
}

export default function ButtonGroup({
  currentOption,
  options,
  onChange,
  size,
  width,
  groupId,
}: Props) {
  return (
    <LayoutGroup id={groupId}>
      <HStack background="level0" p="1" rounded="md" shadow="innerXl" spacing="1">
        {options.map(option => {
          const isActive = currentOption?.value === option.value
          return (
            <Button
              bg="transparent"
              id={`button-group-${option.value}`}
              isDisabled={option.disabled}
              key={`button-group-option-${option.value}`}
              onClick={() => onChange(option)}
              position="relative"
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
              <Box position="relative" zIndex="8">
                {option.label}
              </Box>
            </Button>
          )
        })}
      </HStack>
    </LayoutGroup>
  )
}
