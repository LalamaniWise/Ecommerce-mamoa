import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DashTitle } from '../DashboardLayout'
import ImageUpload from '../../../components/common/ImageUpload'
import { ErrorBox, Field, Loader, inputClass } from '../../../components/common/ui'
import { useAddProductMutation, useFetchMyProductsQuery, useUpdateProductMutation } from '../../../redux/features/products/productsApi'
import { errorMessage } from '../../../utils/format'

const CATEGORIES = ['accessories', 'dress', 'jewellery', 'cosmetics', 'shoes', 'men', 'women', 'kids', 'electronics', 'home', 'food', 'other']
const COLORS = ['black', 'white', 'red', 'blue', 'green', 'gold', 'silver', 'beige', 'pink', 'brown', 'multi']

const empty = { name: '', category: 'accessories', description: '', price: '', oldPrice: '', image: '', color: '', stock: 10, isActive: true }

// Add a new product, or edit one (when the URL has an :id)
const ProductForm = () => {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { data: products = [], isLoading } = useFetchMyProductsQuery(undefined, { skip: !isEdit })
  const [addProduct, { isLoading: adding }] = useAddProductMutation()
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation()
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    const p = products.find((x) => x._id === id)
    if (p) setForm({ ...empty, ...p, oldPrice: p.oldPrice ?? '', color: p.color || '' })
  }, [isEdit, id, products])

  if (isEdit && isLoading) return <Loader />
  if (isEdit && !isLoading && !products.find((x) => x._id === id)) return <ErrorBox>Product not found in your store.</ErrorBox>

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.image) return setError('Please add a product photo')
    const body = {
      name: form.name, category: form.category, description: form.description, image: form.image,
      color: form.color, isActive: form.isActive,
      price: Number(form.price), stock: Number(form.stock),
      oldPrice: form.oldPrice === '' ? (isEdit ? null : undefined) : Number(form.oldPrice),
    }
    try {
      if (isEdit) await updateProduct({ id, ...body }).unwrap()
      else await addProduct(body).unwrap()
      navigate('/dashboard/store/products')
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <>
      <DashTitle title={isEdit ? 'Edit product' : 'Add a product'} />
      <form onSubmit={handleSubmit} className='max-w-3xl space-y-5 rounded-lg border bg-white p-6'>
        {error && <ErrorBox>{error}</ErrorBox>}
        <ImageUpload label='Product photo' value={form.image} onChange={(image) => setForm({ ...form, image })} previewClass='h-40 w-40' />
        <Field label='Product name'><input className={inputClass} value={form.name} onChange={set('name')} required /></Field>
        <Field label='Description'><textarea className={inputClass} rows={4} value={form.description} onChange={set('description')} /></Field>
        <div className='grid gap-4 sm:grid-cols-2'>
          <Field label='Category'>
            <input className={inputClass} list='categories' value={form.category} onChange={set('category')} required />
            <datalist id='categories'>{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
          </Field>
          <Field label='Colour'>
            <input className={inputClass} list='colors' value={form.color} onChange={set('color')} />
            <datalist id='colors'>{COLORS.map((c) => <option key={c} value={c} />)}</datalist>
          </Field>
        </div>
        <div className='grid gap-4 sm:grid-cols-3'>
          <Field label='Price (R)'><input className={inputClass} type='number' min='0' step='0.01' value={form.price} onChange={set('price')} required /></Field>
          <Field label='Old price (R)' hint='Optional — shows as a sale'><input className={inputClass} type='number' min='0' step='0.01' value={form.oldPrice} onChange={set('oldPrice')} /></Field>
          <Field label='Stock'><input className={inputClass} type='number' min='0' step='1' value={form.stock} onChange={set('stock')} required /></Field>
        </div>
        <label className='flex items-center gap-2 text-sm'>
          <input type='checkbox' checked={form.isActive} onChange={set('isActive')} />
          Show this product in my store
        </label>
        <div className='flex gap-3'>
          <button type='button' onClick={() => navigate(-1)} className='rounded-md border px-6 py-3'>Cancel</button>
          <button disabled={adding || updating} className='btn disabled:opacity-60'>
            {adding || updating ? 'Saving...' : isEdit ? 'Save changes' : 'Add product'}
          </button>
        </div>
      </form>
    </>
  )
}

export default ProductForm
