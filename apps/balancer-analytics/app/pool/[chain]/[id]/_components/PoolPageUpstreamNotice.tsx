'use client'

import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, Home, RefreshCw } from 'react-feather'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'

/** Narrowed structural copy of the route-side `UpstreamError` for the
 *  props contract. The class itself isn't imported in this client
 *  component because the page (a Server Component) constructs it
 *  directly and we want to keep the server-only `'server-only'` chain
 *  out of the client bundle. */
type UpstreamErrorShape = {
  kind: 'rate_limit' | 'upstream_error' | 'graphql_error' | 'network'
  status: number | null
  retryAfter: string | null
}

type Props = {
  chainSlug: string
  poolId: string
  error: UpstreamErrorShape
}

/**
 * Rendered in place of the pool detail page when api-v3 returns a rate-limit
 * or upstream error. Previously these failures fell through to `notFound()`,
 * which surfaced the same Next.js 404 page as a genuinely missing pool —
 * indistinguishable to the user. This component makes the actual root cause
 * (per-IP rate limit, upstream outage) visible plus offers a "try again"
 * affordance that does a hard reload of the route.
 */
export function PoolPageUpstreamNotice({ chainSlug, poolId, error }: Props) {
  const router = useRouter()
  const isRateLimit = error.kind === 'rate_limit'
  const headline = isRateLimit
    ? 'Balancer API rate limit reached'
    : 'Balancer API is temporarily unavailable'

  // `Retry-After` is upstream's hint about when to come back. Fall back to
  // 60s on rate limits (typical per-IP bucket refill) so we always render
  // something concrete.
  const retryAfterSeconds = parseRetryAfter(error.retryAfter) ?? (isRateLimit ? 60 : null)

  const detail = isRateLimit
    ? retryAfterSeconds
      ? `This is a per-IP throttle on the upstream Balancer API. Please wait about ${formatSeconds(retryAfterSeconds)} and try again.`
      : 'This is a per-IP throttle on the upstream Balancer API. Please wait a minute and try again.'
    : 'The upstream Balancer API is returning errors. This is not a problem with your connection or with the pool. Try again in a few minutes.'

  return (
    <DefaultPageContainer pb="2xl" pt={['md', 'lg']}>
      <VStack align="stretch" spacing={{ base: 'lg', md: 'xl' }}>
        {/* Keep the same breadcrumb shell as the real page so the user has
            a clear escape route back to the pool explorer. */}
        <FadeInOnView animateOnce={false}>
          <Breadcrumb
            color="font.secondary"
            fontSize="sm"
            separator={
              <Box color="border.base">
                <ChevronRight size={14} />
              </Box>
            }
            spacing="sm"
          >
            <BreadcrumbItem>
              <BreadcrumbLink _hover={{ color: 'font.linkHover' }} as={Link} href="/">
                <Home size={14} />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink _hover={{ color: 'font.linkHover' }} as={Link} href="/#pools">
                Pools
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <Text color="font.primary" fontSize="sm">
                {chainSlug} · {shortPoolId(poolId)}
              </Text>
            </BreadcrumbItem>
          </Breadcrumb>
        </FadeInOnView>

        <FadeInOnView animateOnce={false}>
          <Card overflow="hidden" variant="level1">
            <NoisyCard
              cardProps={{ height: 'full', overflow: 'hidden' }}
              contentProps={{ display: 'flex' }}
            >
              <Flex
                align="center"
                direction="column"
                gap="md"
                justify="center"
                minH="320px"
                p={{ base: 'md', md: 'xl' }}
                textAlign="center"
                w="full"
              >
                <Heading size="h4">{headline}</Heading>
                <Text color="font.secondary" fontSize="md" maxW="lg">
                  {detail}
                </Text>
                {error.status !== null && (
                  <Text color="font.secondary" fontSize="xs" opacity={0.6}>
                    Upstream status: HTTP {error.status}
                  </Text>
                )}
                <Button
                  leftIcon={<RefreshCw size={14} />}
                  mt="sm"
                  onClick={() => router.refresh()}
                  size="sm"
                  variant="outline"
                >
                  Try again
                </Button>
              </Flex>
            </NoisyCard>
          </Card>
        </FadeInOnView>
      </VStack>
    </DefaultPageContainer>
  )
}

function shortPoolId(id: string): string {
  if (id.length <= 12) return id
  return `${id.slice(0, 6)}…${id.slice(-4)}`
}

function parseRetryAfter(raw: string | null): number | null {
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null
}

function formatSeconds(s: number): string {
  if (s < 60) return `${s} second${s === 1 ? '' : 's'}`
  const m = Math.round(s / 60)
  return `${m} minute${m === 1 ? '' : 's'}`
}
