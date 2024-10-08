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
      <HStack rounded="md" p="1" spacing="1" background="level0" shadow="innerXl">
        {options.map(option => {
          const isActive = currentOption?.value === option.value
          return (
            <Button
              onClick={() => onChange(option)}
              key={`button-group-option-${option.value}`}
              variant={isActive ? 'buttonGroupActive' : 'buttonGroupInactive'}
              bg="transparent"
              id={`button-group-${option.value}`}
              size={size}
              width={width}
              isDisabled={option.disabled}
              position="relative"
              role="group"
            >
              {isActive && (
                <Box
                  as={motion.div}
                  layoutId={`active-${groupId}`}
                  bg="background.button.secondary"
                  borderRadius="4px"
                  shadow="md"
                  position="absolute"
                  inset="0"
                ></Box>
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
