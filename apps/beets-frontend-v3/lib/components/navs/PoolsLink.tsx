import {
  Box,
  Button,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
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
    <Link as={NextLink} color="font.primary" href={href} onClick={onClose} variant="nav">
      <Box
        _hover={{ bg: 'background.level2' }}
        alignItems="center"
        borderBottomLeftRadius={isLast ? 'md' : '0'}
        borderBottomRightRadius={isLast ? 'md' : '0'}
        display="flex"
        height="36px"
        px="sm"
        width="100%"
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
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <Button
              _hover={{ color: 'font.link' }}
              color={linkColorFor('/pools')}
              fontWeight="medium"
              style={{ padding: '0px', height: '24px' }}
              variant="nav"
            >
              Pools
            </Button>
          </PopoverTrigger>
          <PopoverContent w="220px">
            <PopoverArrow bg="background.level3" />
            <PopoverCloseButton />
            <PopoverHeader fontWeight="bold">Select a network</PopoverHeader>
            <PopoverBody p="0">
              <PoolNetworkLink href="/pools?networks=SONIC" onClose={onClose} text="Sonic" />
              <PoolNetworkLink href="/pools?networks=OPTIMISM" onClose={onClose} text="Optimism" />
              <PoolNetworkLink href="/pools" isLast onClose={onClose} text="All Networks" />
            </PopoverBody>
          </PopoverContent>
        </>
      )}
    </Popover>
  )
}
