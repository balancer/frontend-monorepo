import {
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  Text,
  Link,
  HStack,
} from '@chakra-ui/react'
import { ArrowUpRight } from 'react-feather'

type PoolHeaderPopoverContentProps = {
  headerTxt: string
  bodyTxt: string
  footerUrl?: string
}

export function PoolHeaderPopoverContent({
  headerTxt,
  bodyTxt,
  footerUrl,
}: PoolHeaderPopoverContentProps) {
  return (
    <PopoverContent maxW="300px" p="sm" w="auto">
      <PopoverArrow bg="background.level3" />
      <PopoverCloseButton />
      <PopoverHeader>
        <Text color="font.primary" fontWeight="bold" size="md">
          {headerTxt}
        </Text>
      </PopoverHeader>
      <PopoverBody>
        <Text fontSize="sm" variant="secondary">
          {bodyTxt}
        </Text>
      </PopoverBody>
      {footerUrl && (
        <PopoverFooter>
          <Link href={footerUrl} target="_blank" variant="link">
            <HStack gap="xxs">
              <Text color="link">Learn more</Text>
              <ArrowUpRight size={12} />
            </HStack>
          </Link>
        </PopoverFooter>
      )}
    </PopoverContent>
  )
}
