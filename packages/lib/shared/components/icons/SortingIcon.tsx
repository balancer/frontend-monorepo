'use client'
import { Flex, Icon } from '@chakra-ui/react';
import { LuTriangle } from 'react-icons/lu';

interface Props {
  direction?: undefined | 'asc' | 'desc'
}

export function SortingIcon({ direction }: Props) {
  return (
    <Flex direction="column">
      <Icon
        aria-label={direction === 'asc' ? 'sorted ascending' : 'unsorted'}
        color={direction === 'asc' ? 'black' : 'lightgrey'}
        asChild><LuTriangle /></Icon>
      <Icon
        aria-label={direction === 'desc' ? 'sorted descending' : 'unsorted'}
        color={direction === 'desc' ? 'black' : 'lightgrey'}
        asChild><LuTriangle /></Icon>
    </Flex>
  );
}
