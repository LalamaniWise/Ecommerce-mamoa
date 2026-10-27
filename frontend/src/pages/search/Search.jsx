import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import ProductCards from '../shop/ProductCards';
import StoreCard from '../stores/StoreCard';
import { useFetchAllProductsQuery } from '../../redux/features/products/productsApi';
import { useFetchStoresQuery } from '../../redux/features/stores/storesApi';
import { Loader, EmptyState, PageHeader } from '../../components/common/ui';

const Search = () => {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(query);

  const { data: { products = [], totalProducts = 0 } = {}, isFetching } = useFetchAllProductsQuery({ q: query, limit: 24 }, { skip: !query })
  const { data: stores = [] } = useFetchStoresQuery({ q: query, limit: 8 }, { skip: !query })

  const handleSearch = (e) => {
    e.preventDefault()
    setParams(searchQuery.trim() ? { q: searchQuery.trim() } : {})
  }

  return (
    <>
      <PageHeader title='Search the Mall'>Find products and stores.</PageHeader>

      <section className='section__container'>
        <form onSubmit={handleSearch} className='w-full mb-12 flex flex-col md:flex-row items-center justify-center gap-4'>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus
            className='search-bar w-full max-w-4xl p-2 border rounded' placeholder='Search for products or stores...' />
          <button className='search-button w-full md:w-auto py-2 px-8 bg-primary text-white rounded'>Search</button>
        </form>

        {!query ? null : isFetching ? <Loader text='Searching...' /> : (
          <>
            {stores.length > 0 && (
              <div className='mb-12'>
                <h3 className='mb-4 text-xl font-semibold'>Stores</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                  {stores.map((s) => <StoreCard key={s._id} store={s} />)}
                </div>
              </div>
            )}
            <h3 className='mb-4 text-xl font-semibold'>Products ({totalProducts})</h3>
            {products.length === 0
              ? <EmptyState icon='ri-search-line' title={`Nothing found for "${query}"`} />
              : <ProductCards products={products} />}
          </>
        )}
      </section>
    </>
  )
}

export default Search
