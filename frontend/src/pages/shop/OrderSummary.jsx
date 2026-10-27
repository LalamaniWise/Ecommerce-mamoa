import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../../redux/features/cart/cartSlice';
import { formatPrice } from '../../utils/format';

const OrderSummary = ({ onCheckout, showButtons = true }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedITEMS, totalPrice, tax, taxRate, grandTotal } = useSelector((store) => store.cart);

  return (
    <div className='bg-primary-light mt-5 rounded text-base'>
      <div className="px-6 py-4 space-y-3">
        <h4 className="text-2xl font-bold text-dark">Order Summary</h4>
        <p className="text-dark">Selected Items: {selectedITEMS}</p>
        <p className="text-dark">Total Price: {formatPrice(totalPrice)}</p>
        <p>VAT ({taxRate * 100}%): {formatPrice(tax)}</p>
        <h3 className='font-bold'>Grand Total: {formatPrice(grandTotal)}</h3>

        {showButtons && (
          <div className="flex flex-wrap gap-3 pt-2 pb-2">
            <button
              onClick={(e) => { e.stopPropagation(); dispatch(clearCart()) }}
              className="bg-red-500 px-3 py-1.5 text-white rounded-md flex items-center gap-2">
              <span>Clear Cart</span>
              <i className="ri-delete-bin-7-line"></i>
            </button>
            <button
              onClick={() => { onCheckout?.(); navigate('/checkout') }}
              className="bg-green-600 px-3 py-1.5 text-white rounded-md flex items-center gap-2">
              <span>Proceed Checkout</span>
              <i className="ri-bank-card-line"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderSummary
