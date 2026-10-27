import { baseApi } from '../../api/baseApi'

const adminApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        fetchAdminStats: builder.query({
            query: () => '/admin/stats',
            providesTags: ['Stats', 'AdminStores'],
        }),
        fetchAdminStores: builder.query({
            query: (params = {}) => ({ url: '/admin/stores', params }),
            providesTags: ['AdminStores'],
        }),
        updateStoreStatus: builder.mutation({
            query: ({ id, status, note }) => ({ url: `/admin/stores/${id}/status`, method: 'PATCH', body: { status, note } }),
            invalidatesTags: ['AdminStores', 'Stats', 'Stores', 'Products'],
        }),
        extendStore: builder.mutation({
            query: ({ id, days }) => ({ url: `/admin/stores/${id}/extend`, method: 'POST', body: { days } }),
            invalidatesTags: ['AdminStores', 'Stats', 'Stores', 'Products'],
        }),
        fetchAdminPayments: builder.query({
            query: () => '/admin/payments',
            providesTags: ['Payments'],
        }),
        createPlan: builder.mutation({
            query: (body) => ({ url: '/plans', method: 'POST', body }),
            invalidatesTags: ['Plans'],
        }),
        updatePlan: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/plans/${id}`, method: 'PATCH', body }),
            invalidatesTags: ['Plans'],
        }),
        deletePlan: builder.mutation({
            query: (id) => ({ url: `/plans/${id}`, method: 'DELETE' }),
            invalidatesTags: ['Plans'],
        }),
    }),
})

export const {
    useFetchAdminStatsQuery, useFetchAdminStoresQuery, useUpdateStoreStatusMutation, useExtendStoreMutation,
    useFetchAdminPaymentsQuery, useCreatePlanMutation, useUpdatePlanMutation, useDeletePlanMutation,
} = adminApi

export default adminApi
