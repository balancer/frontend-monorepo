import { Box, Container, ContainerProps } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'

type Props = {
  noVerticalPadding?: boolean
}

export function DefaultPageContainer({
  children,
  noVerticalPadding,
  ...rest
}: PropsWithChildren & ContainerProps & Props) {
  return (
    <Box pt={noVerticalPadding ? '0px' : '72px'}>
      <Container
        maxW="maxContent"
        py={noVerticalPadding ? 0 : ['xl', '2xl']}
        px={['ms', 'md']}
        overflowX={{ base: 'hidden', md: 'visible' }}
        {...rest}
      >
        {children}
      </Container>
    </Box>
  )
}
