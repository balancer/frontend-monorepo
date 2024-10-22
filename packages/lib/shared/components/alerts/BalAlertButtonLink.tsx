'use client'

import { Box, Button, ButtonProps } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import NextLink from 'next/link'
import { ArrowUpRight } from 'react-feather'

export function BalAlertButtonLink({
  href,
  children,
}: PropsWithChildren<ButtonProps> & { href: string }) {
  return (
    <Box>
      <Button
        _active={{
          borderColor: 'font.dark',
          color: 'green',
        }}
        _hover={{
          transform: 'scale(1.05)',
          color: 'font.dark',
          borderColor: 'font.dark',
          backgroundColor: 'transparent',
        }}
        as={NextLink}
        borderColor="font.dark"
        color="font.dark"
        fontSize="sm"
        h="32px"
        href={href}
        my="-1"
        px="sm"
        py="ms"
        rightIcon={<ArrowUpRight size="14" />}
        target="_blank"
        variant="outline"
        width="auto"
      >
        {children}
      </Button>
    </Box>
  )
}
