import React from 'react'
import { Link } from 'react-router-dom'
import OrderSummary from './OrderSummary'
import { useDispatch } from 'react-redux'
import { groupByStore, removeFromCart, updateQuantity } from '../../redux/features/cart/cartSlice';
import { formatPrice } from '../../utils/format';

const CartModal = ({ products, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const groups = groupByStore(products)

  return (
    <div className={`fixed z-[1000] inset-0 bg-black bg-opacity-80 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}>
      <div className='fixed right-0 top-0 md:w-1/3 w-full bg-white h-full overflow-auto' onClick={(e) => e.stopPropagation()}>
        <div className='p-4 mt-4'>
          <div className='flex justify-between items-center mb-4'>
            <h4 className='text-xl font-semibold'>Your Cart</h4>
            <button onClick={onClose} className='text-gray-600 hover:text-gray-900' aria-label='Close cart'>
              <i className='ri-close-line bg-black p-1 text-white'></i>
            </button>
          </div>

          {/*cart details*/}
          <div className='cart-items'>
            {products.length === 0 ? (
              <div className='py-10 text-center text-text-light'>
                Your cart is empty. <Link to='/shop' onClick={onClose} className='text-primary underline'>Start shopping</Link>
              </div>
            ) : groups.map((group) => (
              <div key={group.store?._id || 'x'} className='mb-6'>
                <div className='mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-light'>
                  <i className='ri-store-2-line'></i>
                  {group.store?.slug
                    ? <Link to={`/stores/${group.store.slug}`} onClick={onClose} className='hover:text-primary'>{group.store.name}</Link>
                    : 'Store'}
                </div>
                {group.items.map((item) => (
                  <div key={item._id} className='flex items-center justify-between gap-3 shadow-md p-3 mb-3'>
                    <div className='flex items-center gap-3 min-w-0'>
                      <img src={item.image} alt='' className='size-12 object-cover flex-shrink-0' />
                      <div className='min-w-0'>
                        <h5 className='font-medium truncate'>{item.name}</h5>
                        <p className='text-gray-600 text-sm'>{formatPrice(item.price)}</p>
                      </div>
                    </div>
                    <div className='flex items-center flex-shrink-0'>
                      <button onClick={() => dispatch(updateQuantity({ type: 'decrement', id: item._id }))}
                        className='size-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-primary hover:text-white'>-</button>
                      <span className='px-2 text-center'>{item.quantity}</span>
                      <button onClick={() => dispatch(updateQuantity({ type: 'increment', id: item._id }))}
                        className='size-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-primary hover:text-white'>+</button>
                      <button onClick={() => dispatch(removeFromCart({ id: item._id }))}
                        className='ml-3 text-red-500 hover:text-red-800' aria-label='Remove'>
                        <i className='ri-delete-bin-line'></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {products.length > 0 && <OrderSummary onCheckout={onClose} />}
        </div>
      </div>
    </div>
  )
}

export default CartModal
