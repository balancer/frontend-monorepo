import { TokenIcon } from '@repo/lib/modules/tokens/TokenIcon'
import { GqlPriceRateProviderData, GqlToken } from '@repo/lib/shared/services/api/generated/graphql'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  VStack,
  HStack,
  Text,
  Heading,
  Box,
  Icon,
} from '@chakra-ui/react'
import Link from 'next/link'
import { ArrowUpRight } from 'react-feather'
import { getRateProviderWarnings } from '../../pool.helpers'
import { PropsWithChildren } from 'react'

type RateProviderInfoPopOverProps = {
  token: GqlToken
  data: GqlPriceRateProviderData | null
  level: number
} & PropsWithChildren

type PopoverInfoBodyProps = {
  data: GqlPriceRateProviderData
  level: number
}

function PopoverInfoBody({ data, level }: PopoverInfoBodyProps) {
  const warnings = getRateProviderWarnings(data.warnings || [])
  return (
    <>
      {level === 0 && (
        <>
          <Text fontSize="sm">
            This rate provider has not been reviewed.
            <br />
            Proceed with caution.
          </Text>
          <Text fontSize="sm">
            Learn more about{' '}
            <Link href="/risks#rate-provider-risk" target="_blank">
              <Box as="span" color="font.link">
                rate provider risks
              </Box>
            </Link>
          </Text>
        </>
      )}
      {level !== 0 && (
        <>
          <VStack alignItems="flex-start" gap="0">
            <Text color="grayText" fontSize="sm">
              Review summary:
            </Text>
            <Text fontSize="sm">
              {data.summary === 'safe' ? 'No vulnerabilities were reported' : 'Unsafe'}
            </Text>
          </VStack>
          <VStack alignItems="flex-start" gap="0">
            <Text color="grayText" fontSize="sm">
              Warnings:
            </Text>
            {warnings.length > 0 ? (
              <Text fontSize="sm">Yes, see review details</Text>
            ) : (
              <Text fontSize="sm">
                None except{' '}
                <Link href="/risks#rate-provider-risk" target="_blank">
                  <Box as="span" color="font.link">
                    rate provider risks
                  </Box>
                </Link>
              </Text>
            )}
          </VStack>
          <VStack alignItems="flex-start" gap="0">
            <Text color="grayText" fontSize="sm">
              Upgradeable components:
            </Text>
            {data.upgradeableComponents && data.upgradeableComponents.length > 0 ? (
              <Text fontSize="sm">Yes, see review details</Text>
            ) : (
              <Text fontSize="sm">None</Text>
            )}
          </VStack>
          <VStack alignItems="flex-start" gap="0">
            <Text color="grayText" fontSize="sm">
              Rate provider factory:
            </Text>
            <Text fontSize="sm">{data.factory ?? 'None'}</Text>
          </VStack>
          {data.reviewFile && (
            <Link
              href={`https://github.com/balancer/code-review/blob/main/rate-providers/${data.reviewFile}`}
              target="_blank"
            >
              <HStack gap="xxs">
                <Text color="font.link" fontSize="sm">
                  View review details
                </Text>
                <Icon as={ArrowUpRight} color="font.link" size={12} />
              </HStack>
            </Link>
          )}
        </>
      )}
    </>
  )
}

export function RateProviderInfoPopOver({
  token,
  data,
  level,
  children,
}: RateProviderInfoPopOverProps) {
  const body = data ? (
    <PopoverInfoBody data={data} level={level} />
  ) : (
    <Text fontSize="sm">
      Rate provider data is missing.
      <br />
      Proceed with caution.
    </Text>
  )

  return (
    <Popover trigger="hover">
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent w="auto">
        <PopoverArrow bg="background.level2" />
        <PopoverBody>
          <VStack alignItems="flex-start" spacing="ms" w="full">
            <HStack w="full">
              <Heading fontSize="1.125rem" variant="h4">
                {token.symbol} rate provider
              </Heading>
              <TokenIcon
                address={token.address}
                alt={token.address}
                chain={token.chain}
                ml="auto"
                size={24}
              />
            </HStack>
            {body}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
