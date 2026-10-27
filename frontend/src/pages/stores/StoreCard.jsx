import React from 'react'
import { Link } from 'react-router-dom'

const StoreCard = ({ store }) => (
  <Link to={`/stores/${store.slug}`} className='group block overflow-hidden rounded-lg border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md'>
    <div className='h-28 bg-primary-light' style={store.banner ? undefined : { backgroundColor: store.themeColor || '#f4e5ec' }}>
      {store.banner && <img src={store.banner} alt='' className='h-full w-full object-cover' />}
    </div>
    <div className='relative px-4 pb-4'>
      <div className='-mt-8 mb-2 flex size-16 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow'>
        {store.logo
          ? <img src={store.logo} alt='' className='h-full w-full object-cover' />
          : <span className='text-xl font-bold' style={{ color: store.themeColor }}>{store.name?.[0]}</span>}
      </div>
      <h4 className='font-semibold text-text-dark group-hover:text-primary'>{store.name}</h4>
      {store.tagline && <p className='mt-1 line-clamp-2 text-sm text-text-light'>{store.tagline}</p>}
      <div className='mt-3 flex items-center gap-3 text-xs text-text-light'>
        {store.category && <span className='capitalize'><i className='ri-price-tag-3-line'></i> {store.category}</span>}
        {store.city && <span><i className='ri-map-pin-line'></i> {store.city}</span>}
        {store.productCount !== undefined && <span><i className='ri-shopping-bag-line'></i> {store.productCount}</span>}
      </div>
    </div>
  </Link>
)

export default StoreCard
