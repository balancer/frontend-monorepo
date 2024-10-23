import { Card, CardProps, HStack, Heading, IconButton, Stack } from '@chakra-ui/react'
import Link from 'next/link'
import { ArrowLeft } from 'react-feather'

interface Props extends CardProps {
  backLink: string
  title: string
}

export function ClaimNetworkPoolsLayout({ backLink, children, title, ...rest }: Props) {
  return (
    <Stack alignItems="center" maxW="lg" mx="auto" w="full">
      <Stack gap={8} w="full">
        <Link href={backLink}>
          <HStack>
            <IconButton aria-label="" icon={<ArrowLeft />} variant="ghost" />
            <Heading size="lg" variant="special">
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
