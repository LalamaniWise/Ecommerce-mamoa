import { createSlice } from '@reduxjs/toolkit'

// Cart items: { _id, name, price, image, stock, store: { _id, name, slug }, quantity }
// The server re-checks every price and stock level at checkout.

const TAX_RATE = 0.15

const load = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('cart') || 'null')
    if (Array.isArray(saved)) return saved
  } catch (_) { /* ignore */ }
  return []
}

const recalc = (state) => {
  state.selectedITEMS = state.products.reduce((total, p) => total + p.quantity, 0)
  state.totalPrice = state.products.reduce((total, p) => total + p.quantity * p.price, 0)
  state.tax = state.totalPrice * state.taxRate
  state.grandTotal = state.totalPrice + state.tax
  try { localStorage.setItem('cart', JSON.stringify(state.products)) } catch (_) { /* ignore */ }
}

const initialState = {
  products: load(),
  selectedITEMS: 0,
  totalPrice: 0,
  tax: 0,
  taxRate: TAX_RATE,
  grandTotal: 0,
}
recalc(initialState)

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // payload: product (optionally with quantity)
    addToCart: (state, action) => {
      const { quantity = 1, ...product } = action.payload
      const existing = state.products.find((p) => p._id === product._id)
      const max = product.stock ?? 99
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, max)
      } else {
        state.products.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock,
          store: product.store ? { _id: product.store._id, name: product.store.name, slug: product.store.slug } : null,
          quantity: Math.min(quantity, max),
        })
      }
      recalc(state)
    },
    updateQuantity: (state, action) => {
      const product = state.products.find((p) => p._id === action.payload.id)
      if (product) {
        if (action.payload.type === 'increment' && product.quantity < (product.stock ?? 99)) product.quantity += 1
        if (action.payload.type === 'decrement' && product.quantity > 1) product.quantity -= 1
      }
      recalc(state)
    },
    removeFromCart: (state, action) => {
      state.products = state.products.filter((p) => p._id !== action.payload.id)
      recalc(state)
    },
    clearCart: (state) => {
      state.products = []
      recalc(state)
    },
  },
})

// group cart lines by store, for display
export const groupByStore = (products) => {
  const groups = {}
  for (const p of products) {
    const key = p.store?._id || 'unknown'
    if (!groups[key]) groups[key] = { store: p.store, items: [] }
    groups[key].items.push(p)
  }
  return Object.values(groups)
}

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions
export default cartSlice.reducer
