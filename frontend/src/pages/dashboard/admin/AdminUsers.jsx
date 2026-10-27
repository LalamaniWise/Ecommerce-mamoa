import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { DashTitle } from '../DashboardLayout'
import { Loader, ErrorBox, StatusBadge, inputClass } from '../../../components/common/ui'
import { useDeleteUserMutation, useGetUsersQuery, useUpdateUserRoleMutation } from '../../../redux/features/auth/authApi'
import { errorMessage, formatDate } from '../../../utils/format'

const roleLabels = { user: 'Shopper', vendor: 'Store owner', admin: 'Mall admin' }

const AdminUsers = () => {
  const me = useSelector((s) => s.auth.user)
  const [role, setRole] = useState('')
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const { data: users = [], isLoading, error } = useGetUsersQuery({ role: role || undefined, q: search || undefined })
  const [updateRole] = useUpdateUserRoleMutation()
  const [deleteUser] = useDeleteUserMutation()
  const [msg, setMsg] = useState('')

  const run = async (fn) => {
    setMsg('')
    try { const r = await fn().unwrap(); setMsg(r.message) } catch (e) { setMsg(errorMessage(e)) }
  }

  return (
    <>
      <DashTitle title='Users'>Everyone with an account in the mall.</DashTitle>
      <div className='mb-4 flex flex-col gap-3 sm:flex-row'>
        <select value={role} onChange={(e) => setRole(e.target.value)} className={`${inputClass} sm:w-48`}>
          <option value=''>All roles</option>
          {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <form onSubmit={(e) => { e.preventDefault(); setSearch(q.trim()) }} className='flex flex-1 gap-2 sm:max-w-sm'>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder='Search name or email...' className={inputClass} />
          <button className='rounded-md bg-primary px-3 text-white'><i className='ri-search-line'></i></button>
        </form>
      </div>
      {msg && <p className='mb-3 text-sm text-text-light'>{msg}</p>}

      {isLoading ? <Loader /> : error ? <ErrorBox>{errorMessage(error)}</ErrorBox> : (
        <div className='overflow-x-auto rounded-lg border bg-white'>
          <table className='w-full text-sm'>
            <thead className='bg-gray-50 text-left text-text-light'>
              <tr><th className='p-3'>Name</th><th className='p-3'>Email</th><th className='p-3'>Joined</th><th className='p-3'>Role</th><th className='p-3 text-right'>Actions</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className='border-t'>
                  <td className='p-3 font-medium'>{u.username}</td>
                  <td className='p-3'>{u.email}</td>
                  <td className='p-3'>{formatDate(u.createdAt)}</td>
                  <td className='p-3'><StatusBadge status={u.role} label={roleLabels[u.role]} /></td>
                  <td className='p-3 text-right whitespace-nowrap'>
                    {u._id !== me._id && (
                      <>
                        <select value={u.role} onChange={(e) => run(() => updateRole({ userId: u._id, role: e.target.value }))}
                          className='mr-2 rounded border px-2 py-1 text-sm'>
                          {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                        <button onClick={() => window.confirm(`Delete ${u.email}?`) && run(() => deleteUser(u._id))}
                          className='text-red-600 hover:underline'>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default AdminUsers
