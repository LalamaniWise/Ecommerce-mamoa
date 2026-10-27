import React from 'react'
import { Link } from 'react-router-dom'
import StoreCard from '../stores/StoreCard'
import { useFetchStoresQuery } from '../../redux/features/stores/storesApi'

const FeaturedStores = () => {
  const { data: stores = [] } = useFetchStoresQuery({ limit: 8 })
  if (stores.length === 0) return null

  return (
    <section className='section__container'>
      <h2 className='section__header'>Stores in the mall</h2>
      <p className='section__subheader mb-12'>Meet the businesses selling on Mamoa.</p>
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        {stores.map((s) => <StoreCard key={s._id} store={s} />)}
      </div>
      <div className='product__btn'>
        <Link to='/stores' className='btn inline-block'>See all stores</Link>
      </div>
    </section>
  )
}

export default FeaturedStores
