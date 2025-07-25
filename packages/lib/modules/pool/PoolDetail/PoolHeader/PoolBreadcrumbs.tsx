import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button } from '@chakra-ui/react'
import { usePool } from '../../PoolProvider'
import { ChevronRight, Home } from 'react-feather'
import { isCowAmmPool } from '../../pool.helpers'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export function PoolBreadcrumbs() {
  const { pool } = usePool()

  const poolsLabel = isCowAmmPool(pool.type) ? 'CoW pools' : 'Pools'
  const poolsHref = isCowAmmPool(pool.type) ? '/pools/cow' : '/pools'

  return (
    <Breadcrumb
      color="grayText"
      fontSize="sm"
      pb="ms"
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
        <BreadcrumbLink fontWeight="medium" href={poolsHref}>
          {poolsLabel}
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem isCurrentPage>
        <BreadcrumbLink href="#">
          {PROJECT_CONFIG.options.showPoolName ? pool.name : pool.symbol}
        </BreadcrumbLink>
      </BreadcrumbItem>
    </Breadcrumb>
  )
}
