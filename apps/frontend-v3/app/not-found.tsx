import { DefaultPageContainer } from '@/lib/shared/components/containers/DefaultPageContainer'
import { Button, Heading, VStack, Text } from '@chakra-ui/react'
import { headers } from 'next/headers'
import Link from 'next/link'

export default async function NotFound() {
  const headersList = headers()

  const referer = await headersList.get('referer')

  const poolIdSegment = 6
  const maybePoolId = referer?.split('/')[poolIdSegment]
  const isPoolPageNotFound = maybePoolId?.startsWith('0x')

  const title = isPoolPageNotFound ? 'Pool Not Found' : 'Page Not Found'
  const description = isPoolPageNotFound
    ? `The pool you are looking for does not exist: ${maybePoolId}`
    : 'The page you are looking for does not exist'

  const redirectUrl = isPoolPageNotFound ? `/pools` : '/'
  const redirectText = isPoolPageNotFound ? 'View All Pools' : 'Return Home'

  return (
    <DefaultPageContainer minH="80vh">
      <VStack align="start" spacing="md">
        <Heading size="md">{title}</Heading>
        <VStack align="start" spacing="xs">
          <Text>{description}</Text>
        </VStack>

        <Button as={Link} size="sm" href={redirectUrl}>
          {redirectText}
        </Button>
      </VStack>
    </DefaultPageContainer>
  )
}
