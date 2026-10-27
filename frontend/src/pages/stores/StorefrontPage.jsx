import React, { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductBrowser from '../shop/ProductBrowser'
import { useFetchStoreBySlugQuery } from '../../redux/features/stores/storesApi'
import { Loader, EmptyState } from '../../components/common/ui'

// A store's own page inside the mall
const StorefrontPage = () => {
  const { slug } = useParams()
  const { data: store, isLoading, error } = useFetchStoreBySlugQuery(slug)

  useEffect(() => { window.scrollTo(0, 0) }, [slug])

  if (isLoading) return <Loader />
  if (error) {
    return (
      <EmptyState icon='ri-store-3-line' title='This store is closed'>
        It may not exist or may be temporarily unavailable. <Link to='/stores' className='text-primary underline'>See all stores</Link>
      </EmptyState>
    )
  }

  const color = store.themeColor || '#ed3849'

  return (
    <>
      <section className='relative'>
        <div className='h-48 md:h-72 w-full' style={{ backgroundColor: color }}>
          {store.banner && <img src={store.banner} alt='' className='h-full w-full object-cover' />}
        </div>
        <div className='mx-auto max-w-screen-2xl px-4'>
          <div className='-mt-12 flex flex-col gap-4 md:flex-row md:items-end'>
            <div className='flex size-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-md'>
              {store.logo
                ? <img src={store.logo} alt='' className='h-full w-full object-cover' />
                : <span className='text-3xl font-bold' style={{ color }}>{store.name[0]}</span>}
            </div>
            <div className='flex-1 pb-2'>
              <h1 className='text-3xl font-extrabold' style={{ fontFamily: 'var(--header-font)' }}>{store.name}</h1>
              {store.tagline && <p className='text-text-light'>{store.tagline}</p>}
            </div>
            <div className='flex flex-wrap gap-4 pb-2 text-sm text-text-light'>
              {store.city && <span><i className='ri-map-pin-line'></i> {store.city}</span>}
              {store.contactEmail && <a href={`mailto:${store.contactEmail}`} className='hover:text-primary'><i className='ri-mail-line'></i> {store.contactEmail}</a>}
              {store.phone && <a href={`tel:${store.phone}`} className='hover:text-primary'><i className='ri-phone-line'></i> {store.phone}</a>}
            </div>
          </div>
          {store.description && <p className='mt-6 max-w-3xl whitespace-pre-line text-gray-700'>{store.description}</p>}
        </div>
      </section>

      <section className='section__container'>
        <ProductBrowser key={store._id} store={store.slug} hideStore />
      </section>
    </>
  )
}

export default StorefrontPage
