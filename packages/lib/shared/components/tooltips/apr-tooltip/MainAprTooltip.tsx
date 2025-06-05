import {
  Box,
  Button,
  Center,
  HStack,
  Icon,
  PopoverContent,
  Text,
  TextProps,
  useColorModeValue,
} from '@chakra-ui/react'
import BaseAprTooltip, { BaseAprTooltipProps } from './BaseAprTooltip'
import { Info } from 'react-feather'
import { getTotalAprLabel } from '@repo/lib/modules/pool/pool.utils'
import StarsIcon from '../../icons/StarsIcon'
import { PoolListItem } from '@repo/lib/modules/pool/pool.types'
import { FeaturedPool } from '@repo/lib/modules/pool/PoolProvider'
import { Pool } from '@repo/lib/modules/pool/pool.types'
import { isLBP, isQuantAmmPool } from '@repo/lib/modules/pool/pool.helpers'
import { GqlPoolAprItemType } from '@repo/lib/shared/services/api/generated/graphql'
import StarIcon from '../../icons/StarIcon'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { isPool } from '@repo/lib/modules/pool/pool-tokens.utils'
import { bn } from '@repo/lib/shared/utils/numbers'

interface Props
  extends Omit<
    BaseAprTooltipProps,
    'children' | 'totalBaseText' | 'totalBaseVeBalText' | 'maxVeBalText' | 'poolType'
  > {
  textProps?: TextProps
  onlySparkles?: boolean
  aprLabel?: boolean
  apr?: string
  height?: string
  pool: Pool | PoolListItem | FeaturedPool
  id?: string
}

export function SparklesIcon({
  isOpen,
  pool,
  id,
  hoverColor,
}: {
  isOpen: boolean
  pool: Pool | PoolListItem | FeaturedPool
  id?: string
  hoverColor?: string
}) {
  const hasRewardApr =
    pool.dynamicData.aprItems.filter(item =>
      [
        GqlPoolAprItemType.Staking,
        GqlPoolAprItemType.VebalEmissions,
        GqlPoolAprItemType.Merkl,
      ].includes(item.type)
    ).length > 0

  const hasOnlySwapApr =
    pool.dynamicData.aprItems.filter(item => item.type === GqlPoolAprItemType.SwapFee_24H)
      .length === pool.dynamicData.aprItems.length

  const defaultGradFrom = useColorModeValue(
    '#91A1B6', // light from
    '#A0AEC0' // dark from
  )
  const defaultGradTo = useColorModeValue(
    '#BCCCE1', // light to
    '#E9EEF5' // dark to
  )

  const corePoolGradFrom = useColorModeValue(
    '#BFA672', // light from
    '#AE8C56' // dark from
  )
  const corePoolGradTo = useColorModeValue(
    '#D9C47F', // light to
    '#F4EAD2' // dark to
  )

  const rewardsGradFrom = useColorModeValue(
    '#F49A55', // light from
    '#F49175' // dark from
  )
  const rewardsGradTo = useColorModeValue(
    '#FCD45B', // light to
    '#FFCC33' // dark to
  )

  let gradFromColor = defaultGradFrom
  let gradToColor = defaultGradTo

  if (pool.id === PROJECT_CONFIG.corePoolId) {
    gradFromColor = corePoolGradFrom
    gradToColor = corePoolGradTo
  }

  if (hasRewardApr) {
    gradFromColor = rewardsGradFrom
    gradToColor = rewardsGradTo
  }

  return (
    <Box h="auto" minW="16px" w="16px">
      <Center w="16px">
        {isLBP(pool.type) ? (
          <Icon as={Info} boxSize={4} color={isOpen ? 'inherit' : 'gray.400'} />
        ) : hasOnlySwapApr ? (
          <Icon
            as={StarIcon}
            boxSize={4}
            gradFrom={isOpen ? hoverColor : defaultGradFrom}
            gradTo={isOpen ? hoverColor : defaultGradTo}
            id={id || ''}
          />
        ) : (
          <Icon
            as={StarsIcon}
            gradFrom={isOpen ? hoverColor : gradFromColor}
            gradTo={isOpen ? hoverColor : gradToColor}
            id={id || ''}
          />
        )}
      </Center>
    </Box>
  )
}

function MainAprTooltip({
  onlySparkles,
  textProps,
  apr,
  vebalBoost,
  aprLabel,
  height = '16px',
  pool,
  id,
  ...props
}: Props) {
  const canBeNegative = isQuantAmmPool(pool.type)
  const aprToShow = apr || getTotalAprLabel(pool.dynamicData.aprItems, vebalBoost, canBeNegative)
  const isAprNegative = bn(aprToShow).lt(0)

  // hoverColor here is used for the text and therefore can use a semantic token
  const hoverColor = isLBP(pool.type) ? 'inherit' : isAprNegative ? 'font.error' : 'font.highlight'

  const customPopoverContent = isLBP(pool.type) ? (
    <PopoverContent p="md">
      <Text color="font.secondary" fontSize="sm">
        LBP APRs cannot be realized by LPs.
      </Text>
    </PopoverContent>
  ) : undefined

  return (
    <BaseAprTooltip
      {...props}
      chain={pool.chain}
      customPopoverContent={customPopoverContent}
      hookType={isPool(pool) ? pool.hook?.type : undefined}
      maxVeBalText="Total max veBAL APR"
      poolType={pool.type}
      totalBaseText={hasVeBalBoost => `Total ${hasVeBalBoost ? 'base' : ''} APR`}
      totalBaseVeBalText="Total base APR"
      vebalBoost={vebalBoost}
    >
      {({ isOpen }) => (
        <HStack align="center" alignItems="center">
          <Button _focus={{ outline: 'none' }} h={height} px="0" variant="unstyled">
            <HStack
              _hover={{ color: hoverColor }}
              color={isOpen ? hoverColor : 'font.primary'}
              gap="xs"
              opacity={isLBP(pool.type) ? 0.5 : 1}
            >
              {!onlySparkles && (
                <Text
                  color={isOpen ? hoverColor : 'font.primary'}
                  noOfLines={2}
                  textAlign="left"
                  textDecoration={isLBP(pool.type) ? 'line-through' : 'none'}
                  whiteSpace="pre-wrap"
                  {...textProps}
                >
                  {aprToShow}
                  {aprLabel ? ' APR' : ''}
                </Text>
              )}
              <SparklesIcon
                id={id}
                isOpen={isOpen}
                pool={pool}
                // hoverColor here is used for the icon and therefore needs to be a color
                hoverColor={isAprNegative ? 'red' : 'green'}
              />
            </HStack>
          </Button>
        </HStack>
      )}
    </BaseAprTooltip>
  )
}

export default MainAprTooltip
