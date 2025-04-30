'use client'

import {
  Heading,
  HStack,
  VStack,
  Text,
  Breadcrumb,
  Box,
  BreadcrumbItem,
  BreadcrumbLink,
  useBreakpointValue,
  Button,
} from '@chakra-ui/react'
import { VotingDeadline } from '@bal/lib/vebal/vote/Votes/VotesIntroduction/VotingDeadline/VotingDeadline'
import { ChevronRight } from 'react-feather'
import { HomeIcon } from '@bal/lib/vebal/vote/Votes/VotesIntroduction/HomeIcon'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import Noise from '@repo/lib/shared/components/layout/Noise'
// import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
// import { Picture } from '@repo/lib/shared/components/other/Picture'
import { RadialPattern } from '@bal/app/(marketing)/_lib/landing-v3/shared/RadialPattern'
// import NextLink from 'next/link'

const linkStyles = {
  color: 'font.secondary',
  fontSize: '14px',
  lineHeight: '16px',
  fontWeight: 500,
}

export function VotesIntroduction() {
  const radialPatternProps = useBreakpointValue({
    base: { circleCount: 10, height: 1000, width: 1000 },
    md: { circleCount: 15, height: 1500, width: 1500 },
    xl: { circleCount: 12, height: 900, width: 900 },
  })

  return (
    <Box
      borderBottom="1px solid"
      borderColor="border.base"
      left="50%"
      marginLeft="-50vw"
      marginRight="-50vw"
      maxWidth="100vw"
      position="relative"
      right="50%"
      width="100vw"
    >
      <Noise
        backgroundColor="background.level0WithOpacity"
        h="100%"
        overflow="hidden"
        position="relative"
        shadow="innerBase"
      >
        <DefaultPageContainer pb={['xl', 'xl', '2xl']} position="relative" pt={['xl', '40px']}>
          <RadialPattern
            circleCount={radialPatternProps?.circleCount}
            height={radialPatternProps?.height}
            left={{ base: '100%', md: '-20%' }}
            position="absolute"
            top={{ base: '0%', md: '100%' }}
            transform="translate(-50%, -50%)"
            width={radialPatternProps?.width}
            zIndex={0}
          />
          <RadialPattern
            circleCount={12}
            height={900}
            innerHeight={150}
            innerWidth={2100}
            opacity={{ base: 0, lg: 0.75 }}
            padding="15px"
            position="absolute"
            right={{ base: -800, lg: -2400, xl: -2000, '2xl': '-140%' }}
            top="-270px"
            width={3000}
          />
          <Breadcrumb
            pb={{ base: 'lg', md: '0' }}
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
          <HStack
            alignItems={{ base: 'start', md: 'center' }}
            flexDirection={{ base: 'column', md: 'row' }}
            justifyContent={{ base: 'start', lg: 'space-between' }}
            spacing={{ base: '40px', lg: undefined }}
            w="full"
          >
            <VStack pt="sm" spacing="30px" w={{ base: 'full', lg: undefined }}>
              <VStack alignItems="start" spacing="ms">
                <Box maxW="290px">
                  <Heading as="h2" size="lg" sx={{ textWrap: 'pretty' }} variant="special">
                    Vote on pool gauges, earn extra incentives.
                  </Heading>
                </Box>
                <Text color="font.secondary" sx={{ textWrap: 'balance' }}>
                  Voting on pool gauges helps to direct weekly BAL emissions and earns you
                  additional voting incentives from third-party platforms like Hidden Hand.
                </Text>
              </VStack>
            </VStack>

            <VotingDeadline />
          </HStack>
        </DefaultPageContainer>
      </Noise>
    </Box>
  )
}
