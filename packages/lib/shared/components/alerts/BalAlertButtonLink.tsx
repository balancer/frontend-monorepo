'use client'

import { Box, Button, ButtonProps } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import NextLink from 'next/link'
import { ArrowUpRight } from 'react-feather'

export function BalAlertButtonLink({
  href,
  external = true,
  children,
}: PropsWithChildren<ButtonProps> & { href: string; external?: boolean }) {
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
        asChild
        borderColor="font.dark"
        color="font.dark"
        fontSize="sm"
        h="32px"
        my="-1"
        px="sm"
        py="ms"
        variant="outline"
        width="auto"
      >
        {external ? (
          <a href={href} rel="noopener noreferrer" target="_blank">
            {children}
            <ArrowUpRight size={14} />
          </a>
        ) : (
          <NextLink href={href ?? ''}>{children}</NextLink>
        )}
      </Button>
    </Box>
  )
}
