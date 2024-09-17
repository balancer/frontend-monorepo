import { ButtonProps, Text, VStack, HStack, Button, Icon } from '@chakra-ui/react'
import { ChevronDown, ChevronUp } from 'react-feather'

interface Props extends ButtonProps {
  title: string
  isDesc: boolean
  isCurrentSort: boolean
}

const getColor = (isCurrentSort: boolean) => (isCurrentSort ? 'text.special' : 'default') // TODO: text.special doesn't work

export default function PoolListSortButton({ title, isDesc, isCurrentSort, ...rest }: Props) {
  return (
    <Button
      size="sm"
      variant="ghost"
      {...rest}
      color={isCurrentSort ? 'font.highlight' : 'font.primary'}
      fontWeight="bold"
      position="relative"
      right="-8px"
    >
      <HStack>
        <Text color={isCurrentSort ? 'font.highlight' : 'font.primary'} fontWeight="bold">
          {title}
        </Text>
        <VStack alignContent="center" gap="0" spacing="0">
          {(!isCurrentSort || !isDesc) && (
            <Icon as={ChevronUp} size="10" color={getColor(isCurrentSort)} />
          )}
          {(!isCurrentSort || isDesc) && (
            <Icon as={ChevronDown} size="10" color={getColor(isCurrentSort)} />
          )}
        </VStack>
      </HStack>
    </Button>
  )
}
