import { Box, Container, ContainerProps } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'

type Props = {
  noVerticalPadding?: boolean
}

export function DefaultPageContainer({
  children,
  noVerticalPadding,
  bg,
  ...rest
}: PropsWithChildren & ContainerProps & Props) {
  return (
    <Box bg={bg} pt={noVerticalPadding ? '0px' : '72px'}>
      <Container
        maxW="maxContent"
        overflowX={{ base: 'hidden', md: 'visible' }}
        px={['ms', 'md']}
        py={noVerticalPadding ? 0 : ['xl', '2xl']}
        {...rest}
      >
        {children}
      </Container>
    </Box>
  )
}
