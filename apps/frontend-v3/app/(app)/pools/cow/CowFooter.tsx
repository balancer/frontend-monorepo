'use client'

import { getVariantConfig } from '@/lib/modules/pool/pool.hooks'
import { PartnerVariant } from '@/lib/modules/pool/pool.types'
import FadeInOnView from '@/lib/shared/components/containers/FadeInOnView'
import { Picture } from '@/lib/shared/components/other/Picture'
import { Box, Button, Center, Text, VStack } from '@chakra-ui/react'
import Link from 'next/link'

export function CowFooter() {
  const { banners } = getVariantConfig(PartnerVariant.cow)

  return (
    <>
      <Center>
        <VStack>
          <Text color="grayText">{`Can't find the pool you're looking for?`}</Text>
          <Button as={Link} href="https://pool-creator.balancer.fi/cow" target="_blank" rel="">
            Create a pool
          </Button>
        </VStack>
      </Center>
      <Box zIndex="-1" position="relative">
        <FadeInOnView animateOnce={false}>
          <Box maxW="maxContent" mx="auto" px={{ base: '0', '2xl': 'md' }} pt="xl" zIndex="0">
            {banners?.footerSrc && (
              <Picture
                imgName="cow-footer"
                altText="CoW AMM footer"
                defaultImgType="svg"
                imgSvg={true}
                imgSvgPortraitDark={true}
                imgSvgPortrait={true}
                imgSvgDark={true}
                directory="/images/partners/"
              />
            )}
          </Box>
        </FadeInOnView>
      </Box>
    </>
  )
}
