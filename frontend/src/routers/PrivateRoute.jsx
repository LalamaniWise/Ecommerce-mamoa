import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

// <PrivateRoute> -> any logged-in user
// <PrivateRoute roles={['admin']}> -> only those roles
const PrivateRoute = ({ children, roles }) => {
  const { user } = useSelector((state) => state.auth)
  const location = useLocation()

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to='/dashboard' replace />
  }
  return children
}

export default PrivateRoute
