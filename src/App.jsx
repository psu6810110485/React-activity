import './App.css'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import LoginScreen from './LoginScreen'
import BookScreen from './BookScreen'

axios.defaults.baseURL = "http://localhost:3000"

const TOKEN_KEY = "access_token"

const readStoredToken = () => {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}

function RequireAuth({ isAuthenticated, children }) {
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function App() {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = readStoredToken()
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`
      return true
    }
    return false
  })

  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          clearStoredToken()
          delete axios.defaults.headers.common.Authorization
          setIsAuthenticated(false)
          navigate('/login', { replace: true })
        }
        return Promise.reject(error)
      }
    )

    return () => {
      axios.interceptors.response.eject(interceptorId)
    }
  }, [navigate])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    navigate('/books', { replace: true })
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginScreen onLoginSuccess={handleLoginSuccess} />}
      />
      <Route
        path="/books"
        element={
          <RequireAuth isAuthenticated={isAuthenticated}>
            <BookScreen />
          </RequireAuth>
        }
      />
      <Route path="/" element={<Navigate to={isAuthenticated ? '/books' : '/login'} replace />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/books' : '/login'} replace />} />
    </Routes>
  )
}

export default App
