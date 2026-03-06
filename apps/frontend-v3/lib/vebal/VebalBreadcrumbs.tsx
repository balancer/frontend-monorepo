import { Box, Breadcrumb, Button } from '@chakra-ui/react'
import { ChevronRight, Home } from 'react-feather'

export function VebalBreadcrumbs() {
  return (
    <Breadcrumb.Root color="grayText" fontSize="sm">
      <Breadcrumb.List gap="sm">
        <Breadcrumb.Item>
          <Breadcrumb.Link href="/">
            <Button color="grayText" size="xs" variant="plain">
              <Home size={16} />
            </Button>
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator>
          {
            <Box color="border.base">
              <ChevronRight size={16} />
            </Box>
          }
        </Breadcrumb.Separator>
        <Breadcrumb.Item>
          <Breadcrumb.Link fontWeight="bold" href="/vebal">
            veBAL
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator>
          {
            <Box color="border.base">
              <ChevronRight size={16} />
            </Box>
          }
        </Breadcrumb.Separator>
        <Breadcrumb.Item>
          <Breadcrumb.Link fontWeight="medium" href="#">
            Manage
          </Breadcrumb.Link>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  )
}
