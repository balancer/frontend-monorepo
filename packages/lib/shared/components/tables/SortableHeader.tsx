import {
  Box,
  Button,
  GridItem,
  HStack,
  Popover,
  PopoverTrigger,
  Portal,
  Text,
  GridItemProps,
  TextProps,
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
  containerProps?: GridItemProps
  textProps?: TextProps
}

export function SortableHeader({
  label,
  isSorted,
  onSort,
  sorting,
  align = 'left',
  popoverContent,
  usePortal,
  containerProps,
  textProps,
}: SortableHeaderProps) {
  const renderSortIcon = () => {
    return !isSorted ? <SortableIcon /> : sorting === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />
  }

  const color = isSorted ? 'font.highlight' : 'font.primary'
  const justifySelf = align === 'left' ? 'start' : 'end'

  const HeaderContent = (
    <Button onClick={() => onSort(label.toLowerCase())} size="sm" variant="ghost">
      <HStack alignItems="center" gap="0">
        <Text
          color={color}
          fontWeight="bold"
          textDecoration={popoverContent ? 'underline' : undefined}
          textDecorationStyle={popoverContent ? 'dotted' : undefined}
          textDecorationThickness="1px"
          textUnderlineOffset="4px"
          {...textProps}
        >
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
      <GridItem justifySelf={justifySelf} {...containerProps}>
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

  return (
    <GridItem justifySelf={justifySelf} {...containerProps}>
      {HeaderContent}
    </GridItem>
  )
}
