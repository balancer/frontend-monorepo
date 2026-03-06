import { chakra, HTMLChakraProps } from '@chakra-ui/react'
import * as React from 'react'

type SectionProps = HTMLChakraProps<'section'> & {
  variant?: string
}

function Section({ variant: _variant, ...props }: SectionProps) {
  return <chakra.section {...props} />
}

export default Section
