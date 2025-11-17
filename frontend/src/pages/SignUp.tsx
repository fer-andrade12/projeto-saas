import React, { useState } from 'react'
import { Card, Form, Button, Alert, Spinner, Container, Row, Col } from 'react-bootstrap'
import api from '../api/api'

export default function SignUp() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [accept, setAccept] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null); setError(null)
    if (password !== confirm) {
      setError('As senhas não coincidem')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/signup', { name, email, password, acceptTerms: accept })
      const verifyUrl = res.data?.verifyUrl
      setMsg(verifyUrl ? `Link de verificação (dev): ${verifyUrl}` : 'Verifique seu email para ativar sua conta')
    } catch (err: any) {
      const m = err?.response?.data?.message || 'Falha no cadastro'
      setError(Array.isArray(m) ? m.join(', ') : String(m))
    } finally { setLoading(false) }
  }

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Row className="w-100">
        <Col md={8} lg={6} xl={5} className="mx-auto">
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary">Criar Conta</h2>
                <p className="text-muted">Cadastre sua empresa gratuitamente</p>
              </div>
              {msg && <Alert variant="success" className="mb-4">{msg}</Alert>}
              {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Nome Completo</Form.Label>
                  <Form.Control 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    placeholder="João da Silva"
                    size="lg"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Email Corporativo</Form.Label>
                  <Form.Control 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    placeholder="contato@empresa.com"
                    size="lg"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Senha</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    size="lg"
                    minLength={8}
                    required
                  />
                  <Form.Text className="text-muted">
                    Use letras, números e caracteres especiais
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Confirmar Senha</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={confirm} 
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Digite a senha novamente"
                    size="lg"
                    required
                  />
                </Form.Group>
                <Form.Check 
                  className="mb-4" 
                  type="checkbox" 
                  label={<span>Aceito os <a href="#" className="text-primary">termos de uso</a> e <a href="#" className="text-primary">política de privacidade</a></span>}
                  checked={accept} 
                  onChange={e => setAccept(e.target.checked)}
                  required
                />
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={loading}
                  className="w-100 py-2 fw-semibold"
                  size="lg"
                >
                  {loading ? (<><Spinner size="sm" animation="border" className="me-2" />Criando conta...</>) : 'Cadastrar'}
                </Button>
              </Form>
              <div className="text-center mt-4">
                <small className="text-muted">
                  Já tem conta? <a href="/login" className="text-primary fw-semibold">Faça login</a>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
