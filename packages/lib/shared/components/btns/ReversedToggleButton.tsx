import { Button, Flex, Text } from '@chakra-ui/react'
import { Icon } from '@chakra-ui/react'
import { Repeat } from 'react-feather'

interface ReversedToggleButtonProps {
  toggleIsReversed: () => void
  tokenPair?: string
}

export function ReversedToggleButton({ toggleIsReversed, tokenPair }: ReversedToggleButtonProps) {
  return (
    <Button
      cursor="pointer"
      fontSize="xs"
      fontWeight="medium"
      height="28px !important"
      minWidth={tokenPair ? 'auto' : '20px !important'}
      ml={0.5}
      onClick={toggleIsReversed}
      px={tokenPair ? '2' : '0 !important'}
      py="0 !important"
      rounded="sm !important"
      shadow="md"
      size="xs"
      variant="tertiary"
      width={tokenPair ? 'auto' : '20px !important'}
    >
      <Flex alignItems="center" gap="1.5">
        <Icon as={Repeat} />
        {tokenPair && (
          <Text fontSize="xs" fontWeight="medium">
            {tokenPair}
          </Text>
        )}
      </Flex>
    </Button>
  )
}
