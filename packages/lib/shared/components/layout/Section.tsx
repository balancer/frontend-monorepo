import { chakra, HTMLChakraProps, useStyleConfig } from '@chakra-ui/react'
import * as React from 'react'

type SectionProps = HTMLChakraProps<'section'> & {
  variant?: string
}

const Section: React.FC<SectionProps> = ({ variant, ...props }) => {
  const styles = useStyleConfig('Section', { variant })

  return <chakra.section __css={styles} {...props} />
}

export default Section
