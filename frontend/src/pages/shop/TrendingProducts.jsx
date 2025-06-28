import React, { useState } from 'react'
import ProductCards from './ProductCards'

import products from "../../data/products.json"

const TrendingProducts = () => {
    const [VisibleProducts, setVisibleProducts] = useState(8);
    const loadMoreProducts = () => {
        setVisibleProducts(prevCount => prevCount + 4)
    }
  return (
   <section className='section__container product__container'>
        <h2 className='section__header'>Trending products</h2>
        <p className='section__subheader mb-12'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia quos ipsa, 
            nihil eum cum sed quaerat nobis repellat? Illo tempore, 
            iste assumenda laudantium asperiores eaque facere magnam enim doloribus. Omnis.</p>

        {/*products cards*/}
      <div className='mt-12'>
          <ProductCards products={products.slice(0, VisibleProducts)}/>
      </div>
      {/*Load nore product btn */}
      <div className='product__btn'>
        {
          VisibleProducts < products.length && (
            <button className='btn' onClick={loadMoreProducts}>Load More</button>
          )
        }

      </div>

      </section>
  )
}

export default TrendingProducts