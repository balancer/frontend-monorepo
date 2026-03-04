import { Accordion, Box, Stack, Text } from '@chakra-ui/react';
import { Pool } from '../../../pool.types'
import { GqlPoolGyro } from '@repo/lib/shared/services/api/generated/graphql'
import { fNumCustom } from '@repo/lib/shared/utils/numbers'
import { TooltipWithTouch } from '@repo/lib/shared/components/tooltips/TooltipWithTouch'

export function ClpPoolAttributes({ pool }: { pool: Pool }) {
  const clpPool = pool as GqlPoolGyro

  const attributes = [
    {
      title: 'α (alpha)',
      value: clpPool.alpha,
      description: 'α (alpha) defines the lower bound of the price range.' },
    {
      title: 'β (beta)',
      value: clpPool.beta,
      description: 'β (beta) defines the upper bound of the price range.' },
    {
      title: 'c',
      value: clpPool.c,
      description: `c, s define the rotation point and are further defined by the cosine
      (respectively sine) of the rotation angle. The price of maximum liquidity is the
      quotient s/c (which is also the tangent of the rotation angle).` },
    {
      title: 's',
      value: clpPool.s,
      description: `c, s define the rotation point and are further defined by the cosine
      (respectively sine) of the rotation angle. The price of maximum liquidity is the
      quotient s/c (which is also the tangent of the rotation angle).` },
    {
      title: 'λ (lambda)',
      value: fNumCustom(clpPool.lambda, '0,0'),
      description: `λ (lambda) defines the stretching factor. The higher λ, the more liquidity is
      concentrated within the price range. For lower , the pool’s liquidity is more evenly spread
      across the price range. Geometrically, a higher  means that the ellipse is more elongated,
      with  corresponding to a circle.` },
  ]

  return (
    <Accordion.Root collapsible w="full">
      <Accordion.Item border="none" value='item-0'>
        {({ isExpanded }) => (
          <>
            <Accordion.ItemTrigger pl={0}>
              <Text textColor={isExpanded ? 'green.400' : 'font.link'}>
                Advanced E-CLP parameters
              </Text>
              <Accordion.ItemIndicator color={isExpanded ? 'green.400' : 'font.link'} />
            </Accordion.ItemTrigger>

            <Accordion.ItemContent><Accordion.ItemBody>
                {attributes.map(attr => {
                  return (
                    <Stack
                      direction={{ base: 'column', md: 'row' }}
                      key={`pool-attribute-${attr.title}`}
                      gap={{ base: 'xxs', md: 'xl' }}
                      width="full"
                    >
                      <Box minWidth="160px">
                        <TooltipWithTouch label={attr.description}>
                          <Text
                            className="tooltip-dashed-underline"
                            cursor="help"
                            variant={{ base: 'primary', md: 'secondary' }}
                          >
                            {attr.title}:
                          </Text>
                        </TooltipWithTouch>
                      </Box>
                      <Text
                        mb={{ base: 'sm', md: '0' }}
                        variant={{ base: 'secondary', md: 'secondary' }}
                      >
                        {attr.value}
                      </Text>
                    </Stack>
                  );
                })}
              </Accordion.ItemBody></Accordion.ItemContent>
          </>
        )}
      </Accordion.Item>
    </Accordion.Root>
  );
}
