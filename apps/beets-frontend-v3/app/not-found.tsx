import { BaseLayout } from './layouts/base-layout'
import { NotFoundPage } from '@repo/lib/shared/pages/NotFoundPage'

export default async function NotFound() {
  return (
    <BaseLayout renderLzBeetsModal={false}>
      <NotFoundPage />
    </BaseLayout>
  )
}
