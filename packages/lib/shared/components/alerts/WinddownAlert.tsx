import { Alert, Box, Link, Text } from '@chakra-ui/react'
import { ArrowRight } from 'lucide-react'
import { isBalancer } from '@repo/lib/config/getProjectConfig'

const BIP_928_URL =
  'https://forum.balancer.fi/t/bip-928-orderly-winddown-of-balancer-and-distribution-of-the-treasury/7107'

/*
  Site-wide notice while the Balancer DAO-approved winddown (BIP-928) is in effect. The decision and
  the forum post live on balancer.fi, so this must not surface in the Beets app, which shares this
  package.
*/
export function WinddownAlert() {
  if (!isBalancer) return null

  const fontProps = {
    color: 'font.dark',
    fontSize: 'lg',
    fontWeight: 'bold',
  }

  return (
    <Alert justifyContent="center" rounded="none" status="warning" textAlign="center">
      <Text {...fontProps}>
        Balancer DAO has approved an orderly winddown (BIP-928). Most pools move to withdrawals only
        on 30 October 2026. Withdrawals remain available after that date.{' '}
        <Link
          _hover={{ ...fontProps, textDecoration: 'none' }}
          alignItems="center"
          display="inline-flex"
          href={BIP_928_URL}
          isExternal
          textDecoration="underline"
          {...fontProps}
        >
          <Box as="span" {...fontProps}>
            Learn more
          </Box>
          <Box as="span" ml={1} {...fontProps}>
            <ArrowRight size={12} />
          </Box>
        </Link>
      </Text>
    </Alert>
  )
}
