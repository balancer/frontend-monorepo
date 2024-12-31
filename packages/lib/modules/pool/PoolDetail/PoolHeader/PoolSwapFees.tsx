/* eslint-disable max-len */
import {
  Popover,
  PopoverTrigger,
  Badge,
  HStack,
  PopoverContent,
  Text,
  VStack,
  Box,
} from '@chakra-ui/react'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { Repeat } from 'react-feather'
import { Pool } from '../../PoolProvider'
import { shouldCallComputeDynamicSwapFee } from '../../pool.utils'
import { FluidIcon } from '@repo/lib/shared/components/icons/FluidIcon'
import { useProjectConfig } from '@repo/lib/config/ProjectConfigProvider'

export function PoolSwapFees({ pool }: { pool: Pool }) {
  const { projectName } = useProjectConfig()
  const isDynamicSwapFee = shouldCallComputeDynamicSwapFee(pool)

  return (
    <Popover trigger="hover">
      {({ isOpen }) => (
        <>
          <PopoverTrigger>
            <Badge
              alignItems="center"
              background="background.level2"
              border="1px solid"
              borderColor={isOpen ? 'font.highlight' : 'border.base'}
              display="flex"
              fontWeight="normal"
              h={{ base: '28px' }}
              px="sm"
              py="sm"
              rounded="full"
              shadow="sm"
            >
              <HStack color={isOpen ? 'font.highlight' : 'font.primary'}>
                <Repeat size={12} />
                {isDynamicSwapFee ? (
                  <Box color={isOpen ? 'font.highlight' : 'font.secondary'}>
                    <FluidIcon />
                  </Box>
                ) : (
                  <Text color={isOpen ? 'font.highlight' : 'inherit'} fontSize="xs">
                    {fNum('feePercent', pool.dynamicData.swapFee)}
                  </Text>
                )}
              </HStack>
            </Badge>
          </PopoverTrigger>
          <PopoverContent maxW="300px" p="sm" w="auto">
            <VStack alignItems="flex-start">
              <Text color="font.secondary" fontWeight="bold" size="md">
                Dynamic fee percentage
              </Text>
              {isDynamicSwapFee ? (
                <Text fontSize="sm" variant="secondary">
                  This pool has a dynamic fee rate that may change per swap based on custom logic.
                </Text>
              ) : (
                <Text fontSize="sm" variant="secondary">
                  {`This pool has a dynamic fee rate that may be updated through ${projectName} governance.`}
                </Text>
              )}
            </VStack>
          </PopoverContent>
        </>
      )}
    </Popover>
  )
}
