// Set VITE_API_URL in frontend/.env when the API is deployed somewhere else.
export const getBaseUrl = () => {
    return import.meta.env.VITE_API_URL || "http://localhost:3000"
}
