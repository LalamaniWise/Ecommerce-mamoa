import { baseApi } from '../../api/baseApi'

const ordersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        checkout: builder.mutation({
            query: (body) => ({ url: '/orders/checkout', method: 'POST', body }),
            invalidatesTags: ['Orders', 'Products', 'StoreOrders', 'Stats'],
        }),
        fetchCheckout: builder.query({
            query: (checkoutId) => `/orders/checkout/${checkoutId}`,
        }),
        fetchMyOrders: builder.query({
            query: () => '/orders/mine',
            providesTags: ['Orders'],
        }),
        fetchStoreOrders: builder.query({
            query: (params = {}) => ({ url: '/orders/store', params }),
            providesTags: ['StoreOrders'],
        }),
        fetchAllOrders: builder.query({
            query: (params = {}) => ({ url: '/orders', params }),
            providesTags: ['StoreOrders'],
        }),
        updateOrderStatus: builder.mutation({
            query: ({ id, status }) => ({ url: `/orders/${id}/status`, method: 'PATCH', body: { status } }),
            invalidatesTags: ['StoreOrders', 'Orders', 'Stats', 'MyProducts'],
        }),
    }),
})

export const {
    useCheckoutMutation, useFetchCheckoutQuery, useFetchMyOrdersQuery, useFetchStoreOrdersQuery,
    useFetchAllOrdersQuery, useUpdateOrderStatusMutation,
} = ordersApi

export default ordersApi
