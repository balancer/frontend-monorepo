import { Box, Text, HStack, Skeleton } from '@chakra-ui/react'

export function StatRow({
  label,
  value,
  secondaryValue,
  isLoading,
}: {
  label: string
  value: string
  secondaryValue?: string
  isLoading?: boolean
}) {
  return (
    <HStack align="flex-start" justify="space-between" w="full">
      <Text color="font.secondary">{label}</Text>
      <Box alignItems="flex-end" display="flex" flexDirection="column">
        {isLoading ? <Skeleton h="full" w="12" /> : <Text fontWeight="bold">{value}</Text>}
        {isLoading ? (
          <Skeleton h="full" w="12" />
        ) : (
          <Text color="grayText" fontSize="sm">
            {secondaryValue}
          </Text>
        )}
      </Box>
    </HStack>
  )
}
