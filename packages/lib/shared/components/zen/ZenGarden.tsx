import { Box, BoxProps, useColorModeValue } from '@chakra-ui/react'
import { GqlPoolType } from '../../services/api/generated/graphql'
import { isClp, isStable, isWeighted, isCowAmmPool } from '@repo/lib/modules/pool/pool.helpers'
import { CowSandPattern } from '../imgs/CowSandPattern'

type ZenGardenVariant = 'diamond' | 'circle' | 'square' | 'pill'

type Props = {
  sizePx: string
  heightPx?: string
  variant: ZenGardenVariant
  subdued?: boolean
  repetitions?: number
} & BoxProps

const commonProps = (subdued = false) =>
  ({
    position: 'absolute',
    left: '0',
    right: '0',
    top: '50%',
    shadow: subdued ? 'none' : 'zen',
    marginX: 'auto',
    borderWidth: 1,
    transformOrigin: '50% 0',
    borderColor: subdued ? 'border.subduedZen' : 'border.zen',
  }) as BoxProps

function getZenGardenProps(
  variant: ZenGardenVariant,
  widthPx: string,
  heightPx: string,
  subdued = false
) {
  switch (variant) {
    case 'circle':
      return {
        ...commonProps(subdued),
        rounded: 'full',
        height: heightPx,
        width: widthPx,
      }
    case 'pill':
      return {
        ...commonProps(subdued),
        rounded: 'full',
        height: heightPx,
        width: widthPx,
      }
    case 'square':
      return {
        ...commonProps(subdued),
        height: heightPx,
        width: widthPx,
        rounded: '80px',
      }
    case 'diamond':
      return {
        ...commonProps(subdued),
        height: heightPx,
        width: widthPx,
        rounded: '80px',
      }
    default:
      return {
        ...commonProps(subdued),
        rounded: 'full',
        height: heightPx,
        width: widthPx,
      }
  }
}

function getShapeTransform(variant: ZenGardenVariant, i: number) {
  if (variant === 'diamond') {
    return `scale(1.${i}) rotate(45deg) translateY(-50%)`
  }
  return `scale(1.${i}) translateY(-50%)`
}

export function ZenGarden({
  sizePx,
  heightPx,
  variant,
  transform,
  subdued = false,
  repetitions = 8,
  ...rest
}: Props) {
  const shapeProps = getZenGardenProps(variant, sizePx, heightPx || sizePx, subdued)

  return [...Array(repetitions).keys()].map((_, i) => (
    <Box
      // eslint-disable-next-line react/no-array-index-key
      key={`zen-garden-${variant}-${i}`}
      zIndex={0}
      {...shapeProps}
      {...rest}
      transform={`${getShapeTransform(variant, i)} ${transform || ''}`}
    />
  ))
}

export function PoolZenGarden({
  poolType,
  sizePx,
  subdued = true,
  repetitions,
}: {
  poolType?: GqlPoolType
  sizePx: string
  subdued?: boolean
  repetitions?: number
}) {
  const strokeColor = useColorModeValue('hsla(88, 63%, 59%, 0.4)', 'hsla(83, 81%, 80%, 0.1)')

  if (!poolType) {
    return (
      <ZenGarden repetitions={repetitions} sizePx={sizePx} subdued={subdued} variant="circle" />
    )
  }
  if (isWeighted(poolType)) {
    return (
      <ZenGarden repetitions={repetitions} sizePx={sizePx} subdued={subdued} variant="circle" />
    )
  }
  if (isCowAmmPool(poolType)) {
    return (
      <Box height="100%" position="absolute" top="0" width="100%" zIndex="0">
        <CowSandPattern color={strokeColor} height="100%" width="100%" />
      </Box>
    )
  }
  if (isStable(poolType)) {
    return (
      <ZenGarden repetitions={repetitions} sizePx={sizePx} subdued={subdued} variant="square" />
    )
  }
  if (isClp(poolType)) {
    return (
      <ZenGarden repetitions={repetitions} sizePx={sizePx} subdued={subdued} variant="diamond" />
    )
  }
}
