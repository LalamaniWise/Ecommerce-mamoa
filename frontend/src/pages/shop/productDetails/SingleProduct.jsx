import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import RatingStars from '../../../components/RatingStars';
import ProductCards from '../ProductCards';
import { useFetchProductByIdQuery, useFetchRelatedProductsQuery, usePostReviewMutation } from '../../../redux/features/products/productsApi';
import { addToCart } from '../../../redux/features/cart/cartSlice';
import { Loader, ErrorBox, inputClass } from '../../../components/common/ui';
import { errorMessage, formatDate, formatPrice } from '../../../utils/format';
import avatarImg from '../../../assets/avatar.png'

const SingleProduct = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth)
  const { data, error, isLoading } = useFetchProductByIdQuery(id);
  const { data: related = [] } = useFetchRelatedProductsQuery(id);
  const [postReview, { isLoading: posting }] = usePostReviewMutation()

  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewMsg, setReviewMsg] = useState('')

  useEffect(() => { window.scrollTo(0, 0); setQty(1) }, [id])

  if (isLoading) return <Loader />
  if (error) return <div className='section__container'><ErrorBox>{errorMessage(error, 'Product not found')}</ErrorBox></div>

  const { product, reviews = [] } = data
  const soldOut = product.stock <= 0

  const handleAdd = () => {
    dispatch(addToCart({ ...product, quantity: qty }))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleReview = async (e) => {
    e.preventDefault()
    setReviewMsg('')
    try {
      await postReview({ productId: product._id, rating, comment }).unwrap()
      setComment('')
      setReviewMsg('Thanks for your review!')
    } catch (err) {
      setReviewMsg(errorMessage(err))
    }
  }

  return (
    <>
      <section className='section__container bg-primary-light'>
        <h2 className='section__header capitalize'>{product.name}</h2>
        <div className='section__subheader space-x-2'>
          <span className='hover:text-primary'><Link to="/">home</Link></span>
          <i className='ri-arrow-right-s-line'></i>
          <span className='hover:text-primary'><Link to={`/stores/${product.store.slug}`}>{product.store.name}</Link></span>
          <i className='ri-arrow-right-s-line'></i>
          <span>{product.name}</span>
        </div>
      </section>

      <section className='section__container mt-8'>
        <div className='flex flex-col items-start md:flex-row gap-8'>
          {/*product image*/}
          <div className='md:w-1/2 w-full'>
            <img src={product.image} alt={product.name} className='rounded-md w-full h-auto object-cover' />
          </div>

          <div className='md:w-1/2 w-full'>
            <Link to={`/stores/${product.store.slug}`} className='mb-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-light hover:text-primary'>
              <i className='ri-store-2-line'></i> {product.store.name}
            </Link>
            <h3 className='text-2xl font-semibold mb-4'>{product.name}</h3>
            <p className='text-xl text-primary mb-4'>
              {formatPrice(product.price)} {product.oldPrice > product.price && <s className='text-gray-400'>{formatPrice(product.oldPrice)}</s>}
            </p>
            <p className='text-gray-500 mb-4 whitespace-pre-line'>{product.description}</p>

            {/*additional product info*/}
            <div className='space-y-1'>
              {product.category && <p><strong>Category: </strong><Link to={`/categories/${product.category}`} className='capitalize hover:text-primary'>{product.category}</Link></p>}
              {product.color && <p className='capitalize'><strong>Color: </strong>{product.color}</p>}
              <p><strong>Availability: </strong>{soldOut ? <span className='text-red-600'>Sold out</span> : product.stock <= 5 ? <span className='text-amber-600'>Only {product.stock} left</span> : 'In stock'}</p>
              <div className='flex gap-1 items-center'>
                <strong>Rating: </strong>
                <RatingStars rating={product.rating} />
                <span className='text-sm text-text-light'>({product.reviewCount || 0})</span>
              </div>

              <div className='mt-6 flex items-center gap-3'>
                <div className='flex items-center rounded-md border'>
                  <button className='px-3 py-2' onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
                  <span className='w-8 text-center'>{qty}</span>
                  <button className='px-3 py-2' onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
                </div>
                <button disabled={soldOut} onClick={handleAdd}
                  className='px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50'>
                  {added ? <><i className='ri-check-line'></i> Added</> : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*reviews*/}
      <section className='section__container mt-8'>
        <h3 className='text-xl font-semibold mb-6'>Customer reviews ({reviews.length})</h3>
        <div className='grid gap-10 md:grid-cols-2'>
          <div className='space-y-6'>
            {reviews.length === 0 && <p className='text-text-light'>No reviews yet. Be the first!</p>}
            {reviews.map((r) => (
              <div key={r._id} className='border-b pb-4'>
                <div className='flex items-center gap-3'>
                  <img src={r.userId?.profileImage || avatarImg} alt='' className='size-10 rounded-full object-cover' />
                  <div>
                    <p className='font-medium'>{r.userId?.username || 'Shopper'}</p>
                    <p className='text-xs text-text-light'>{formatDate(r.createdAt)}</p>
                  </div>
                </div>
                <div className='mt-2'><RatingStars rating={r.rating} /></div>
                <p className='mt-1 text-gray-700'>{r.comment}</p>
              </div>
            ))}
          </div>

          <div className='rounded-lg border p-5'>
            <h4 className='font-semibold mb-3'>Write a review</h4>
            {user ? (
              <form onSubmit={handleReview} className='space-y-3'>
                <div className='flex gap-1 text-2xl text-primary'>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button type='button' key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                      <i className={n <= rating ? 'ri-star-fill' : 'ri-star-line'}></i>
                    </button>
                  ))}
                </div>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} required rows={4}
                  placeholder='What did you think?' className={inputClass} />
                {reviewMsg && <p className='text-sm text-text-light'>{reviewMsg}</p>}
                <button disabled={posting} className='btn'>{posting ? 'Posting...' : 'Post review'}</button>
              </form>
            ) : (
              <p className='text-text-light'><Link to={`/login?redirect=/shop/${product._id}`} className='text-primary underline'>Log in</Link> to write a review.</p>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className='section__container'>
          <h3 className='text-xl font-semibold mb-6'>You may also like</h3>
          <ProductCards products={related} />
        </section>
      )}
    </>
  )
}

export default SingleProduct
