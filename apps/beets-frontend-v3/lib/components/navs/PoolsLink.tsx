import {
  Box,
  Button,
  Heading,
  HStack,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react'
import { useNav } from '@repo/lib/shared/components/navs/useNav'
import NextLink from 'next/link'

function PoolNetworkLink({
  text,
  href,
  isLast,
  onClose,
}: {
  text: string
  href: string
  isLast?: boolean
  onClose: () => void
}) {
  return (
    <Link as={NextLink} href={href} color="font.primary" variant="nav" onClick={onClose}>
      <Box
        width="100%"
        px="sm"
        height="36px"
        display="flex"
        alignItems="center"
        _hover={{ bg: 'background.level2' }}
        borderBottomLeftRadius={isLast ? 'md' : '0'}
        borderBottomRightRadius={isLast ? 'md' : '0'}
      >
        {text}
      </Box>
    </Link>
  )
}

export function PoolsLink() {
  const { linkColorFor } = useNav()

  return (
    <Popover>
      {({ isOpen, onClose }) => (
        <>
          <PopoverTrigger>
            <Button
              color={linkColorFor('/pools')}
              variant="nav"
              style={{ padding: '0px', height: '24px' }}
              fontWeight="medium"
              _hover={{ color: 'font.link' }}
            >
              Pools
            </Button>
          </PopoverTrigger>
          <PopoverContent w="220px">
            <PopoverArrow bg="background.level3" />
            <PopoverCloseButton />
            <PopoverHeader fontWeight="bold">Select a network</PopoverHeader>
            <PopoverBody p="0">
              <PoolNetworkLink text="Sonic" href="/pools?networks=SONIC" onClose={onClose} />
              <PoolNetworkLink text="Optimism" href="/pools?networks=OPTIMISM" onClose={onClose} />
              <PoolNetworkLink text="All Networks" href="/pools" isLast={true} onClose={onClose} />
            </PopoverBody>
          </PopoverContent>
        </>
      )}
    </Popover>
  )
}
