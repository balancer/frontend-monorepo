'use client'
import { Flex, Icon } from '@chakra-ui/react'
import { LuTriangle } from 'react-icons/lu'

interface Props {
  direction?: undefined | 'asc' | 'desc'
}

export function SortingIcon({ direction }: Props) {
  return (
    <Flex direction="column">
      <Icon
        aria-label={direction === 'asc' ? 'sorted ascending' : 'unsorted'}
        asChild
        color={direction === 'asc' ? 'black' : 'lightgrey'}
      >
        <LuTriangle />
      </Icon>
      <Icon
        aria-label={direction === 'desc' ? 'sorted descending' : 'unsorted'}
        asChild
        color={direction === 'desc' ? 'black' : 'lightgrey'}
      >
        <LuTriangle />
      </Icon>
    </Flex>
  )
}
