import { TokenIcon } from '@repo/lib/modules/tokens/TokenIcon'
import { Erc4626ReviewData } from '@repo/lib/shared/services/api/generated/graphql'
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
import { getWarnings } from '../../pool.helpers'
import { PropsWithChildren } from 'react'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'

type Erc4626InfoPopOverProps = {
  token: ApiToken
  data: Erc4626ReviewData | undefined | null
  level: number
} & PropsWithChildren

type PopoverInfoBodyProps = {
  data: Erc4626ReviewData
  level: number
}

function PopoverInfoBody({ data, level }: PopoverInfoBodyProps) {
  const warnings = getWarnings(data.warnings || [])
  return (
    <>
      {level === 0 && (
        <>
          <Text fontSize="sm">
            This tokenized vault has not been reviewed.
            <br />
            Proceed with caution.
          </Text>
          <Text fontSize="sm">
            Learn more about{' '}
            <Link href="/risks#boosted-pools" target="_blank">
              <Box as="span" color="font.link">
                boosted pools (tokenized vaults) risks
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
                <Link href="/risks#boosted-pools" target="_blank">
                  <Box as="span" color="font.link">
                    boosted pools (tokenized vaults) risks
                  </Box>
                </Link>
              </Text>
            )}
          </VStack>
          {data.reviewFile && (
            <Link
              href={`https://github.com/balancer/code-review/blob/main/erc4626/${data.reviewFile}`}
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

export function Erc4626InfoPopOver({ token, data, level, children }: Erc4626InfoPopOverProps) {
  const body = data ? (
    <PopoverInfoBody data={data} level={level} />
  ) : (
    <Text fontSize="sm">
      Tokenized vault data is missing.
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
                {token.symbol} tokenized vault
              </Heading>
              <Box ml="auto">
                <TokenIcon
                  address={token.address}
                  alt={token.symbol}
                  chain={token.chain}
                  size={24}
                />
              </Box>
            </HStack>
            {body}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
