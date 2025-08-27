'use client'

import { Box, Button, ButtonProps, Link } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import NextLink from 'next/link'
import { ArrowUpRight } from 'react-feather'

export function BalAlertButtonLink({
  href,
  external = true,
  children,
}: PropsWithChildren<ButtonProps> & { href: string; external?: boolean }) {
  const externalAttr = external ? { rightIcon: <ArrowUpRight size="14" />, isExternal: true } : {}
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
        as={external ? Link : NextLink}
        borderColor="font.dark"
        color="font.dark"
        fontSize="sm"
        h="32px"
        href={href}
        my="-1"
        px="sm"
        py="ms"
        variant="outline"
        width="auto"
        {...externalAttr}
      >
        {children}
      </Button>
    </Box>
  )
}
