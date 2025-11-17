import React, { useEffect, useState } from 'react'
import { Form, Button, Card, Alert, Spinner, Container, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      const { accessToken, refreshToken } = res.data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Login failed'
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Row className="w-100">
        <Col md={6} lg={5} xl={4} className="mx-auto">
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary">SaaS Campaign</h2>
                <p className="text-muted">Entre com suas credenciais</p>
              </div>
              {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Email</Form.Label>
                  <Form.Control 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    size="lg"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Senha</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    size="lg"
                    required
                  />
                </Form.Group>
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={loading}
                  className="w-100 py-2 fw-semibold"
                  size="lg"
                >
                  {loading ? (<><Spinner size="sm" animation="border" className="me-2" />Entrando...</>) : 'Entrar'}
                </Button>
              </Form>
              <div className="text-center mt-4">
                <small className="text-muted">
                  Não tem conta? <a href="/signup" className="text-primary fw-semibold">Cadastre-se</a>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
