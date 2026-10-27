import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { DashTitle } from '../DashboardLayout'
import { Loader, ErrorBox, EmptyState, StatusBadge, inputClass } from '../../../components/common/ui'
import { useDeleteProductMutation, useFetchMyProductsQuery, useUpdateProductMutation } from '../../../redux/features/products/productsApi'
import { useFetchMyStoreQuery } from '../../../redux/features/stores/storesApi'
import { errorMessage, formatPrice } from '../../../utils/format'

const VendorProducts = () => {
  const { data: products = [], isLoading, error } = useFetchMyProductsQuery()
  const { data: mine } = useFetchMyStoreQuery()
  const [deleteProduct] = useDeleteProductMutation()
  const [updateProduct] = useUpdateProductMutation()
  const [q, setQ] = useState('')
  const [msg, setMsg] = useState('')

  const limit = mine?.store?.subscription?.plan?.productLimit
  const atLimit = limit !== undefined && products.length >= limit
  const shown = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This can't be undone.`)) return
    try { await deleteProduct(p._id).unwrap() } catch (err) { setMsg(errorMessage(err)) }
  }
  const toggleVisible = async (p) => {
    try { await updateProduct({ id: p._id, isActive: !p.isActive }).unwrap() } catch (err) { setMsg(errorMessage(err)) }
  }

  return (
    <>
      <DashTitle title='Products' action={
        atLimit
          ? <Link to='/dashboard/store/subscription' className='btn text-sm'>Upgrade plan to add more</Link>
          : <Link to='/dashboard/store/products/new' className='btn text-sm'><i className='ri-add-line'></i> Add product</Link>
      }>
        {limit !== undefined && `${products.length} of ${limit} products used on your plan`}
      </DashTitle>

      {msg && <div className='mb-4'><ErrorBox>{msg}</ErrorBox></div>}
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder='Search your products...' className={`${inputClass} mb-4 max-w-sm`} />

      {isLoading ? <Loader /> : error ? <ErrorBox>{errorMessage(error)}</ErrorBox> :
        products.length === 0 ? (
          <EmptyState icon='ri-shopping-bag-3-line' title='No products yet'>
            <Link to='/dashboard/store/products/new' className='text-primary underline'>Add your first product</Link>
          </EmptyState>
        ) : (
          <div className='overflow-x-auto rounded-lg border bg-white'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-50 text-left text-text-light'>
                <tr>
                  <th className='p-3'>Product</th>
                  <th className='p-3'>Price</th>
                  <th className='p-3'>Stock</th>
                  <th className='p-3'>Status</th>
                  <th className='p-3 text-right'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => (
                  <tr key={p._id} className='border-t'>
                    <td className='p-3'>
                      <div className='flex items-center gap-3'>
                        <img src={p.image} alt='' className='size-12 flex-shrink-0 rounded object-cover' />
                        <div>
                          <p className='font-medium'>{p.name}</p>
                          <p className='text-xs capitalize text-text-light'>{p.category}{p.color && ` · ${p.color}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className='p-3 whitespace-nowrap'>{formatPrice(p.price)}</td>
                    <td className={`p-3 ${p.stock <= 3 ? 'font-semibold text-red-600' : ''}`}>{p.stock}</td>
                    <td className='p-3'>
                      <button onClick={() => toggleVisible(p)} title='Click to show/hide in the store'>
                        <StatusBadge status={p.isActive ? 'active' : 'hidden'} label={p.isActive ? 'Visible' : 'Hidden'} />
                      </button>
                    </td>
                    <td className='p-3 text-right whitespace-nowrap'>
                      <Link to={`/dashboard/store/products/${p._id}/edit`} className='mr-3 text-primary hover:underline'>Edit</Link>
                      <button onClick={() => handleDelete(p)} className='text-red-600 hover:underline'>Delete</button>
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

export default VendorProducts
