import { HookReviewData } from '@repo/lib/shared/services/api/generated/graphql'
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

type PopoverInfoBodyProps = {
  data: HookReviewData | undefined | null
  level: number
}

type HookInfoPopOverProps = PopoverInfoBodyProps & PropsWithChildren

function PopoverInfoBody({ data, level }: PopoverInfoBodyProps) {
  const warnings = getWarnings(data?.warnings || [])

  return (
    <>
      {level === 0 && (
        <>
          <Text fontSize="sm">
            This hook has not been reviewed.
            <br />
            Proceed with caution.
          </Text>
          <Text fontSize="sm">
            Learn more about{' '}
            <Link href="/risks#hook-risk" target="_blank">
              <Box as="span" color="font.link">
                hook risks
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
              {data?.summary === 'safe' ? 'No vulnerabilities were reported' : 'Unsafe'}
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
                    hook risks
                  </Box>
                </Link>
              </Text>
            )}
          </VStack>
          {data?.reviewFile && (
            <Link
              href={`https://github.com/balancer/code-review/blob/main/hooks/${data.reviewFile}`}
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

export function HookInfoPopOver({ data, level, children }: HookInfoPopOverProps) {
  const body = data ? (
    <PopoverInfoBody data={data} level={level} />
  ) : (
    <Text fontSize="sm">
      Hook data is missing.
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
                Hook
              </Heading>
            </HStack>
            {body}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
