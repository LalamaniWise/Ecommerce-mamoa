import { baseApi } from '../../api/baseApi'

const storesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // public
        fetchStores: builder.query({
            query: (params = {}) => ({ url: '/stores', params }),
            providesTags: ['Stores'],
        }),
        fetchStoreCategories: builder.query({
            query: () => '/stores/categories',
            providesTags: ['Stores'],
        }),
        fetchStoreBySlug: builder.query({
            query: (slug) => `/stores/${slug}`,
            providesTags: ['Stores'],
        }),
        fetchPlans: builder.query({
            query: (params = {}) => ({ url: '/plans', params }),
            providesTags: ['Plans'],
        }),

        // store owner
        openStore: builder.mutation({
            query: (body) => ({ url: '/stores', method: 'POST', body }),
            invalidatesTags: ['MyStore', 'User', 'Stores'],
        }),
        fetchMyStore: builder.query({
            query: () => '/stores/mine',
            providesTags: ['MyStore'],
        }),
        updateMyStore: builder.mutation({
            query: (body) => ({ url: '/stores/mine', method: 'PATCH', body }),
            invalidatesTags: ['MyStore', 'Stores'],
        }),
        paySubscription: builder.mutation({
            query: (body) => ({ url: '/stores/mine/subscription', method: 'POST', body }),
            invalidatesTags: ['MyStore', 'Payments', 'Stats', 'Stores'],
        }),
        fetchMyPayments: builder.query({
            query: () => '/stores/mine/payments',
            providesTags: ['Payments'],
        }),
        fetchMyStoreStats: builder.query({
            query: () => '/stores/mine/stats',
            providesTags: ['Stats'],
        }),
    }),
})

export const {
    useFetchStoresQuery, useFetchStoreCategoriesQuery, useFetchStoreBySlugQuery, useFetchPlansQuery,
    useOpenStoreMutation, useFetchMyStoreQuery, useUpdateMyStoreMutation, usePaySubscriptionMutation,
    useFetchMyPaymentsQuery, useFetchMyStoreStatsQuery,
} = storesApi

export default storesApi
