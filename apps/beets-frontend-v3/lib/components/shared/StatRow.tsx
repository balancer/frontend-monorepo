import { Box, Text, HStack, Skeleton } from '@chakra-ui/react'

export function StatRow({
  label,
  value,
  secondaryValue,
  tertiaryValue,
  loading,
}: {
  label: string
  value: string
  secondaryValue?: string
  tertiaryValue?: string
  loading?: boolean
}) {
  return (
    <HStack align="flex-start" justify="space-between" w="full">
      <Text color="font.secondary">{label}</Text>
      <Box alignItems="flex-end" display="flex" flexDirection="column">
        {loading ? <Skeleton h="16px" my="2px" w="80px" /> : <Text fontWeight="bold">{value}</Text>}
        {secondaryValue && (
          <>
            {loading ? (
              <Skeleton h="16px" my="2px" w="80px" />
            ) : (
              <Text color="grayText" fontSize="sm">
                {secondaryValue}
              </Text>
            )}
          </>
        )}
        {tertiaryValue && (
          <>
            {loading ? (
              <Skeleton h="16px" my="2px" w="80px" />
            ) : (
              <Text color="grayText" fontSize="sm">
                {tertiaryValue}
              </Text>
            )}
          </>
        )}
      </Box>
    </HStack>
  )
}
