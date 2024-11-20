import { chakra, HTMLChakraProps, useStyleConfig } from '@chakra-ui/react'
import * as React from 'react'

type SectionProps = HTMLChakraProps<'section'> & {
  variant?: string
}

function Section({ variant, ...props }: SectionProps) {
  const styles = useStyleConfig('Section', { variant })

  return <chakra.section __css={styles} {...props} />
}

export default Section
