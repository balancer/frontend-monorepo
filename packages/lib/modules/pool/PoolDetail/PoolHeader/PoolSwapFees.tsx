import { Badge, HStack, Text, Box } from '@chakra-ui/react'
import { fNum, fNumCustom } from '@repo/lib/shared/utils/numbers'
import { Repeat } from 'react-feather'
import { Pool } from '../../pool.types'
import { shouldCallComputeDynamicSwapFee } from '../../pool.utils'
import { FluidIcon } from '@repo/lib/shared/components/icons/FluidIcon'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { CustomPopover } from '@repo/lib/shared/components/popover/CustomPopover'
import {
  FeeManagersId,
  FeeManagersMetadata,
} from '@repo/lib/modules/fee-managers/getFeeManagersMetadata'
import { abbreviateAddress } from '@repo/lib/shared/utils/addresses'
import { useFeeManager } from '@repo/lib/modules/fee-managers/useFeeManager'
import { zeroAddress } from 'viem'
import { hasSurgeHook, isV3Pool } from '../../pool.helpers'

function getBodyText(
  isDynamicSwapFee: boolean | null | undefined,
  swapFeeManager: string | null | undefined,
  feeManager: FeeManagersMetadata | null | undefined,
  isV3: boolean
) {
  if (isDynamicSwapFee) {
    return 'This pool has a dynamic fee rate that may change per swap based on custom logic.'
  }

  if (feeManager?.id === FeeManagersId.EZKL) {
    return 'This pool has volatility adjusted dynamic fees managed by EZKL through a verifiable computation system that combines off-chain statistical modeling with on-chain zk proof verification.'
  }

  if (swapFeeManager) {
    const delegateOwnerText = `This pool has an editable swap fee that may be updated via ${PROJECT_CONFIG.projectName} governance in the future.`

    switch (swapFeeManager) {
      case PROJECT_CONFIG.delegateOwner:
        return delegateOwnerText
      case zeroAddress:
        return isV3
          ? delegateOwnerText
          : 'Swap fees for this pool are immutable. The swap fee is fixed and cannot be updated by anyone.'
      default:
        return `This pool has an editable swap fee that may be updated by this 3rd party Swap Fee Manager: ${abbreviateAddress(swapFeeManager)}`
    }
  }
}

export function PoolSwapFees({ pool }: { pool: Pool }) {
  const { feeManager } = useFeeManager(pool)
  const isDynamicSwapFee = shouldCallComputeDynamicSwapFee(pool)

  const isV3 = isV3Pool(pool)
  const hasStableSurgeHook = hasSurgeHook(pool)

  const feePercentage = fNumCustom(pool.dynamicData.swapFee, '0.00[00]%')

  let headerText: string
  if (hasStableSurgeHook) {
    headerText = 'Dynamic Stable Surge swap fees'
  } else if (pool.swapFeeManager === zeroAddress && !isV3) {
    headerText = `Fixed forever swap fees: ${feePercentage}`
  } else if (feeManager?.id === FeeManagersId.EZKL) {
    headerText = `EZKL-set swap fees: ${feePercentage}`
  } else if (pool.swapFeeManager === PROJECT_CONFIG.delegateOwner) {
    headerText = `Swap fees: ${feePercentage}`
  } else if (pool.swapFeeManager === zeroAddress && isV3) {
    headerText = `Swap fees: ${feePercentage}`
  } else if (pool.swapFeeManager && pool.swapFeeManager !== zeroAddress) {
    headerText = `3rd party set swap fees: ${feePercentage}`
  } else {
    headerText = `Swap fees: ${feePercentage}`
  }

  return (
    <CustomPopover
      bodyText={getBodyText(isDynamicSwapFee, pool.swapFeeManager, feeManager, isV3)}
      headerText={headerText}
      trigger="hover"
      useIsOpen
    >
      {({ isOpen }) => (
        <Badge
          alignItems="center"
          background="background.level2"
          border="1px solid"
          borderColor={isOpen ? 'font.highlight' : 'border.base'}
          cursor="default"
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
