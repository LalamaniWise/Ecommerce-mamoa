import React, { useState } from 'react'
import ProductCards from './ProductCards'
import { useFetchAllProductsQuery, useFetchProductFiltersQuery } from '../../redux/features/products/productsApi'
import { Loader, ErrorBox, EmptyState, Pagination, inputClass } from '../../components/common/ui'

const priceRanges = [
  { label: 'Under R250', value: '0-250' },
  { label: 'R250 - R500', value: '250-500' },
  { label: 'R500 - R1 000', value: '500-1000' },
  { label: 'R1 000 - R2 500', value: '1000-2500' },
  { label: 'R2 500 and above', value: '2500-' },
]

// Product grid with filters, sorting and paging.
// Used by the Shop page (whole mall) and each store's page (fixed `store`).
const ProductBrowser = ({ store, initialCategory = 'all', initialQuery = '', hideStore = false }) => {
  const [filtersState, setFiltersState] = useState({ category: initialCategory, color: 'all', priceRange: '' })
  const [q, setQ] = useState(initialQuery)
  const [search, setSearch] = useState(initialQuery)
  const [sort, setSort] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 12

  const { category, color, priceRange } = filtersState
  const [minPrice, maxPrice] = priceRange ? priceRange.split('-') : ['', '']

  const { data: meta } = useFetchProductFiltersQuery()
  const { data: { products = [], totalPages = 0, totalProducts = 0 } = {}, error, isLoading, isFetching } = useFetchAllProductsQuery({
    store, category, color, minPrice, maxPrice, q: search, sort, page: currentPage, limit: perPage,
  })

  const setFilter = (key, value) => { setFiltersState({ ...filtersState, [key]: value }); setCurrentPage(1) }
  const clearFilters = () => { setFiltersState({ category: 'all', color: 'all', priceRange: '' }); setQ(''); setSearch(''); setCurrentPage(1) }

  const startProduct = (currentPage - 1) * perPage + 1
  const endProduct = startProduct + products.length - 1

  const radio = (name, value, label) => (
    <label key={value} className='capitalize cursor-pointer'>
      <input type='radio' name={name} value={value} checked={filtersState[name] === value} onChange={() => setFilter(name, value)} />
      <span className='ml-1'>{label}</span>
    </label>
  )

  return (
    <div className='flex flex-col md:flex-row md:gap-12 gap-8'>
      {/* left side: filters */}
      <aside className='space-y-5 md:w-56 flex-shrink-0'>
        <form onSubmit={(e) => { e.preventDefault(); setSearch(q.trim()); setCurrentPage(1) }} className='flex gap-2'>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder='Search products...' className={inputClass} />
          <button className='rounded-md bg-primary px-3 text-white' aria-label='Search'><i className='ri-search-line'></i></button>
        </form>

        <div className='flex flex-col space-y-2'>
          <h4 className='font-medium text-lg'>Category</h4>
          <hr />
          {radio('category', 'all', 'all')}
          {(meta?.categories || []).map((c) => radio('category', c, c))}
        </div>

        <div className='flex flex-col space-y-2'>
          <h4 className='font-medium text-lg'>Color</h4>
          <hr />
          {radio('color', 'all', 'all')}
          {(meta?.colors || []).map((c) => radio('color', c, c))}
        </div>

        <div className='flex flex-col space-y-2'>
          <h4 className='font-medium text-lg'>Price Range</h4>
          <hr />
          {radio('priceRange', '', 'Any price')}
          {priceRanges.map((r) => radio('priceRange', r.value, r.label))}
        </div>

        <button onClick={clearFilters} className='bg-primary py-1 px-4 text-white rounded'>Clear filters</button>
      </aside>

      {/* right side: products */}
      <div className='flex-1'>
        <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <h3 className='font-medium'>
            {totalProducts > 0 ? `Showing ${startProduct} to ${endProduct} of ${totalProducts} products` : ' '}
            {isFetching && !isLoading && <i className='ri-loader-4-line animate-spin ml-2'></i>}
          </h3>
          <select value={sort} onChange={(e) => { setSort(e.target.value); setCurrentPage(1) }} className='rounded-md border px-3 py-2'>
            <option value='newest'>Newest</option>
            <option value='price-asc'>Price: low to high</option>
            <option value='price-desc'>Price: high to low</option>
            <option value='rating'>Top rated</option>
          </select>
        </div>

        {isLoading ? <Loader /> :
          error ? <ErrorBox>Error loading products. Is the server running?</ErrorBox> :
            products.length === 0 ? <EmptyState icon='ri-shopping-bag-3-line' title='No products found'>Try clearing the filters.</EmptyState> :
              <ProductCards products={products} hideStore={hideStore} />}

        <Pagination page={currentPage} totalPages={totalPages} onChange={(p) => { setCurrentPage(p); window.scrollTo(0, 0) }} />
      </div>
    </div>
  )
}

export default ProductBrowser
