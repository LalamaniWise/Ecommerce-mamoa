import { configureStore } from '@reduxjs/toolkit';
import cartReducer from "./features/cart/cartSlice";
import authApi from './features/auth/authApi';
import authReducer from './features/auth/authSlice'
import productdApi from './features/products/productsApi';


export const store = configureStore({
  reducer: {
    cart: cartReducer,
    [authApi.reducerPath]: authApi.reducer,
    auth: authReducer,
    [productdApi.reducerPath] : productdApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, productdApi.middleware),
});