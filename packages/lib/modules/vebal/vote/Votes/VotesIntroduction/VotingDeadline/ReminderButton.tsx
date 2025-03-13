import { Button, ButtonProps } from '@chakra-ui/react'
import { Calendar } from 'react-feather'

export function ReminderButton({ children, ...buttonProps }: ButtonProps) {
  return (
    <Button
      _hover={{ color: 'font.linkHover' }}
      bg="none"
      color="purple.300"
      fontSize="14px"
      fontWeight={500}
      gap="6px"
      h="fit-content"
      leftIcon={<Calendar height="18px" strokeWidth="1.5px" width="18px" />}
      letterSpacing="-0.28px"
      lineHeight="20px"
      px="0"
      sx={{ '& > span': { marginInlineEnd: '0' } }}
      {...buttonProps}
    >
      {children}
    </Button>
  )
}
