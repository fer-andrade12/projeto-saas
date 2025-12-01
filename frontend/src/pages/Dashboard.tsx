import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Alert, Container, Button, Spinner, Table } from 'react-bootstrap'
import api from '../api/api'

interface CampaignMetric {
  campaign_id: number
  campaign_name: string
  sends: number
  clicks: number
  redemptions: number
  financial_return: number
  click_rate: string
  conversion_rate: string
  is_active: boolean
}

interface Metrics {
  active_campaigns: number
  total_sends: number
  total_clicks: number
  total_redemptions: number
  financial_return: number
  click_rate: string
  conversion_rate: string
  campaigns: CampaignMetric[]
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      // Check if user is impersonating
      const token = localStorage.getItem('accessToken')
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1] || ''))
          if (isMounted) {
            setIsImpersonating(!!payload.original_user_id)
          }
        } catch {}
      }

      try {
        // Buscar métricas de campanhas
        const metricsRes = await api.get('/admin/campaigns/metrics')
        
        if (isMounted) {
          setMetrics(metricsRes.data)
          setLoading(false)
        }
      } catch (err) {
        console.error('Erro ao carregar métricas do dashboard:', err)
        if (isMounted) {
          setError('Falha ao carregar métricas. Tente novamente.')
          setLoading(false)
        }
      }
    }

    loadDashboardData()

    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
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
        <h1 className="fw-bold text-white mb-2">Dashboard de Campanhas</h1>
        <p className="text-white-50">Acompanhamento em tempo real das suas campanhas de marketing</p>
      </div>
      
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-white-50 mt-3">Carregando métricas...</p>
        </div>
      ) : (
        <>
          <Row className="g-4 mb-5">
            <Col md={6} lg={3}>
              <Card className="border-0 shadow-sm h-100 hover-shadow" style={{transition: 'all 0.3s'}}>
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className="bi bi-megaphone-fill fs-1 text-primary"></i>
                  </div>
                  <h3 className="fw-bold mb-2 text-white">{metrics?.active_campaigns || 0}</h3>
                  <p className="text-white-50 mb-0">Campanhas Ativas</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="border-0 shadow-sm h-100 hover-shadow" style={{transition: 'all 0.3s'}}>
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className="bi bi-send-fill fs-1 text-success"></i>
                  </div>
                  <h3 className="fw-bold mb-2 text-white">{metrics?.total_sends || 0}</h3>
                  <p className="text-white-50 mb-0">Pessoas Receberam</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="border-0 shadow-sm h-100 hover-shadow" style={{transition: 'all 0.3s'}}>
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className="bi bi-cursor-fill fs-1 text-warning"></i>
                  </div>
                  <h3 className="fw-bold mb-2 text-white">{metrics?.total_clicks || 0}</h3>
                  <p className="text-white-50 mb-0">Cliques</p>
                  <small className="text-white-50">Taxa: {metrics?.click_rate || '0.00%'}</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="border-0 shadow-sm h-100 hover-shadow" style={{transition: 'all 0.3s'}}>
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className="bi bi-check-circle-fill fs-1 text-info"></i>
                  </div>
                  <h3 className="fw-bold mb-2 text-white">{metrics?.total_redemptions || 0}</h3>
                  <p className="text-white-50 mb-0">Promoções Usadas</p>
                  <small className="text-white-50">Conversão: {metrics?.conversion_rate || '0.00%'}</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4 mb-4">
            <Col lg={12}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0 text-white">
                      <i className="bi bi-cash-stack me-2"></i>
                      Retorno Financeiro Total
                    </h5>
                  </div>
                  <h2 className="text-success fw-bold mb-0">
                    R$ {(metrics?.financial_return || 0).toFixed(2)}
                  </h2>
                  <p className="text-white-50 mb-0 mt-2">
                    Valor gerado através de cashback e promoções
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4">
            <Col lg={12}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-4 text-white">
                    <i className="bi bi-bar-chart-fill me-2"></i>
                    Desempenho por Campanha
                  </h5>
                  {metrics?.campaigns && metrics.campaigns.length > 0 ? (
                    <div className="table-responsive">
                      <Table hover variant="dark">
                        <thead>
                          <tr>
                            <th>Campanha</th>
                            <th className="text-center">Status</th>
                            <th className="text-center">Envios</th>
                            <th className="text-center">Cliques</th>
                            <th className="text-center">Taxa de Clique</th>
                            <th className="text-center">Conversões</th>
                            <th className="text-center">Taxa de Conversão</th>
                            <th className="text-end">Retorno (R$)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {metrics.campaigns.map((campaign) => (
                            <tr key={campaign.campaign_id}>
                              <td className="fw-bold">{campaign.campaign_name}</td>
                              <td className="text-center">
                                {campaign.is_active ? (
                                  <span className="badge bg-success">Ativa</span>
                                ) : (
                                  <span className="badge bg-secondary">Encerrada</span>
                                )}
                              </td>
                              <td className="text-center">{campaign.sends}</td>
                              <td className="text-center">{campaign.clicks}</td>
                              <td className="text-center">
                                <span className="badge bg-warning text-dark">{campaign.click_rate}</span>
                              </td>
                              <td className="text-center">{campaign.redemptions}</td>
                              <td className="text-center">
                                <span className="badge bg-info text-dark">{campaign.conversion_rate}</span>
                              </td>
                              <td className="text-end text-success fw-bold">
                                {campaign.financial_return.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center text-white-50 py-5">
                      <i className="bi bi-inbox fs-1 mb-3 d-block opacity-50"></i>
                      <p className="mb-2 text-white">Nenhuma campanha criada ainda</p>
                      <small className="text-white-50">Comece criando sua primeira campanha!</small>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4 mt-4">
            <Col lg={12}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-4 text-white">Ações Rápidas</h5>
                  <div className="d-flex gap-3 flex-wrap">
                    <a href="/campaigns" className="btn btn-primary">
                      <i className="bi bi-plus-circle me-2"></i>Nova Campanha
                    </a>
                    <a href="/customers" className="btn btn-outline-primary">
                      <i className="bi bi-person-plus me-2"></i>Adicionar Cliente
                    </a>
                    <a href="/plans" className="btn btn-outline-success">
                      <i className="bi bi-star me-2"></i>Ver Planos
                    </a>
                    <Button variant="outline-secondary" onClick={() => window.location.reload()}>
                      <i className="bi bi-arrow-clockwise me-2"></i>Atualizar Métricas
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  )
}
