'use client'

import {
  Box,
  Button,
  HStack,
  Heading,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  VStack,
} from '@chakra-ui/react'
import { Tool } from 'react-feather'
import { useImpersonateAccount } from './useImpersonateAccount'
import { isAddress } from 'viem'
import TimeMocker from './TimeMocker'

type Props = {
  impersonatedAddress: string
  setIsFakeTime: (isFakeTime: boolean) => void
}
export function ImpersonatorSettings({ impersonatedAddress, setIsFakeTime }: Props) {
  const { reset } = useImpersonateAccount()

  return (
    <Popover isLazy>
      <PopoverTrigger>
        <Button p="0" variant="tertiary">
          <Tool size={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow bg="background.level3" />
        <PopoverCloseButton />
        <PopoverBody p="0">
          <HStack color="font.primary" p="md" pb="0">
            <Tool size={20} />
            <Heading size="md" variant="special">
              Impersonation settings
            </Heading>
          </HStack>
          <VStack align="start" p="md" spacing="lg">
            <Box w="full">
              <Button disabled={!isAddress(impersonatedAddress)} onClick={() => reset()}>
                Reset fork
              </Button>
            </Box>
            <Box w="full">
              <Heading pb="2" size="sm">
                Time Travel
              </Heading>
              <TimeMocker setIsFakeTime={setIsFakeTime} />
            </Box>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
