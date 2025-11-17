import React, { useEffect, useState, useRef } from 'react'
import api from '../api/api'
import { Card, Row, Col, Table, Alert, Spinner, Button, Container, Badge, Pagination } from 'react-bootstrap'

declare const Chart: any

export default function SuperAdmin() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [dashboard, setDashboard] = useState<any>(null)
  const [companies, setCompanies] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isImpersonating, setIsImpersonating] = useState(false)

  // Chart refs
  const subscriptionChartRef = useRef<any>(null)
  const planChartRef = useRef<any>(null)
  const paymentChartRef = useRef<any>(null)
  const subscriptionChartInstance = useRef<any>(null)
  const planChartInstance = useRef<any>(null)
  const paymentChartInstance = useRef<any>(null)

  async function load() {
    try {
      // Check if user is impersonating
      const token = localStorage.getItem('accessToken')
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1] || ''))
        setIsImpersonating(!!payload.original_user_id)
      }

      const [dash, comps] = await Promise.all([
        api.get('/super-admin/dashboard'),
        api.get('/super-admin/companies')
      ])
      setDashboard(dash.data)
      setCompanies(comps.data)
    } catch (e: any) {
      const m = e?.response?.data?.message || 'Falha ao carregar dados do Super Admin'
      setError(Array.isArray(m) ? m.join(', ') : String(m))
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (dashboard && typeof Chart !== 'undefined') {
      createCharts()
    }
    return () => {
      // Cleanup charts
      if (subscriptionChartInstance.current) subscriptionChartInstance.current.destroy()
      if (planChartInstance.current) planChartInstance.current.destroy()
      if (paymentChartInstance.current) paymentChartInstance.current.destroy()
    }
  }, [dashboard])

  function createCharts() {
    if (!dashboard) return

    // Subscription Status Pie Chart
    if (subscriptionChartRef.current) {
      if (subscriptionChartInstance.current) subscriptionChartInstance.current.destroy()
      
      const ctx = subscriptionChartRef.current.getContext('2d')
      subscriptionChartInstance.current = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Ativos', 'Trial', 'Suspensos', 'Cancelados', 'Free'],
          datasets: [{
            data: [
              dashboard.subscriptions.active,
              dashboard.subscriptions.trial,
              dashboard.subscriptions.suspended,
              dashboard.subscriptions.canceled,
              dashboard.companies.free
            ],
            backgroundColor: [
              '#28a745',
              '#17a2b8',
              '#ffc107',
              '#dc3545',
              '#6c757d'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#ffffff' }
            },
            title: {
              display: true,
              text: 'Status das Empresas',
              color: '#ffffff'
            }
          }
        }
      })
    }

    // Plan Distribution Chart
    if (planChartRef.current && dashboard.subscriptions.byPlan?.length > 0) {
      if (planChartInstance.current) planChartInstance.current.destroy()
      
      const ctx = planChartRef.current.getContext('2d')
      planChartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: dashboard.subscriptions.byPlan.map((p: any) => p.planName),
          datasets: [{
            data: dashboard.subscriptions.byPlan.map((p: any) => p.count),
            backgroundColor: [
              '#007bff',
              '#6610f2',
              '#e83e8c',
              '#fd7e14',
              '#20c997'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#ffffff' }
            },
            title: {
              display: true,
              text: 'Empresas por Plano',
              color: '#ffffff'
            }
          }
        }
      })
    }

    // Payment Status Chart
    if (paymentChartRef.current) {
      if (paymentChartInstance.current) paymentChartInstance.current.destroy()
      
      const ctx = paymentChartRef.current.getContext('2d')
      paymentChartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Pagamentos Pendentes', 'Pagamentos Falhados'],
          datasets: [{
            label: 'Quantidade',
            data: [
              dashboard.payments.pending,
              dashboard.payments.failed
            ],
            backgroundColor: ['#ffc107', '#dc3545']
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: '#ffffff' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' }
            },
            x: {
              ticks: { color: '#ffffff' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' }
            }
          },
          plugins: {
            legend: { labels: { color: '#ffffff' } },
            title: {
              display: true,
              text: 'Status de Pagamentos',
              color: '#ffffff'
            }
          }
        }
      })
    }
  }

  async function impersonate(companyId: number) {
    try {
      setMsg(null); setError(null)
      const res = await api.post('/impersonation/start', { company_id: companyId })
      localStorage.setItem('accessToken', res.data.accessToken)
      setMsg(`Visualizando como ${res.data.company.name}`)
      setTimeout(() => window.location.href = '/dashboard', 1000)
    } catch (e: any) {
      const m = e?.response?.data?.message || 'Falha ao impersonar'
      setError(Array.isArray(m) ? m.join(', ') : String(m))
    }
  }

  async function stopImpersonation() {
    try {
      setMsg(null); setError(null)
      const res = await api.post('/impersonation/stop')
      localStorage.setItem('accessToken', res.data.accessToken)
      setMsg('Voltou ao modo Super Admin')
      setTimeout(() => window.location.href = '/super-admin', 1000)
    } catch (e: any) {
      const m = e?.response?.data?.message || 'Falha ao retornar'
      setError(Array.isArray(m) ? m.join(', ') : String(m))
    }
  }

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentCompanies = companies.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(companies.length / itemsPerPage)

  const goToPage = (page: number) => setCurrentPage(page)

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" className="text-white" />
        <p className="mt-3 text-white-50">Carregando...</p>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      {isImpersonating && (
        <Alert variant="warning" className="mb-4 d-flex justify-content-between align-items-center">
          <span>
            <i className="bi bi-eye-fill me-2"></i>
            Você está visualizando como empresa
          </span>
          <Button variant="dark" size="sm" onClick={stopImpersonation}>
            <i className="bi bi-arrow-left me-2"></i>
            Voltar ao Super Admin
          </Button>
        </Alert>
      )}

      <div className="mb-5">
        <h1 className="fw-bold text-white mb-2">
          <i className="bi bi-shield-lock me-2"></i>
          Super Admin
        </h1>
        <p className="text-white-50">Painel de controle do SaaS</p>
      </div>

      {msg && <Alert variant="success" className="mb-4" dismissible onClose={() => setMsg(null)}>{msg}</Alert>}
      {error && <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>{error}</Alert>}
      
      {dashboard && (
        <>
          <Row className="g-4 mb-5">
            <Col md={6} lg={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className="bi bi-building fs-1 text-primary"></i>
                  </div>
                  <h3 className="fw-bold mb-2 text-white">{dashboard.companies.total}</h3>
                  <p className="text-white-50 mb-1">Total de Empresas</p>
                  <small className="text-success fw-semibold">
                    <i className="bi bi-check-circle me-1"></i>
                    {dashboard.companies.active} ativas
                  </small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className="bi bi-star fs-1 text-warning"></i>
                  </div>
                  <h3 className="fw-bold mb-2 text-white">{dashboard.subscriptions.active}</h3>
                  <p className="text-white-50 mb-0">Assinaturas Ativas</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className="bi bi-currency-dollar fs-1 text-success"></i>
                  </div>
                  <h3 className="fw-bold mb-2 text-white">R$ {dashboard.financial.mrr}</h3>
                  <p className="text-white-50 mb-0">MRR</p>
                  <small className="text-white-50">Receita Mensal Recorrente</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className="bi bi-gift fs-1 text-info"></i>
                  </div>
                  <h3 className="fw-bold mb-2 text-white">{dashboard.companies.free}</h3>
                  <p className="text-white-50 mb-0">Empresas Free</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts Row */}
          <Row className="g-4 mb-5">
            <Col lg={4}>
              <Card className="border-0 shadow-lg h-100">
                <Card.Body className="p-4">
                  <canvas ref={subscriptionChartRef}></canvas>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card className="border-0 shadow-lg h-100">
                <Card.Body className="p-4">
                  <canvas ref={planChartRef}></canvas>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card className="border-0 shadow-lg h-100">
                <Card.Body className="p-4">
                  <canvas ref={paymentChartRef}></canvas>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Trials Expiring Soon */}
          {dashboard.subscriptions.expiringSoon?.length > 0 && (
            <Card className="border-0 shadow-lg mb-5">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4 text-white">
                  <i className="bi bi-clock-history me-2 text-warning"></i>
                  Trials Encerrando em Breve (Próximos 7 dias)
                </h5>
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Empresa</th>
                      <th>Plano</th>
                      <th>Encerra em</th>
                      <th>Dias Restantes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.subscriptions.expiringSoon.map((trial: any, idx: number) => (
                      <tr key={idx}>
                        <td className="fw-semibold">{trial.companyName}</td>
                        <td><Badge bg="info">{trial.planName}</Badge></td>
                        <td>{new Date(trial.trialEndDate).toLocaleDateString('pt-BR')}</td>
                        <td>
                          <Badge bg={trial.daysRemaining <= 2 ? 'danger' : 'warning'}>
                            {trial.daysRemaining} {trial.daysRemaining === 1 ? 'dia' : 'dias'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </>
      )}

      <Card className="border-0 shadow-lg">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="fw-bold mb-1 text-white">
                <i className="bi bi-building me-2"></i>
                Empresas Cadastradas
              </h5>
              <small className="text-white-50">{companies.length} empresas no total</small>
            </div>
            <Button variant="primary" size="lg">
              <i className="bi bi-plus-circle me-2"></i>
              Nova Empresa
            </Button>
          </div>
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th className="fw-semibold">ID</th>
                  <th className="fw-semibold">Nome</th>
                  <th className="fw-semibold">Email</th>
                  <th className="fw-semibold">Status</th>
                  <th className="fw-semibold">Plano</th>
                  <th className="fw-semibold">Assinatura</th>
                  <th className="fw-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-white-50 py-5">
                      <i className="bi bi-inbox fs-1 d-block mb-3 opacity-50"></i>
                      Nenhuma empresa cadastrada
                    </td>
                  </tr>
                ) : (
                  currentCompanies.map((c: any) => (
                    <tr key={c.id}>
                      <td className="align-middle">
                        <span className="badge bg-light text-dark">{c.id}</span>
                      </td>
                      <td className="align-middle fw-semibold">{c.name}</td>
                      <td className="align-middle">
                        <small className="text-muted">{c.email || '-'}</small>
                      </td>
                      <td className="align-middle">
                        {c.active ? (
                          <Badge bg="success">Ativa</Badge>
                        ) : (
                          <Badge bg="secondary">Inativa</Badge>
                        )}
                      </td>
                      <td className="align-middle">
                        <span className="badge bg-primary">
                          {c.subscription?.plan?.name || 'Free'}
                        </span>
                      </td>
                      <td className="align-middle">
                        {c.subscription?.status === 'active' && (
                          <Badge bg="success">Ativa</Badge>
                        )}
                        {c.subscription?.status === 'trial' && (
                          <Badge bg="info">Trial</Badge>
                        )}
                        {c.subscription?.status === 'canceled' && (
                          <Badge bg="danger">Cancelada</Badge>
                        )}
                        {!c.subscription?.status && (
                          <Badge bg="secondary">-</Badge>
                        )}
                      </td>
                      <td className="align-middle text-center">
                        <Button 
                          size="sm" 
                          variant="warning" 
                          onClick={() => impersonate(c.id)}
                          className="me-2"
                        >
                          <i className="bi bi-eye me-1"></i>
                          Ver como empresa
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="text-white-50">
                Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, companies.length)} de {companies.length} empresas
              </div>
              <Pagination className="mb-0">
                <Pagination.First 
                  onClick={() => goToPage(1)} 
                  disabled={currentPage === 1}
                />
                <Pagination.Prev 
                  onClick={() => goToPage(currentPage - 1)} 
                  disabled={currentPage === 1}
                />
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </Pagination.Item>
                    )
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <Pagination.Ellipsis key={page} disabled />
                  }
                  return null
                })}
                <Pagination.Next 
                  onClick={() => goToPage(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last 
                  onClick={() => goToPage(totalPages)} 
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}
