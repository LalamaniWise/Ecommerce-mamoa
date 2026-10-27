import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getBaseUrl } from '../../utils/baseURL'

// One API client for the whole app. Each feature adds its endpoints
// with baseApi.injectEndpoints (see authApi.js, productsApi.js, ...).
const baseQuery = fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/api`,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token
        if (token) headers.set('authorization', `Bearer ${token}`)
        return headers
    },
})

// if the login has expired, log out locally so the UI doesn't get stuck
const baseQueryWithLogout = async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions)
    if (result.error?.status === 401 && api.getState().auth.token) {
        api.dispatch({ type: 'auth/logout' })
    }
    return result
}

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithLogout,
    tagTypes: ['User', 'Users', 'Products', 'MyProducts', 'Product', 'Stores', 'MyStore', 'Plans', 'Orders', 'StoreOrders', 'AdminStores', 'Stats', 'Payments'],
    endpoints: () => ({}),
})

// Upload one image file; returns its public URL.
export const uploadImage = async (file, token) => {
    const body = new FormData()
    body.append('image', file)
    const res = await fetch(`${getBaseUrl()}/api/uploads/image`, {
        method: 'POST',
        body,
        credentials: 'include',
        headers: token ? { authorization: `Bearer ${token}` } : {},
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || 'Upload failed')
    return data.url
}
