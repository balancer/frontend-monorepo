import { Box, Button, Center, HStack, Icon, Text, TextProps, Popover } from '@chakra-ui/react';
import { useThemeColorMode } from '@repo/lib/shared/services/chakra/useThemeColorMode';
import BaseAprTooltip, { BaseAprTooltipProps } from './BaseAprTooltip'
import { Info } from 'react-feather'
import { getTotalAprLabel } from '@repo/lib/modules/pool/pool.utils'
import StarsIcon from '../../icons/StarsIcon'
import { PoolListItem } from '@repo/lib/modules/pool/pool.types'
import { FeaturedPool } from '@repo/lib/modules/pool/PoolProvider'
import { Pool } from '@repo/lib/modules/pool/pool.types'
import { isLBP } from '@repo/lib/modules/pool/pool.helpers'
import { GqlPoolAprItemType } from '@repo/lib/shared/services/api/generated/graphql'
import StarIcon from '../../icons/StarIcon'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { isPool } from '@repo/lib/modules/pool/pool-tokens.utils'
import { bn } from '@repo/lib/shared/utils/numbers'

interface Props extends Omit<
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
  hoverColor }: {
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

  const colorMode = useThemeColorMode()
  const defaultGradFrom = colorMode === 'dark' ? '#A0AEC0' : '#91A1B6'
  const defaultGradTo = colorMode === 'dark' ? '#E9EEF5' : '#BCCCE1'

  const corePoolGradFrom = colorMode === 'dark' ? '#AE8C56' : '#BFA672'
  const corePoolGradTo = colorMode === 'dark' ? '#F4EAD2' : '#D9C47F'

  const rewardsGradFrom = colorMode === 'dark' ? '#F49175' : '#F49A55'
  const rewardsGradTo = colorMode === 'dark' ? '#FFCC33' : '#FCD45B'

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
          <Icon boxSize={4} color={isOpen ? 'inherit' : 'gray.400'} asChild><Info /></Icon>
        ) : hasOnlySwapApr ? (
          <Icon
            boxSize={4}
            gradFrom={isOpen ? hoverColor : defaultGradFrom}
            gradTo={isOpen ? hoverColor : defaultGradTo}
            id={id || ''}
            asChild><StarIcon /></Icon>
        ) : (
          <Icon
            gradFrom={isOpen ? hoverColor : gradFromColor}
            gradTo={isOpen ? hoverColor : gradToColor}
            id={id || ''}
            asChild><StarsIcon /></Icon>
        )}
      </Center>
    </Box>
  );
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
  const aprToShow = apr || getTotalAprLabel(pool.dynamicData.aprItems, vebalBoost, true)
  const isAprNegative = bn(aprToShow.replace('%', '')).lt(0)

  // hoverColor here is used for the text and therefore can use a semantic token
  const hoverColor = isLBP(pool.type)
    ? 'inherit'
    : isAprNegative
      ? 'font.warning'
      : 'font.highlight'

  const customPopoverContent = isLBP(pool.type) ? (
    <Popover.Positioner>
      <Popover.Content p="md">
        <Text color="font.secondary" fontSize="sm">
          LBP APRs cannot be realized by LPs.
        </Text>
      </Popover.Content>
    </Popover.Positioner>
  ) : undefined

  return (
    <BaseAprTooltip
      {...props}
      chain={pool.chain}
      customPopoverContent={customPopoverContent}
      hookType={isPool(pool) ? pool.hook?.type : undefined}
      maxVeBalText="Total APR with veBAL boost"
      poolType={pool.type}
      totalBaseText={hasVeBalBoost => `Total ${hasVeBalBoost ? 'base' : ''} APR`}
      totalBaseVeBalText="Total base APR"
      vebalBoost={vebalBoost}
    >
      {({ isOpen }) => (
        <HStack align="center" alignItems="center">
          <Button _focus={{ outline: 'none' }} h={height} px="0" unstyled>
            <HStack
              _hover={{ color: hoverColor }}
              color={isOpen ? hoverColor : 'font.primary'}
              gap="xs"
              opacity={isLBP(pool.type) ? 0.5 : 1}
            >
              {!onlySparkles && (
                <Text
                  color={isOpen || isAprNegative ? hoverColor : 'font.primary'}
                  lineClamp={2}
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
                hoverColor={isAprNegative ? '#f97316' : 'green'} // hoverColor here is used for the icon and therefore needs to be a color
                id={id}
                open={isOpen}
                pool={pool}
              />
            </HStack>
          </Button>
        </HStack>
      )}
    </BaseAprTooltip>
  );
}

export default MainAprTooltip
