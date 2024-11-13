import { Box, Button, GridItem, HStack, Text } from '@chakra-ui/react'
import { SortableIcon } from '../icons/SortableIcon'
import { ArrowDownIcon } from '../icons/ArrowDownIcon'
import { ArrowUpIcon } from '../icons/ArrowUpIcon'

export enum Sorting {
  asc = 'asc',
  desc = 'desc',
}

type SortableHeaderProps = {
  label: string
  isSorted: boolean
  sorting: Sorting
  onSort: (newSortingBy: any) => void
  align?: 'left' | 'right'
}

export function SortableHeader({
  label,
  isSorted,
  onSort,
  sorting,
  align = 'left',
}: SortableHeaderProps) {
  const renderSortIcon = () => {
    return !isSorted ? <SortableIcon /> : sorting === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />
  }

  const color = isSorted ? 'font.highlight' : 'font.primary'

  return (
    <GridItem justifySelf={align === 'left' ? 'start' : 'end'}>
      <Button onClick={() => onSort(label.toLowerCase())} size="sm" variant="ghost">
        <HStack alignItems="center" gap="0">
          <Text color={color} fontWeight="bold">
            {label}
          </Text>
          <Box color={color} fontSize="xs" ml="1">
            {renderSortIcon()}
          </Box>
        </HStack>
      </Button>
    </GridItem>
  )
}
