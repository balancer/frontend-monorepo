import { Card, CardProps, HStack, Heading, IconButton, Stack } from '@chakra-ui/react'
import Link from 'next/link'
import { ArrowLeft } from 'react-feather'

interface Props extends CardProps {
  backLink: string
  children: React.ReactNode
  title: string
}

export function ClaimNetworkPoolsLayout({ backLink, children, title, ...rest }: Props) {
  return (
    <Stack alignItems="center" w="full" maxW="lg" mx="auto">
      <Stack w="full" gap={8}>
        <Link href={backLink}>
          <HStack>
            <IconButton variant="ghost" icon={<ArrowLeft />} aria-label="" />
            <Heading variant="special" size="lg">
              {title}
            </Heading>
          </HStack>
        </Link>

        <Card w="full" {...rest}>
          {children}
        </Card>
      </Stack>
    </Stack>
  )
}
