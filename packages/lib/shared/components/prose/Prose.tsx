import { Box, BoxProps } from '@chakra-ui/react'
import { forwardRef } from 'react'

export const Prose = forwardRef<HTMLDivElement, BoxProps>(function Prose(
  { children, ...props },
  ref
) {
  return (
    <Box
      className="prose"
      css={{
        '& p': { marginBottom: '1em', lineHeight: '1.7' },
        '& h1, & h2, & h3, & h4, & h5, & h6': {
          fontWeight: 'bold',
          marginBottom: '0.5em',
          marginTop: '1.5em',
        },
        '& h1': { fontSize: '2xl' },
        '& h2': { fontSize: 'xl' },
        '& h3': { fontSize: 'lg' },
        '& ul, & ol': { paddingLeft: '1.5em', marginBottom: '1em' },
        '& li': { marginBottom: '0.25em' },
        '& a': { textDecoration: 'underline' },
        '& strong': { fontWeight: 'bold' },
        '& em': { fontStyle: 'italic' },
        '& blockquote': { borderLeftWidth: '4px', paddingLeft: '1em', fontStyle: 'italic' },
        '& code': { fontFamily: 'mono', fontSize: 'sm' },
        '& pre': { padding: '1em', borderRadius: '0.5em', overflow: 'auto' },
        '& hr': { marginTop: '2em', marginBottom: '2em' },
      }}
      ref={ref}
      {...props}
    >
      {children}
    </Box>
  )
})
