import { baseApi } from '../../api/baseApi'

const clean = (params) =>
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null && v !== 'all'))

const productsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // public
        fetchAllProducts: builder.query({
            query: ({ page = 1, limit = 12, ...filters } = {}) => ({
                url: '/products',
                params: clean({ ...filters, page, limit }),
            }),
            providesTags: ['Products'],
        }),
        fetchProductFilters: builder.query({
            query: () => '/products/meta/filters',
            providesTags: ['Products'],
        }),
        fetchProductById: builder.query({
            query: (id) => `/products/${id}`,
            providesTags: (result, error, id) => [{ type: 'Product', id }],
        }),
        fetchRelatedProducts: builder.query({
            query: (id) => `/products/related/${id}`,
        }),
        postReview: builder.mutation({
            query: (review) => ({ url: '/reviews', method: 'POST', body: review }),
            invalidatesTags: (result, error, { productId }) => [{ type: 'Product', id: productId }, 'Products'],
        }),

        // store owner
        fetchMyProducts: builder.query({
            query: () => '/products/mine/list',
            providesTags: ['MyProducts'],
        }),
        addProduct: builder.mutation({
            query: (newProduct) => ({ url: '/products/create-product', method: 'POST', body: newProduct }),
            invalidatesTags: ['Products', 'MyProducts', 'MyStore', 'Stats'],
        }),
        updateProduct: builder.mutation({
            query: ({ id, ...rest }) => ({ url: `/products/update-product/${id}`, method: 'PATCH', body: rest }),
            invalidatesTags: (result, error, { id }) => ['Products', 'MyProducts', 'Stats', { type: 'Product', id }],
        }),
        deleteProduct: builder.mutation({
            query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
            invalidatesTags: ['Products', 'MyProducts', 'MyStore', 'Stats'],
        }),
    }),
})

export const {
    useFetchAllProductsQuery, useFetchProductFiltersQuery, useFetchProductByIdQuery,
    useFetchRelatedProductsQuery, usePostReviewMutation, useFetchMyProductsQuery,
    useAddProductMutation, useUpdateProductMutation, useDeleteProductMutation,
} = productsApi

export default productsApi
