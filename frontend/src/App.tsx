import React from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { Container, Navbar, Nav } from 'react-bootstrap'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SignUp from './pages/SignUp'
import Campaigns from './pages/Campaigns'
import Customers from './pages/Customers'
import ForgotPassword from './pages/ForgotPassword'
import SuperAdmin from './pages/SuperAdmin'
import Plans from './pages/Plans'

export default function App() {
  const navigate = useNavigate()
  const token = localStorage.getItem('accessToken')
  const isAuthed = !!token
  function getRole(): string | null {
    try {
      if (!token) return null
      const payload = JSON.parse(atob(token.split('.')[1] || ''))
      return payload?.role || null
    } catch { return null }
  }
  
  function isImpersonating(): boolean {
    try {
      if (!token) return false
      const payload = JSON.parse(atob(token.split('.')[1] || ''))
      return !!payload.original_user_id
    } catch { return false }
  }

  const role = getRole()
  const impersonating = isImpersonating()

  function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const ok = !!localStorage.getItem('accessToken')
    return ok ? <>{children}</> : <Navigate to="/" replace />
  }

  function RequireRole({ children, roles }: { children: React.ReactNode, roles: string[] }) {
    const r = getRole()
    if (!r) return <Navigate to="/" replace />
    if (!roles.includes(r)) return <Navigate to="/dashboard" replace />
    return <>{children}</>
  }

  function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
    const ok = !!localStorage.getItem('accessToken')
    return ok ? <Navigate to="/dashboard" replace /> : <>{children}</>
  }

  function logout() {
    try {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    } catch {}
    navigate('/', { replace: true })
  }
  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">SaaS Campaign</Navbar.Brand>
          <Nav className="me-auto">
            {isAuthed ? (
              <>
                {/* Super Admin Menu */}
                {role === 'super_admin' && !impersonating && (
                  <>
                    <Nav.Link as={Link} to="/super-admin">Super Admin</Nav.Link>
                    <Nav.Link as={Link} to="/plans">Planos</Nav.Link>
                  </>
                )}

                {/* Company Menu (or Super Admin when impersonating) */}
                {(role === 'company' || impersonating) && (
                  <>
                    <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                    <Nav.Link as={Link} to="/campaigns">Campanhas</Nav.Link>
                    <Nav.Link as={Link} to="/customers">Clientes</Nav.Link>
                    <Nav.Link as={Link} to="/plans">Planos</Nav.Link>
                  </>
                )}

                <Nav.Link onClick={logout}>Sair</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/signup">Sign Up</Nav.Link>
                <Nav.Link as={Link} to="/forgot">Forgot</Nav.Link>
              </>
            )}
          </Nav>
        </Container>
      </Navbar>
      <Container className="py-4">
        <Routes>
          <Route path="/" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/signup" element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />
          <Route path="/forgot" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          <Route path="/super-admin" element={<ProtectedRoute><RequireRole roles={["super_admin"]}><SuperAdmin /></RequireRole></ProtectedRoute>} />
          <Route path="/plans" element={<ProtectedRoute><RequireRole roles={["company","super_admin"]}><Plans /></RequireRole></ProtectedRoute>} />
        </Routes>
      </Container>
    </>
  )
}
