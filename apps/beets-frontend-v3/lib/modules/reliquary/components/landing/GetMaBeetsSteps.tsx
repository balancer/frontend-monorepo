'use client'

import { Box, Card, Flex, Stack, Text } from '@chakra-ui/react'
import { BeetsTokenSonic } from '../../assets/BeetsTokenSonic'
import { FBeetsTokenSonic } from '../../assets/FBeetsTokenSonic'
import { MaBeetsTokenSonic } from '../../assets/MaBeetsTokenSonic'

type Step = {
  stepNumber: string
  title: string
  description: string
  icon: React.ComponentType
}

const steps: Step[] = [
  {
    stepNumber: 'Step1',
    title: 'fBEETS',
    description: 'Invest BEETS/stS (80/20) into the Fresh BEETS pool to receive fBEETS.',
    icon: BeetsTokenSonic,
  },
  {
    stepNumber: 'Step2',
    title: 'Reliquary',
    description:
      'Add liquidity with fBEETS in Reliquary to unlock your maturity adjusted position.',
    icon: FBeetsTokenSonic,
  },
  {
    stepNumber: 'Step3',
    title: 'maBEETS',
    description: 'Receive a transferable and composable Relic that holds your maBEETS position.',
    icon: MaBeetsTokenSonic,
  },
]

export function GetMaBeetsSteps() {
  return (
    <Stack direction={['column', 'row']} mb="10" spacing="8">
      {steps.map(step => {
        const Icon = step.icon
        return (
          <Card flex="1" key={step.stepNumber} padding="4">
            <Flex mb="8">
              <Box color="beets.highlight" flex="1">
                {step.stepNumber}
              </Box>
              <Box>
                <Icon />
              </Box>
            </Flex>
            <Flex mb="2">
              <Box>
                <Text
                  background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
                  backgroundClip="text"
                  fontSize="xl"
                  fontWeight="bold"
                >
                  {step.title}
                </Text>
              </Box>
              <Box flex="1" />
            </Flex>
            <Box>{step.description}</Box>
          </Card>
        )
      })}
    </Stack>
  )
}
