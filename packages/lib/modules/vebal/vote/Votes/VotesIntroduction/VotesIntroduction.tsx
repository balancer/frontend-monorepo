import {
  Heading,
  HStack,
  VStack,
  Text,
  Breadcrumb,
  Box,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
} from '@chakra-ui/react'
import { VotingDeadline } from '@repo/lib/modules/vebal/vote/Votes/VotesIntroduction/VotingDeadline/VotingDeadline'
import { ChevronRight } from 'react-feather'
import { HomeIcon } from '@repo/lib/modules/vebal/vote/Votes/VotesIntroduction/HomeIcon'

const linkStyles = {
  color: 'font.secondary',
  fontSize: '14px',
  lineHeight: '16px',
  fontWeight: 500,
}

export function VotesIntroduction() {
  return (
    <HStack
      w="full"
      justifyContent={{ base: 'start', lg: 'space-between' }}
      flexDirection={{ base: 'column', lg: 'row' }}
      spacing={{ base: '40px', lg: undefined }}
    >
      <VStack spacing="30px" w={{ base: 'full', lg: undefined }}>
        <Breadcrumb
          spacing="xs"
          separator={
            <Box color="font.secondary">
              <ChevronRight size={16} />
            </Box>
          }
          w="full"
        >
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <Button color="grayText" size="xs" variant="link">
                <HomeIcon width="16px" height="16px" />
              </Button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/vebal" {...linkStyles}>
              veBAL
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="/vebal/vote" {...linkStyles}>
              Vote
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <VStack spacing="22px" maxW="351px" alignSelf={{ base: 'start', lg: undefined }}>
          <Heading as="h2" size="lg" variant="special" alignSelf={{ base: 'start', lg: undefined }}>
            Vote and&nbsp;earn external&nbsp;incentives
          </Heading>
          <Text fontSize="16px" lineHeight="24px" letterSpacing="-0.38px" fontWeight={500}>
            Voting on pool gauges helps to direct weekly BAL liquidity mining incentives. Voters are
            also eligible to earn additional 3rd party voting incentives.
          </Text>
        </VStack>
      </VStack>

      <VotingDeadline />
    </HStack>
  )
}
