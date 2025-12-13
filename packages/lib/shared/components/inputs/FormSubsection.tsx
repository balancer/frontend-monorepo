import { VStack, StackProps } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface FormSubsectionProps extends StackProps {
  children: ReactNode
  marginLeft?: StackProps['ml']
}

/* A container for child form elements connected to a parent form element */

export function FormSubsection({ children, marginLeft = '2', ...props }: FormSubsectionProps) {
  return (
    <VStack
      align="start"
      maxW="full"
      ml={marginLeft}
      mt="3"
      pl="5"
      position="relative"
      spacing="md"
      sx={{
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          backgroundColor: 'border.base',
          opacity: 0.5,
        },
      }}
      w={{ base: 'calc(100% - var(--chakra-space-5))', xl: 'full' }}
      {...props}
    >
      {children}
    </VStack>
  )
}
