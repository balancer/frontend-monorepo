import { Box, Button, GridItem, HStack, Text } from '@chakra-ui/react'
import { SortableIcon } from '../icons/SortableIcon'
import { ArrowDownIcon } from '../icons/ArrowDownIcon'
import { ArrowUpIcon } from '../icons/ArrowUpIcon'

type SortableHeaderProps = {
  label: string
  isSorted: boolean
  sorting: 'asc' | 'desc'
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
      <Button size="sm" variant="ghost" onClick={() => onSort(label.toLowerCase())}>
        <HStack gap="0" alignItems="center">
          <Text color={color} fontWeight="bold">
            {label}
          </Text>
          <Box fontSize="xs" ml="1" color={color}>
            {renderSortIcon()}
          </Box>
        </HStack>
      </Button>
    </GridItem>
  )
}
