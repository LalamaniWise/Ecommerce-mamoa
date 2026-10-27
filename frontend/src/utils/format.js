export const formatPrice = (amount) =>
    'R' + Number(amount || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

export const daysUntil = (date) =>
    Math.ceil((new Date(date).getTime() - Date.now()) / (24 * 60 * 60 * 1000))

// RTK Query errors -> readable message
export const errorMessage = (error, fallback = 'Something went wrong') =>
    error?.data?.message || error?.error || fallback

export const PROVINCES = [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
    'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape',
]
