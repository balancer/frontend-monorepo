'use client'

import { PartnerVariant } from '@repo/lib/modules/pool/pool.types'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { Picture } from '@repo/lib/shared/components/other/Picture'
import { Box } from '@chakra-ui/react'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export function CowFooter() {
  const { banners } = PROJECT_CONFIG.variantConfig?.[PartnerVariant.cow] || {}

  return (
    <>
      <Box position="relative" zIndex="-1">
        <FadeInOnView animateOnce={false}>
          <Box maxW="maxContent" mx="auto" pt="xl" px={{ base: '0', '2xl': 'md' }} zIndex="0">
            {banners?.footerSrc && (
              <Picture
                altText="CoW AMM footer"
                defaultImgType="svg"
                directory="/images/partners/"
                imgName="cow-footer"
                imgSvg
                imgSvgDark
                imgSvgPortrait
                imgSvgPortraitDark
              />
            )}
          </Box>
        </FadeInOnView>
      </Box>
    </>
  )
}
