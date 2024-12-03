import { Box, BoxProps } from '@chakra-ui/react'

export function RadialPattern2({ ...rest }: BoxProps) {
  return (
    <Box
      borderRadius="50%"
      boxShadow="-10px -10px 30px 1px rgba(255, 255, 255, 0.1), inset 10px 10px 30px 1px rgba(0, 0, 0, 0.3), 10px 10px 30px 1px rgba(0, 0, 0, 0.3), inset -10px -10px 30px 1px rgba(255, 255, 255, 0.1)"
      h="200px"
      position="relative"
      w="200px"
      {...rest}
    />
  )
}
