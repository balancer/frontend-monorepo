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
      flexDirection={{ base: 'column', lg: 'row' }}
      justifyContent={{ base: 'start', lg: 'space-between' }}
      spacing={{ base: '40px', lg: undefined }}
      w="full"
    >
      <VStack spacing="30px" w={{ base: 'full', lg: undefined }}>
        <Breadcrumb
          separator={
            <Box color="font.secondary">
              <ChevronRight size={16} />
            </Box>
          }
          spacing="xs"
          w="full"
        >
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <Button color="grayText" size="xs" variant="link">
                <HomeIcon height="16px" width="16px" />
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

        <VStack alignSelf={{ base: 'start', lg: undefined }} maxW="351px" spacing="22px">
          <Heading alignSelf={{ base: 'start', lg: undefined }} as="h2" size="lg" variant="special">
            Vote and&nbsp;earn external&nbsp;incentives
          </Heading>
          <Text fontSize="16px" fontWeight={500} letterSpacing="-0.38px" lineHeight="24px">
            Voting on pool gauges helps to direct weekly BAL liquidity mining incentives. Voters are
            also eligible to earn additional 3rd party voting incentives.
          </Text>
        </VStack>
      </VStack>

      <VotingDeadline />
    </HStack>
  )
}
