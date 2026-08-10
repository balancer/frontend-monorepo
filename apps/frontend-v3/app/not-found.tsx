import { NotFoundPage } from '@repo/lib/shared/pages/NotFoundPage'
import { BaseLayout } from './layouts/base-layout'

export default async function NotFound() {
  return (
    <BaseLayout>
      <NotFoundPage />
    </BaseLayout>
  )
}
