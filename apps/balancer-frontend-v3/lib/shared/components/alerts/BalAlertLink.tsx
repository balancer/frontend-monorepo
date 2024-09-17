'use client'

import { Link, LinkProps } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'

export function BalAlertLink({ href, children, ...rest }: PropsWithChildren<LinkProps>) {
  return (
    <Link color="font.dark" href={href} target="_blank" textDecoration="underline" {...rest}>
      {children}
    </Link>
  )
}
