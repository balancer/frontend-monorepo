import {
  Box,
  Button,
  GridItem,
  HStack,
  Popover,
  PopoverTrigger,
  Portal,
  Text,
} from '@chakra-ui/react'
import { SortableIcon } from '../icons/SortableIcon'
import { ArrowDownIcon } from '../icons/ArrowDownIcon'
import { ArrowUpIcon } from '../icons/ArrowUpIcon'
import { ReactNode } from 'react'

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
  popoverContent?: ReactNode
  usePortal?: string
}

export function SortableHeader({
  label,
  isSorted,
  onSort,
  sorting,
  align = 'left',
  popoverContent,
  usePortal,
}: SortableHeaderProps) {
  const renderSortIcon = () => {
    return !isSorted ? <SortableIcon /> : sorting === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />
  }

  const color = isSorted ? 'font.highlight' : 'font.primary'
  const justifySelf = align === 'left' ? 'start' : 'end'

  const HeaderContent = (
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
  )

  if (popoverContent) {
    return (
      <GridItem justifySelf={justifySelf}>
        <Popover placement="top" trigger="hover">
          {() => (
            <>
              <PopoverTrigger>{HeaderContent}</PopoverTrigger>

              {usePortal ? <Portal>{popoverContent}</Portal> : popoverContent}
            </>
          )}
        </Popover>
      </GridItem>
    )
  }

  return <GridItem justifySelf={justifySelf}>{HeaderContent}</GridItem>
}
