import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import StoreCard from './StoreCard'
import { useFetchStoreCategoriesQuery, useFetchStoresQuery } from '../../redux/features/stores/storesApi'
import { Loader, ErrorBox, EmptyState, PageHeader, inputClass } from '../../components/common/ui'

const StoresPage = () => {
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const { data: categories = [] } = useFetchStoreCategoriesQuery()
  const { data: stores = [], isLoading, error } = useFetchStoresQuery({ q: search || undefined, category })

  return (
    <>
      <PageHeader title='Stores in the Mall'>
        Browse independent South African businesses, each with their own store.
      </PageHeader>

      <section className='section__container'>
        <div className='mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <form onSubmit={(e) => { e.preventDefault(); setSearch(q.trim()) }} className='flex w-full max-w-md gap-2'>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder='Search stores...' className={inputClass} />
            <button className='rounded-md bg-primary px-4 text-white'>Search</button>
          </form>
          <div className='flex flex-wrap gap-2'>
            {['all', ...categories].map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-1.5 text-sm capitalize ${category === c ? 'bg-primary text-white' : 'bg-gray-100 text-text-dark hover:bg-gray-200'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? <Loader /> : error ? <ErrorBox>Could not load stores. Is the server running?</ErrorBox> :
          stores.length === 0 ? (
            <EmptyState icon='ri-store-2-line' title='No stores found'>
              <Link to='/sell' className='text-primary underline'>Open the first one</Link>
            </EmptyState>
          ) : (
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
              {stores.map((s) => <StoreCard key={s._id} store={s} />)}
            </div>
          )}
      </section>
    </>
  )
}

export default StoresPage
