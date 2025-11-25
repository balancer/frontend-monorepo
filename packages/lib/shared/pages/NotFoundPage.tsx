import { NotFoundPageClient } from './NotFoundPageClient'
import { headers } from 'next/headers'

export async function NotFoundPage() {
  const headersList = await headers()
  const referer = headersList.get('referer')

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
    <NotFoundPageClient
      description={description}
      redirectText={redirectText}
      redirectUrl={redirectUrl}
      title={title}
    />
  )
}
