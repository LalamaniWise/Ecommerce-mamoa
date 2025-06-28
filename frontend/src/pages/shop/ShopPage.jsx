import React, { useEffect, useState } from 'react'
import productData from '../../data/products.json'
import ProductCards from '../../pages/shop/ProductCards'
import ShopFiltering from './ShopFiltering';
import { useFetchAllProductsQuery } from '../../redux/features/products/productsApi';

const filters = {
    categories: ['all', 'accessories', 'dress', 'jewellery','cosmetics'],
    colors : ['all','black','red', 'gold','blue','silver','beige', 'green'],
    priceRanges: [
        {label:'Under R100',min:0,max:100},
        {label:'R100 - R200',min:100,max:200},
        {label:'R200 - R300',min:200,max:300},
        {label:'R300 and above',min:300,max:Infinity}
    ]
};

export const ShopPage = () => {
   
    const [filtersState, setFiltersState] = useState({
        category: 'all',
        color: 'all',
        priceRange:''
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [ProductPerPage] = useState(8);

    const {category, color, priceRange} = filtersState;
    const [minPrice, maxPrice] = priceRange.split('-').map(Number);

    const{data:{products = [], totalPages, totalProducts} ={}, error, isLoading} = useFetchAllProductsQuery({
        category: category !== 'all' ? category: '',
         color : color !== 'all' ? color: '',
         minPrice : isNaN(minPrice) ? '': minPrice,
         maxPrice : isNaN(maxPrice) ? '': maxPrice,
         page : currentPage, 
         limit : ProductPerPage,
    })


// clear the filters
const clearFilters = () => {
    setFiltersState({
        category: 'all',
        color: 'all',
        priceRange:''
    })
}

// handle pagination
const handlePageChange = (pageNumber) => {
    if(pageNumber > 0 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber)
    }
}

if(isLoading) return <div>Loading...</div>
if(error) return <div>Error loading products. </div>

const startProduct = (currentPage - 1) * ProductPerPage + 1;
const endProduct = startProduct + products.length - 1;

     
  return (
    <>
        <section className='section__container bg-primary-light'>
        <h2 className='section__header capitalize'>Shop Page</h2>
        <p className='section__subheader'>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ea iure exercitationem voluptatem harum quaerat corporis omnis 
            atque sed obcaecati vero odio qui, recusandae mollitia ullam ex saepe consectetur id inventore.</p>
        </section>

        <section className='section__container'>
            <div className='flex flex-col md:flex-row md:gap-12 gap-8'>
                {/*left side*/}
                
                <ShopFiltering 
                filters={filters}
                filtersState={filtersState} 
                setFiltersState = {setFiltersState} 
                clearFilters={clearFilters}/>

                 {/*right side*/}
                <div>
                    <h3 className='text-x1 font-medium mb-4'>
                        Showing {startProduct} to {endProduct} of {totalProducts} Products
                        </h3>
                    <ProductCards products = {products}/>

                    {/*pagination controls*/}
                    <div className='mt-6 flex justify-center'>
                      <button 
                      disabled = {currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className='px-4 py-2 bg-gray-300 text-gray-700 rounded-md mr-2'>Previous</button>

                       {
                        [...Array(totalPages)].map((_, index) => (
                            <button key={index}
                            onClick={() => handlePageChange(index + 1)}
                            className={`px-4 py-2 ${currentPage === index + 1? 
                                'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}
                                rounded-md mx-1`}
                            >{index + 1}</button>
                        ))
                       }

                      <button 
                      disabled = {currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className='px-4 py-2 bg-gray-300 text-gray-700 rounded-md ml-2'>Next</button>
                    </div>
                </div>
            </div>


        </section>
    </>
  )
}
