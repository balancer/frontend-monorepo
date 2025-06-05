import { Badge, HStack, Text, Image } from '@chakra-ui/react'
import { PoolTag } from './getPoolTags'
import { usePool } from '../PoolProvider'
import { isValidNumber } from '@repo/lib/shared/utils/numbers'
import { usePoolTags } from './PoolTagsProvider'
import { CustomPopover } from '@repo/lib/shared/components/popover/CustomPopover'

function TagValue({ tag }: { tag: PoolTag }) {
  if (tag.value) {
    if (tag.id.includes('points') && isValidNumber(tag.value)) {
      return <Text ml="xs" mr="xs" fontSize="xs" fontWeight="bold">{`${tag.value}x`}</Text>
    }
  }
  return null
}

interface PoolTagBadgeProps {
  tag: PoolTag
  size?: 'sm' | 'md'
}

function PoolTagBadge({ tag, size = 'md' }: PoolTagBadgeProps) {
  const { getTagIconSrc } = usePoolTags()
  const tagIconSrc = getTagIconSrc(tag)
  const imageDim = size === 'sm' ? 4 : 6
  const badgeMinH = size === 'sm' ? '26px' : '34px'
  const badgeMl = size === 'sm' && tagIconSrc ? -6 : tagIconSrc ? -9 : 0
  const badgePl = size === 'sm' && tagIconSrc ? 5 : tagIconSrc ? 8 : undefined

  return (
    <CustomPopover
      bodyText={tag.description}
      footerUrl={tag.url}
      headerText={tag.name}
      trigger="hover"
    >
      <HStack>
        {tagIconSrc && (
          <Badge
            alignItems="center"
            bg="background.level2"
            borderColor="border.base"
            borderRadius="full"
            borderWidth={1}
            display="flex"
            p="xs"
            shadow="sm"
            textTransform="none"
            zIndex={2}
          >
            <Image alt={tag.name} h={imageDim} src={tagIconSrc} w={imageDim} />
          </Badge>
        )}
        <Badge
          alignItems="center"
          bg="background.level2"
          borderColor="border.base"
          borderRadius="full"
          borderWidth={1}
          display="flex"
          minH={badgeMinH}
          ml={badgeMl}
          p="xs"
          pl={badgePl}
          shadow="sm"
          textTransform="none"
        >
          {tag.iconUrl ? (
            <Image alt={tag.name} h={imageDim} rounded="full" src={tag.iconUrl} w={imageDim} />
          ) : (
            <Text fontSize="xs" fontWeight="bold" px="sm" textTransform="uppercase">
              {tag.name}
            </Text>
          )}
          <TagValue tag={tag} />
        </Badge>
      </HStack>
    </CustomPopover>
  )
}

export function PoolTags() {
  const { pool } = usePool()
  const { getPoolTags } = usePoolTags()

  const poolTags = getPoolTags(pool)

  return (
    <HStack wrap="wrap" justifyContent="end" gap="6px">
      {poolTags.map(tag => (
        <PoolTagBadge key={tag.id} tag={tag} size={poolTags.length > 3 ? 'sm' : undefined} />
      ))}
    </HStack>
  )
}
