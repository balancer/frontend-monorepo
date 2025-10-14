import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Pool } from '../../../pool.types'
import { GqlPoolGyro } from '@repo/lib/shared/services/api/generated/graphql'
import { fNumCustom } from '@repo/lib/shared/utils/numbers'

export function ClpPoolAttributes({ pool }: { pool: Pool }) {
  const clpPool = pool as GqlPoolGyro

  const attributes = [
    { title: 'α (alpha)', value: clpPool.alpha },
    { title: 'β (beta)', value: clpPool.beta },
    { title: 'c', value: clpPool.c },
    { title: 's', value: clpPool.s },
    { title: 'λ (lambda)', value: fNumCustom(clpPool.lambda, '0,0') },
  ]

  return (
    <Accordion allowToggle w="full">
      <AccordionItem border="none">
        {({ isExpanded }) => (
          <>
            <AccordionButton pl={0}>
              <Text textColor={isExpanded ? 'green.400' : 'font.link'}>
                Advanced E-CLP parameters
              </Text>
              <AccordionIcon color={isExpanded ? 'green.400' : 'font.link'} />
            </AccordionButton>

            <AccordionPanel>
              {attributes.map(attr => {
                return (
                  <Stack
                    direction={{ base: 'column', md: 'row' }}
                    key={`pool-attribute-${attr.title}`}
                    spacing={{ base: 'xxs', md: 'xl' }}
                    width="full"
                  >
                    <Box minWidth="160px">
                      <Text variant={{ base: 'primary', md: 'secondary' }}>{attr.title}:</Text>
                    </Box>
                    <Text
                      mb={{ base: 'sm', md: '0' }}
                      variant={{ base: 'secondary', md: 'secondary' }}
                    >
                      {attr.value}
                    </Text>
                  </Stack>
                )
              })}
            </AccordionPanel>
          </>
        )}
      </AccordionItem>
    </Accordion>
  )
}
