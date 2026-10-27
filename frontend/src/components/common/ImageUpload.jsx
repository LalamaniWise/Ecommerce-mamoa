import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { uploadImage } from '../../redux/api/baseApi'
import { inputClass } from './ui'

// Upload a picture from the computer, or paste an image link.
const ImageUpload = ({ value, onChange, label = 'Image', previewClass = 'h-32 w-32' }) => {
  const token = useSelector((state) => state.auth.token)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      onChange(await uploadImage(file, token))
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      <span className='mb-1 block text-sm font-medium text-text-dark'>{label}</span>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start'>
        <div className={`${previewClass} flex flex-shrink-0 items-center justify-center overflow-hidden rounded-md border bg-gray-50`}>
          {value
            ? <img src={value} alt='' className='h-full w-full object-cover' />
            : <i className='ri-image-line text-3xl text-gray-300'></i>}
        </div>
        <div className='flex-1 space-y-2'>
          <label className='inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark'>
            <i className={uploading ? 'ri-loader-4-line animate-spin' : 'ri-upload-2-line'}></i>
            {uploading ? 'Uploading...' : 'Upload image'}
            <input type='file' accept='image/png,image/jpeg,image/webp,image/gif' className='hidden' onChange={handleFile} disabled={uploading} />
          </label>
          <input type='url' value={value || ''} onChange={(e) => onChange(e.target.value)}
            placeholder='...or paste an image link' className={inputClass} />
          {error && <p className='text-sm text-red-600'>{error}</p>}
        </div>
      </div>
    </div>
  )
}

export default ImageUpload
