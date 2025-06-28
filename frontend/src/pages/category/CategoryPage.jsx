import React, { useState, useEffect  } from 'react'
import { useParams } from 'react-router-dom'

import products from '../../data/products.json'
import ProductCards from '../shop/ProductCards';

const CategoryPage = () => {
    const {categoryName} = useParams();
    const [filteredProducts, setFilteredProducts] = useState([]);
    //console.log(categoryName)

    useEffect(() => {
        const filtered = products.filter((product) => product.category === categoryName.toLowerCase());
        setFilteredProducts(filtered);
 } , [categoryName])

    useEffect(() => {
        window.scrollTo(0, 0)
    })

  return (
    <>
    <section className='section__container bg-primary-light'>
        <h2 className='section__header capitalize'>{categoryName}</h2>
        <p className='section__subheader'>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ea iure exercitationem voluptatem harum quaerat corporis omnis 
            atque sed obcaecati vero odio qui, recusandae mollitia ullam ex saepe consectetur id inventore.</p>
    </section>

    {/*product card*/}
    <div className='section__container'>
        <ProductCards products={filteredProducts}/>
    </div>
    </>
  )
}

export default CategoryPage
