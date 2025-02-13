import { Badge, HStack, Text, Image } from '@chakra-ui/react'
import { PoolTag } from './getPoolTags'
import { usePool } from '../PoolProvider'
import { isValidNumber } from '@repo/lib/shared/utils/numbers'
import { usePoolTags } from './PoolTagsProvider'
import { CustomPopover } from '@repo/lib/shared/components/popover/CustomPopover'

function TagValue({ tag }: { tag: PoolTag }) {
  if (tag.value) {
    if (tag.id.includes('points') && isValidNumber(tag.value)) {
      return <Text ml="xs" mr="xs">{`${tag.value}x`}</Text>
    }
  }
  return null
}

function PoolTagBadge({ tag }: { tag: PoolTag }) {
  const { getTagIconSrc } = usePoolTags()
  const tagIconSrc = getTagIconSrc(tag)

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
            <Image alt={tag.name} h={6} src={tagIconSrc} w={6} />
          </Badge>
        )}
        <Badge
          alignItems="center"
          bg="background.level2"
          borderColor="border.base"
          borderRadius="full"
          borderWidth={1}
          display="flex"
          minH="34px"
          ml={tagIconSrc ? -9 : 0}
          p="xs"
          pl={tagIconSrc ? 8 : undefined}
          shadow="sm"
          textTransform="none"
        >
          {tag.iconUrl ? (
            <Image alt={tag.name} h={6} rounded="full" src={tag.iconUrl} w={6} />
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
    <HStack>
      {poolTags.map(tag => (
        <PoolTagBadge key={tag.id} tag={tag} />
      ))}
    </HStack>
  )
}
