/* eslint-disable max-len */
import { Badge, HStack, Text, Box } from '@chakra-ui/react'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { Repeat } from 'react-feather'
import { Pool } from '../../pool.types'
import { shouldCallComputeDynamicSwapFee } from '../../pool.utils'
import { FluidIcon } from '@repo/lib/shared/components/icons/FluidIcon'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { CustomPopover } from '@repo/lib/shared/components/popover/CustomPopover'
import { FeeManagersId } from '@repo/lib/modules/fee-managers/getFeeManagersMetadata'
import { abbreviateAddress } from '@repo/lib/shared/utils/addresses'
import { useFeeManager } from 'modules/fee-managers/useFeeManager'
import { FeeManagersMetadata } from 'modules/fee-managers/getFeeManagersMetadata'

function getBodyText(
  isDynamicSwapFee: boolean | null | undefined,
  swapFeeManager: string | null | undefined,
  feeManager: FeeManagersMetadata | null | undefined
) {
  if (isDynamicSwapFee) {
    return 'This pool has a dynamic fee rate that may change per swap based on custom logic.'
  }

  if (feeManager?.id === FeeManagersId.EZKL) {
    return 'This pool has volatility adjusted dynamic fees managed by EZKL through a verifiable computation system that combines off-chain statistical modeling with on-chain zk proof verification.'
  }

  if (swapFeeManager) {
    if (swapFeeManager === PROJECT_CONFIG.delegateOwner) {
      return `This pool has a dynamic fee rate that may be updated through ${PROJECT_CONFIG.projectName} governance.`
    }

    return `This pool has a dynamic fee rate that may be updated by a 3rd party Swap Fee Manager: ${abbreviateAddress(swapFeeManager)}`
  }
}

export function PoolSwapFees({ pool }: { pool: Pool }) {
  const { feeManager } = useFeeManager(pool)

  const isDynamicSwapFee = shouldCallComputeDynamicSwapFee(pool)

  return (
    <CustomPopover
      bodyText={getBodyText(isDynamicSwapFee, pool.swapFeeManager, feeManager)}
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
