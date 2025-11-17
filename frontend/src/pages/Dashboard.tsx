import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Alert, Container, Button } from 'react-bootstrap'
import api from '../api/api'

export default function Dashboard() {
  const [stats, setStats] = useState({ campaigns: 0, customers: 0, coupons: 0, cashback: 0 })
  const [error, setError] = useState<string | null>(null)
  const [isImpersonating, setIsImpersonating] = useState(false)

  useEffect(() => {
    // Check if user is impersonating
    const token = localStorage.getItem('accessToken')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1] || ''))
        setIsImpersonating(!!payload.original_user_id)
      } catch {}
    }
    // Aqui você pode carregar estatísticas reais da API
    // Por enquanto, valores mockados
  }, [])

  async function stopImpersonation() {
    try {
      const res = await api.post('/impersonation/stop')
      localStorage.setItem('accessToken', res.data.accessToken)
      window.location.href = '/super-admin'
    } catch (e: any) {
      setError('Falha ao retornar ao Super Admin')
    }
  }

  return (
    <Container className="py-5">
      {isImpersonating && (
        <Alert variant="warning" className="mb-4 d-flex justify-content-between align-items-center">
          <span>
            <i className="bi bi-eye-fill me-2"></i>
            <strong>Modo Visualização:</strong> Você está visualizando como empresa
          </span>
          <Button variant="dark" size="sm" onClick={stopImpersonation}>
            <i className="bi bi-arrow-left me-2"></i>
            Voltar ao Super Admin
          </Button>
        </Alert>
      )}

      <div className="mb-5">
        <h1 className="fw-bold text-white mb-2">Dashboard</h1>
        <p className="text-white-50">Bem-vindo ao sistema de gestão de campanhas</p>
      </div>
      
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      
      <Row className="g-4 mb-5">
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 hover-shadow" style={{transition: 'all 0.3s'}}>
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <i className="bi bi-megaphone fs-1 text-primary"></i>
              </div>
              <h3 className="fw-bold mb-2 text-white">{stats.campaigns}</h3>
              <p className="text-white-50 mb-0">Campanhas Ativas</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 hover-shadow" style={{transition: 'all 0.3s'}}>
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <i className="bi bi-people fs-1 text-success"></i>
              </div>
              <h3 className="fw-bold mb-2 text-white">{stats.customers}</h3>
              <p className="text-white-50 mb-0">Clientes Cadastrados</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 hover-shadow" style={{transition: 'all 0.3s'}}>
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <i className="bi bi-ticket-perforated fs-1 text-warning"></i>
              </div>
              <h3 className="fw-bold mb-2 text-white">{stats.coupons}</h3>
              <p className="text-white-50 mb-0">Cupons Enviados</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 hover-shadow" style={{transition: 'all 0.3s'}}>
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <i className="bi bi-cash-coin fs-1 text-info"></i>
              </div>
              <h3 className="fw-bold mb-2 text-white">R$ {stats.cashback.toFixed(2)}</h3>
              <p className="text-white-50 mb-0">Cashback Distribuído</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4 text-white">Últimas Campanhas</h5>
              <div className="text-center text-white-50 py-5">
                <i className="bi bi-inbox fs-1 mb-3 d-block opacity-50"></i>
                <p className="mb-2 text-white">Nenhuma campanha criada ainda</p>
                <small className="text-white-50">Comece criando sua primeira campanha!</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4 text-white">Ações Rápidas</h5>
              <div className="d-grid gap-2">
                <a href="/campaigns" className="btn btn-primary btn-lg">
                  <i className="bi bi-plus-circle me-2"></i>Nova Campanha
                </a>
                <a href="/customers" className="btn btn-outline-primary btn-lg">
                  <i className="bi bi-person-plus me-2"></i>Adicionar Cliente
                </a>
                <a href="/plans" className="btn btn-outline-success btn-lg">
                  <i className="bi bi-star me-2"></i>Ver Planos
                </a>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
