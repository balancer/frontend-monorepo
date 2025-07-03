import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button } from '@chakra-ui/react'
import { ChevronRight, Home } from 'react-feather'

export function VebalBreadcrumbs() {
  return (
    <Breadcrumb
      color="grayText"
      fontSize="sm"
      separator={
        <Box color="border.base">
          <ChevronRight size={16} />
        </Box>
      }
      spacing="sm"
    >
      <BreadcrumbItem>
        <BreadcrumbLink href="/">
          <Button color="grayText" size="xs" variant="link">
            <Home size={16} />
          </Button>
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink fontWeight="bold" href="/vebal">
          veBAL
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem isCurrentPage>
        <BreadcrumbLink fontWeight="medium" href="#">
          Manage
        </BreadcrumbLink>
      </BreadcrumbItem>
    </Breadcrumb>
  )
}
