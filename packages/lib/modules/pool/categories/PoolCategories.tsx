import {
  Badge,
  HStack,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  Text,
  PopoverTrigger,
  VStack,
  Image,
  Button,
  Link,
} from '@chakra-ui/react'
import { PoolCategory } from './getPoolCategories'
import { usePool } from '../PoolProvider'
import { usePoolCategories } from './PoolCategoriesProvider'
import NextLink from 'next/link'
import { isInteger, toNumber } from 'lodash'

function PoolCategoryBadge({ category }: { category: PoolCategory }) {
  const { getCategoryIconSrc } = usePoolCategories()
  const categoryIconSrc = getCategoryIconSrc(category)

  function CategoryValue() {
    if (category.value) {
      if (category.id.includes('points') && isInteger(toNumber(category.value))) {
        return <Text ml="xs" mr="xs">{`${category.value}x`}</Text>
      }
    }
    return null
  }

  return (
    <Popover trigger="hover">
      <PopoverTrigger>
        <HStack>
          {categoryIconSrc && (
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
              <Image alt={category.name} h={6} src={categoryIconSrc} w={6} />
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
            ml={categoryIconSrc ? -9 : 0}
            p="xs"
            pl={categoryIconSrc ? 8 : undefined}
            shadow="sm"
            textTransform="none"
          >
            {category.iconUrl ? (
              <Image alt={category.name} h={6} rounded="full" src={category.iconUrl} w={6} />
            ) : (
              <Text fontSize="xs" fontWeight="bold" px="sm" textTransform="uppercase">
                {category.name}
              </Text>
            )}
            <CategoryValue />
          </Badge>
        </HStack>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow bg="background.level3" />
        <PopoverCloseButton />
        <PopoverBody>
          <VStack align="start" spacing="md">
            <VStack align="start" spacing="xs">
              <Text fontSize="lg" fontWeight="bold">
                {category.name}
              </Text>
              {category.url && (
                <Link color="grayText" fontSize="sm" href={category.url} isExternal>
                  {category.url}
                </Link>
              )}
            </VStack>
            <Text>{category.description}</Text>
            {category.url && (
              <Button
                as={NextLink}
                href={category.url}
                rel="noreferrer"
                size="sm"
                target="_blank"
                variant="secondary"
                w="full"
              >
                Learn more
              </Button>
            )}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export function PoolCategories() {
  const { pool } = usePool()
  const { getPoolCategories } = usePoolCategories()

  const poolCategories = getPoolCategories(pool)

  return (
    <HStack>
      {poolCategories.map(category => (
        <PoolCategoryBadge category={category} key={category.id} />
      ))}
    </HStack>
  )
}
