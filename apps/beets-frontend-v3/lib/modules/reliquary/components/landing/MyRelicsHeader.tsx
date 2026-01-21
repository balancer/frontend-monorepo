'use client'

import { Button, Grid, GridItem, Heading } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

export function MyRelicsHeader() {
  const router = useRouter()

  return (
    <Grid
      alignItems="center"
      gap={{ base: '1', lg: '4' }}
      templateAreas={{
        base: `"title create"
               "vp vp"`,
        lg: `"title vp create"`,
      }}
      templateColumns={{ base: '1fr 1fr', lg: 'auto auto 1fr' }}
      w="full"
    >
      <GridItem area="title">
        <Heading
          background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
          backgroundClip="text"
          size="lg"
        >
          My Relics
        </Heading>
      </GridItem>
      <GridItem area="create" justifySelf="end">
        <Button onClick={() => router.push('/mabeets/deposit/new')} size="md" variant="primary">
          New Relic
        </Button>
      </GridItem>
    </Grid>
  )
}
