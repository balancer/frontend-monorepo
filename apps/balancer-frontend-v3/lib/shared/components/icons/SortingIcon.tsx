'use client'
import { TriangleUpIcon, TriangleDownIcon } from '@chakra-ui/icons'
import { Flex } from '@chakra-ui/react'

interface Props {
  direction?: undefined | 'asc' | 'desc'
}

export function SortingIcon({ direction }: Props) {
  return (
    <Flex direction="column">
      <TriangleUpIcon
        aria-label={direction === 'asc' ? 'sorted ascending' : 'unsorted'}
        color={direction === 'asc' ? 'black' : 'lightgrey'}
      />
      <TriangleDownIcon
        aria-label={direction === 'desc' ? 'sorted descending' : 'unsorted'}
        color={direction === 'desc' ? 'black' : 'lightgrey'}
      />
    </Flex>
  )
}
