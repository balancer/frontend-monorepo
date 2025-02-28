import { Button, ButtonProps } from '@chakra-ui/react'
import { Calendar } from 'react-feather'

export function ReminderButton({ children, ...buttonProps }: ButtonProps) {
  return (
    <Button
      bg="none"
      _hover={{ color: 'font.linkHover' }}
      fontSize="14px"
      fontWeight={500}
      lineHeight="20px"
      color="purple.300"
      letterSpacing="-0.28px"
      leftIcon={<Calendar strokeWidth="1.5px" width="18px" height="18px" />}
      gap="6px"
      h="fit-content"
      px="0"
      sx={{ '& > span': { marginInlineEnd: '0' } }}
      {...buttonProps}
    >
      {children}
    </Button>
  )
}
