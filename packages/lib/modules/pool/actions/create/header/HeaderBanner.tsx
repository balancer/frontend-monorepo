'use client'

import { Box, Heading, HStack, Stack, Text, VStack, Link } from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { FeatureLink } from './FeatureLink'
import { RadialPattern } from '@repo/lib/shared/components/zen/RadialPattern'
import { ArrowUpRight } from 'react-feather'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { LbpBenefitsChartIcon } from '@repo/lib/shared/components/icons/lbp/LbpBenefitsChartIcon'
import { LbpBenefitsLightningIcon } from '@repo/lib/shared/components/icons/lbp/LbpBenefitsLightningIcon'
import { LbpBenefitsHookIcon } from '@repo/lib/shared/components/icons/lbp/LbpBenefitsHookIcon'
import { usePoolCreationFormSteps } from '../usePoolCreationFormSteps'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { POOL_TYPES } from '../constants'
import { motion, LayoutGroup } from 'framer-motion'
import { useWatch } from 'react-hook-form'

const MotionHeading = motion(Heading)

export function HeaderBanner() {
  const { isFirstStep } = usePoolCreationFormSteps()
  const { poolCreationForm } = usePoolCreationForm()
  const poolType = useWatch({ control: poolCreationForm.control, name: 'poolType' })

  const poolTypeLabel = POOL_TYPES[poolType]?.label
  const capitalEfficiencyDescription = `
  Maximize capital efficiency with boosted pools that route idle liquidity to yield markets, allowing LPs to earn both swap fees and lending interest simultaneously.
`

  const accessToHooksDescription = `
  Customize pool behavior with hooks by adding dynamic fees, yield strategies, or custom logic without building from scratch.
`

  const immediateLiquidityDescription = `
  Deploy pools instantly with no token whitelisting requirements. Your pool becomes tradeable immediately after initialization with seed liquidity.
`

  return (
    <LayoutGroup>
      <Box mb={isFirstStep ? 'lg' : '0'} w="full">
        {isFirstStep ? (
          <NoisyCard
            cardProps={{
              w: 'full',
              overflow: 'hidden',
              rounded: 'xl',
              h: { base: 'auto', lg: '210px' },
            }}
          >
            <HStack
              alignItems={{ base: 'start', md: 'center' }}
              flexDirection={{ base: 'column', lg: 'row' }}
              h="full"
              justifyContent={{ base: 'start', lg: 'space-between' }}
              p={{ base: 'lg', lg: 'xl' }}
              spacing={{ base: 'md', lg: undefined }}
              w="full"
            >
              <VStack
                alignItems="start"
                pt="sm"
                spacing="30px"
                w={{ base: 'full', lg: undefined }}
                zIndex={1}
              >
                <VStack alignItems="start" spacing="ms">
                  <Box maxW="290px">
                    <MotionHeading
                      as="h1"
                      layout
                      layoutId="create-pool-heading"
                      size="lg"
                      sx={{ textWrap: 'nowrap' }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      variant="special"
                    >
                      Create a pool on {PROJECT_CONFIG.projectName} v3
                    </MotionHeading>
                  </Box>

                  <Text color="font.secondary" maxW="48ch" sx={{ textWrap: 'balance' }}>
                    {PROJECT_CONFIG.projectName} v3 handles the low level tasks, like token
                    accounting and security, allowing you to focus on innovating with custom logic.
                  </Text>
                  <Link
                    href="https://docs.balancer.fi/partner-onboarding/balancer-v3/v3-overview.html"
                    isExternal
                  >
                    <HStack
                      _hover={{ cursor: 'pointer', color: 'font.linkHover' }}
                      color="font.link"
                      gap="xxs"
                    >
                      <Text _hover={{ color: 'font.linkHover' }} color="font.link" variant="ghost">
                        View Partner Onboarding docs
                      </Text>
                      <ArrowUpRight size={14} />
                    </HStack>
                  </Link>
                </VStack>
              </VStack>

              <Stack
                direction={{ base: 'column', md: 'row' }}
                justifyContent="stretch"
                spacing={{ base: 4, md: 2, lg: 4, xl: 8 }}
                w="full"
              >
                <RadialPattern
                  circleCount={8}
                  height={600}
                  innerHeight={120}
                  innerWidth={1000}
                  left="350px"
                  padding="15px"
                  position="absolute"
                  right={{ base: -500, lg: -700, xl: -600, '2xl': -400 }}
                  top="-195px"
                  width={1500}
                />

                <RadialPattern
                  bottom="-500px"
                  circleCount={10}
                  height={800}
                  innerHeight={150}
                  innerWidth={150}
                  left="-400px"
                  position="absolute"
                  width={800}
                  zIndex={0}
                />

                <FeatureLink
                  description={capitalEfficiencyDescription}
                  icon={<LbpBenefitsChartIcon />}
                  title="Capital efficiency"
                  transformBackground="rotate(90deg)"
                />

                <FeatureLink
                  description={accessToHooksDescription}
                  icon={<LbpBenefitsHookIcon />}
                  title="Access to hooks"
                  transformBackground="rotate(0deg)"
                />

                <FeatureLink
                  description={immediateLiquidityDescription}
                  icon={<LbpBenefitsLightningIcon />}
                  title="Immediate liquidity"
                  transformBackground="rotate(-90deg)"
                />
              </Stack>
            </HStack>
          </NoisyCard>
        ) : (
          <MotionHeading
            as="h1"
            layout
            layoutId="create-pool-heading"
            size="lg"
            sx={{ textWrap: 'nowrap' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            variant="special"
          >
            Create a {poolTypeLabel} pool on {PROJECT_CONFIG.projectName} v3
          </MotionHeading>
        )}
      </Box>
    </LayoutGroup>
  )
}
