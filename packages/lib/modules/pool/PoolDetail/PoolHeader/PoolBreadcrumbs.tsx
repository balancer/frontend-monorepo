import { Box, Breadcrumb, Button } from '@chakra-ui/react';
import { usePool } from '../../PoolProvider'
import { ChevronRight, Home } from 'react-feather'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { isCowAmmPool } from '../../pool.helpers'

export function PoolBreadcrumbs() {
  const { pool } = usePool()

  const poolsLabel = isCowAmmPool(pool.type) ? 'CoW pools' : 'Pools'
  const poolsHref = isCowAmmPool(pool.type) ? '/pools/cow' : '/pools'

  return (
    <Breadcrumb.Root color="grayText" fontSize="sm" pb="ms">
      <Breadcrumb.List gap="sm">
        <Breadcrumb.Item>
          <Breadcrumb.Link href="/">
            <Button color="grayText" size="xs" variant='plain'>
              <Home size={16} />
            </Button>
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator>{
            <Box color="border.base">
              <ChevronRight size={16} />
            </Box>
          }</Breadcrumb.Separator><Breadcrumb.Item>
          <Breadcrumb.Link fontWeight="medium" href={poolsHref}>
            {poolsLabel}
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator>{
            <Box color="border.base">
              <ChevronRight size={16} />
            </Box>
          }</Breadcrumb.Separator><Breadcrumb.Item>
          <Breadcrumb.Link href="#">
            {PROJECT_CONFIG.options.showPoolName ? pool.name : pool.symbol}
          </Breadcrumb.Link>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}
