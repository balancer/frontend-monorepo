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
        as={NextLink}
        target="_blank"
        href={href}
        width="auto"
        variant="outline"
        h="32px"
        py="ms"
        px="sm"
        my="-1"
        color="font.dark"
        borderColor="font.dark"
        fontSize="sm"
        _hover={{
          transform: 'scale(1.05)',
          color: 'font.dark',
          borderColor: 'font.dark',
          backgroundColor: 'transparent',
        }}
        _active={{
          borderColor: 'font.dark',
          color: 'green',
        }}
        rightIcon={<ArrowUpRight size="14" />}
      >
        {children}
      </Button>
    </Box>
  )
}
