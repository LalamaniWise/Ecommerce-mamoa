import React from 'react'

export const Loader = ({ text = 'Loading...' }) => (
  <div className='flex items-center justify-center gap-2 py-16 text-text-light'>
    <i className='ri-loader-4-line animate-spin text-xl'></i>
    <span>{text}</span>
  </div>
)

export const ErrorBox = ({ children }) => (
  <div className='rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700'>{children}</div>
)

export const SuccessBox = ({ children }) => (
  <div className='rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-700'>{children}</div>
)

export const EmptyState = ({ icon = 'ri-inbox-line', title, children }) => (
  <div className='py-16 text-center text-text-light'>
    <i className={`${icon} text-4xl`}></i>
    <h4 className='mt-2 text-lg font-semibold text-text-dark'>{title}</h4>
    {children && <div className='mt-2'>{children}</div>}
  </div>
)

const badgeColors = {
  active: 'bg-green-100 text-green-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-amber-100 text-amber-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  suspended: 'bg-red-100 text-red-800',
  rejected: 'bg-gray-200 text-gray-700',
  cancelled: 'bg-gray-200 text-gray-700',
  overdue: 'bg-red-100 text-red-800',
  hidden: 'bg-gray-200 text-gray-700',
  admin: 'bg-purple-100 text-purple-800',
  vendor: 'bg-blue-100 text-blue-800',
  user: 'bg-gray-100 text-gray-700',
}

export const StatusBadge = ({ status, label }) => (
  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${badgeColors[status] || 'bg-gray-100 text-gray-700'}`}>
    {label || status}
  </span>
)

export const StatCard = ({ icon, label, value, hint }) => (
  <div className='rounded-lg border bg-white p-5 shadow-sm'>
    <div className='flex items-center justify-between text-text-light'>
      <span className='text-sm font-medium'>{label}</span>
      <i className={`${icon} text-xl text-primary`}></i>
    </div>
    <div className='mt-2 text-2xl font-bold text-text-dark'>{value}</div>
    {hint && <div className='mt-1 text-xs text-text-light'>{hint}</div>}
  </div>
)

export const Field = ({ label, hint, children }) => (
  <label className='block'>
    <span className='mb-1 block text-sm font-medium text-text-dark'>{label}</span>
    {children}
    {hint && <span className='mt-1 block text-xs text-text-light'>{hint}</span>}
  </label>
)

export const inputClass = 'w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:border-primary focus:outline-none'

export const Pagination = ({ page, totalPages, onChange }) => {
  if (!totalPages || totalPages <= 1) return null
  return (
    <div className='mt-8 flex flex-wrap justify-center gap-1'>
      <button disabled={page === 1} onClick={() => onChange(page - 1)}
        className='rounded-md bg-gray-200 px-4 py-2 text-gray-700 disabled:opacity-40'>Previous</button>
      {[...Array(totalPages)].map((_, i) => (
        <button key={i} onClick={() => onChange(i + 1)}
          className={`rounded-md px-4 py-2 ${page === i + 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}>
          {i + 1}
        </button>
      ))}
      <button disabled={page === totalPages} onClick={() => onChange(page + 1)}
        className='rounded-md bg-gray-200 px-4 py-2 text-gray-700 disabled:opacity-40'>Next</button>
    </div>
  )
}

export const PageHeader = ({ title, children }) => (
  <section className='section__container bg-primary-light'>
    <h2 className='section__header capitalize'>{title}</h2>
    {children && <div className='section__subheader'>{children}</div>}
  </section>
)
