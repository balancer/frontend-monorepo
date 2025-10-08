import { Box, Text, HStack, Skeleton } from '@chakra-ui/react'

export function StatRow({
  label,
  value,
  secondaryValue,
  tertiaryValue,
  isLoading,
}: {
  label: string
  value: string
  secondaryValue?: string
  tertiaryValue?: string
  isLoading?: boolean
}) {
  return (
    <HStack align="flex-start" justify="space-between" w="full">
      <Text color="font.secondary">{label}</Text>
      <Box alignItems="flex-end" display="flex" flexDirection="column">
        {isLoading ? <Skeleton h="16" w="12" /> : <Text fontWeight="bold">{value}</Text>}
        {isLoading && secondaryValue ? (
          <Skeleton h="full" w="12" />
        ) : (
          <Text color="grayText" fontSize="sm">
            {secondaryValue}
          </Text>
        )}
        {isLoading && tertiaryValue ? (
          <Skeleton h="full" w="12" />
        ) : (
          <Text color="grayText" fontSize="sm">
            {tertiaryValue}
          </Text>
        )}
      </Box>
    </HStack>
  )
}
