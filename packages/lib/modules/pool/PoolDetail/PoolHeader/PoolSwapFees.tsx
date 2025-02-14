/* eslint-disable max-len */
import { Badge, HStack, Text, Box } from '@chakra-ui/react'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { Repeat } from 'react-feather'
import { Pool } from '../../pool.types'
import { shouldCallComputeDynamicSwapFee } from '../../pool.utils'
import { FluidIcon } from '@repo/lib/shared/components/icons/FluidIcon'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { CustomPopover } from '@repo/lib/shared/components/popover/CustomPopover'

export function PoolSwapFees({ pool }: { pool: Pool }) {
  const isDynamicSwapFee = shouldCallComputeDynamicSwapFee(pool)

  const bodyText = isDynamicSwapFee
    ? 'This pool has a dynamic fee rate that may change per swap based on custom logic.'
    : `This pool has a dynamic fee rate that may be updated through ${PROJECT_CONFIG.projectName} governance.`

  return (
    <CustomPopover
      bodyText={bodyText}
      headerText="Dynamic fee percentage"
      trigger="hover"
      useIsOpen
    >
      {({ isOpen }) => (
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
      )}
    </CustomPopover>
  )
}
