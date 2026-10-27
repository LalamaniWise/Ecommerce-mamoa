import React from 'react'
import { Link } from 'react-router-dom'
import RatingStars from '../../components/RatingStars'
import { addToCart } from '../../redux/features/cart/cartSlice'
import { useDispatch } from 'react-redux';
import { formatPrice } from '../../utils/format';

const ProductCards = ({ products = [], hideStore = false }) => {
  const dispatch = useDispatch();

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
      {products.map((product) => {
        const soldOut = product.stock !== undefined && product.stock <= 0
        return (
          <div key={product._id} className='product__card'>
            <div className='relative overflow-hidden'>
              <Link to={`/shop/${product._id}`}>
                <img src={product.image} alt={product.name} className='max-h-96 md:h-64 w-full object-cover hover:scale-105 transition-all duration-300' />
              </Link>
              {product.oldPrice > product.price && (
                <span className='absolute left-3 top-3 rounded bg-primary px-2 py-0.5 text-xs font-semibold text-white'>SALE</span>
              )}
              <div className='absolute top-3 right-3'>
                <button
                  disabled={soldOut}
                  title={soldOut ? 'Sold out' : 'Add to cart'}
                  onClick={(e) => { e.stopPropagation(); dispatch(addToCart(product)) }}
                  className='disabled:opacity-40'>
                  <i className="ri-shopping-cart-2-line bg-primary p-1.5 text-white hover:bg-primary-dark"></i>
                </button>
              </div>
            </div>

            {/*product description*/}
            <div className='product__card__content'>
              {!hideStore && product.store?.slug && (
                <Link to={`/stores/${product.store.slug}`} className='text-xs font-semibold uppercase tracking-wide text-text-light hover:text-primary'>
                  {product.store.name}
                </Link>
              )}
              <h4>{product.name}</h4>
              <p>{formatPrice(product.price)} {product.oldPrice > product.price ? <s>{formatPrice(product.oldPrice)}</s> : null}</p>
              <RatingStars rating={product.rating} />
              {soldOut && <p className='text-xs text-red-600'>Sold out</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ProductCards
