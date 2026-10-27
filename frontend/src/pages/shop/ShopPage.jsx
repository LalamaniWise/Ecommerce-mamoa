import React from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductBrowser from './ProductBrowser'
import { PageHeader } from '../../components/common/ui'

export const ShopPage = () => {
  const [params] = useSearchParams()
  return (
    <>
      <PageHeader title='Shop the Mall'>
        Every product from every store in the mall, in one place.
      </PageHeader>
      <section className='section__container'>
        <ProductBrowser initialCategory={params.get('category') || 'all'} initialQuery={params.get('q') || ''} />
      </section>
    </>
  )
}
