'use client'

import { Link, LinkProps } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'

// TODO: ideally NextLink should be used here for internal links
export function BalAlertLink({ href, children, ...rest }: PropsWithChildren<LinkProps>) {
  return (
    <Link color="font.dark" href={href} target="_blank" textDecoration="underline" {...rest}>
      {children}
    </Link>
  )
}
