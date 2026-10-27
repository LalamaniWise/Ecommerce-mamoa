import { baseApi } from '../../api/baseApi'

const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (newUser) => ({ url: '/auth/register', method: 'POST', body: newUser }),
        }),
        loginUser: builder.mutation({
            query: (credentials) => ({ url: '/auth/login', method: 'POST', body: credentials }),
        }),
        logOutUser: builder.mutation({
            query: () => ({ url: '/auth/logout', method: 'POST' }),
        }),
        getMe: builder.query({
            query: () => '/auth/me',
            providesTags: ['User'],
        }),
        editProfile: builder.mutation({
            query: (profileData) => ({ url: '/auth/edit-profile', method: 'PATCH', body: profileData }),
            invalidatesTags: ['User'],
        }),

        // mall admin
        getUsers: builder.query({
            query: (params = {}) => ({ url: '/auth/users', params }),
            providesTags: ['Users'],
        }),
        deleteUser: builder.mutation({
            query: (userId) => ({ url: `/auth/users/${userId}`, method: 'DELETE' }),
            invalidatesTags: ['Users'],
        }),
        updateUserRole: builder.mutation({
            query: ({ userId, role }) => ({ url: `/auth/users/${userId}`, method: 'PUT', body: { role } }),
            invalidatesTags: ['Users'],
        }),
    }),
})

export const {
    useRegisterUserMutation, useLoginUserMutation, useLogOutUserMutation, useGetMeQuery, useLazyGetMeQuery,
    useEditProfileMutation, useGetUsersQuery, useDeleteUserMutation, useUpdateUserRoleMutation,
} = authApi
export default authApi
