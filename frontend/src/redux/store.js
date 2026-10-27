import { configureStore } from '@reduxjs/toolkit';
import cartReducer from "./features/cart/cartSlice";
import authReducer from './features/auth/authSlice'
import { baseApi } from './api/baseApi';

// register all endpoint files with the API client
import './features/auth/authApi';
import './features/products/productsApi';
import './features/stores/storesApi';
import './features/orders/ordersApi';
import './features/admin/adminApi';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});
