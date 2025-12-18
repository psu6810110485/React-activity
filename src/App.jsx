import './App.css'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { Button, Layout, Menu } from 'antd'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import LoginScreen from './LoginScreen'
import BookScreen from './BookScreen'
import DashboardScreen from './DashboardScreen'

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

function AppShell({ onLogout, children }) {
  const location = useLocation()
  const navigate = useNavigate()

  const selectedKey = location.pathname.startsWith('/dashboard')
    ? 'dashboard'
    : location.pathname.startsWith('/books')
      ? 'books'
      : ''

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={selectedKey ? [selectedKey] : []}
            items={[
              { key: 'books', label: 'Books', onClick: () => navigate('/books') },
              { key: 'dashboard', label: 'Dashboard', onClick: () => navigate('/dashboard') },
            ]}
          />
        </div>
        <Button onClick={onLogout}>Logout</Button>
      </Layout.Header>

      <Layout.Content style={{ padding: 16 }}>
        {children}
      </Layout.Content>
    </Layout>
  )
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

  const handleLogout = () => {
    clearStoredToken()
    delete axios.defaults.headers.common.Authorization
    setIsAuthenticated(false)
    navigate('/login', { replace: true })
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
            <AppShell onLogout={handleLogout}>
              <BookScreen />
            </AppShell>
          </RequireAuth>
        }
      />

      <Route
        path="/dashboard"
        element={
          <RequireAuth isAuthenticated={isAuthenticated}>
            <AppShell onLogout={handleLogout}>
              <DashboardScreen />
            </AppShell>
          </RequireAuth>
        }
      />
      <Route path="/" element={<Navigate to={isAuthenticated ? '/books' : '/login'} replace />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/books' : '/login'} replace />} />
    </Routes>
  )
}

export default App
