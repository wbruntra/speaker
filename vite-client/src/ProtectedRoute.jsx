// src/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

function ProtectedRoute() {
  const user = useSelector((state) => state.user.user)

  if (user.initialized && !user.authed) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
