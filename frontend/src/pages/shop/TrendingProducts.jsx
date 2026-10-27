import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCards from './ProductCards'
import { useFetchAllProductsQuery } from '../../redux/features/products/productsApi'
import { Loader } from '../../components/common/ui'

const TrendingProducts = () => {
  const [visibleProducts, setVisibleProducts] = useState(8);
  const { data: { products = [], totalProducts = 0 } = {}, isLoading } = useFetchAllProductsQuery({ sort: 'rating', limit: visibleProducts })

  return (
    <section className='section__container product__container'>
      <h2 className='section__header'>Trending products</h2>
      <p className='section__subheader mb-12'>The most loved products from stores across the mall.</p>

      {/*products cards*/}
      <div className='mt-12'>
        {isLoading ? <Loader /> : <ProductCards products={products} />}
      </div>

      {/*Load more product btn */}
      <div className='product__btn'>
        {visibleProducts < totalProducts ? (
          <button className='btn' onClick={() => setVisibleProducts((n) => n + 4)}>Load More</button>
        ) : products.length > 0 && (
          <Link to='/shop' className='btn inline-block'>Browse the whole mall</Link>
        )}
      </div>
    </section>
  )
}

export default TrendingProducts
