'use client'

import { Link, LinkProps } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'

export function BalAlertLink({ href, children, ...rest }: PropsWithChildren<LinkProps>) {
  return (
    <Link href={href} color="font.dark" textDecoration="underline" target="_blank" {...rest}>
      {children}
    </Link>
  )
}
