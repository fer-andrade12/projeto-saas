import React, { useEffect, useState } from 'react'
import api from '../api/api'
import { Container, Card, Row, Col, Button, Alert, Spinner, Form, Modal, Table, Badge } from 'react-bootstrap'

export default function Plans() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [plans, setPlans] = useState<any[]>([])
  const [userRole, setUserRole] = useState<string>('')
  
  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'basic',
    price: '',
    billing_period: 'monthly',
    description: '',
    max_campaigns: '',
    max_customers: '',
    max_emails_per_month: ''
  })

  async function load() {
    setLoading(true)
    setMsg(null); setError(null)
    try {
      // Get user info to check role
      const userInfo = await api.get('/auth/me')
      const role = userInfo.data?.role || 'company'
      setUserRole(role)

      // Load plans based on role
      const endpoint = role === 'super_admin' ? '/plans/admin/all' : '/plans'
      const res = await api.get(endpoint)
      setPlans(res.data || [])
    } catch (e: any) {
      const m = e?.response?.data?.message || 'Failed to load plans'
      setError(Array.isArray(m) ? m.join(', ') : String(m))
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { load() }, [])

  const openCreateModal = () => {
    setEditingPlan(null)
    setFormData({
      name: '',
      type: 'basic',
      price: '',
      billing_period: 'monthly',
      description: '',
      max_campaigns: '',
      max_customers: '',
      max_emails_per_month: ''
    })
    setShowModal(true)
  }

  const openEditModal = (plan: any) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name || '',
      type: plan.type || 'basic',
      price: plan.price || '',
      billing_period: plan.billing_period || 'monthly',
      description: plan.description || '',
      max_campaigns: plan.max_campaigns || '',
      max_customers: plan.max_customers || '',
      max_emails_per_month: plan.max_emails_per_month || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null); setError(null)
    
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        max_campaigns: formData.max_campaigns ? parseInt(formData.max_campaigns) : null,
        max_customers: formData.max_customers ? parseInt(formData.max_customers) : null,
        max_emails_per_month: formData.max_emails_per_month ? parseInt(formData.max_emails_per_month) : null
      }

      if (editingPlan) {
        await api.put(`/plans/admin/${editingPlan.id}`, payload)
        setMsg('Plano atualizado com sucesso!')
      } else {
        await api.post('/plans/admin', payload)
        setMsg('Plano criado com sucesso!')
      }
      
      setShowModal(false)
      await load()
    } catch (e: any) {
      const m = e?.response?.data?.message || 'Failed to save plan'
      setError(Array.isArray(m) ? m.join(', ') : String(m))
    }
  }

  const togglePlanStatus = async (planId: number) => {
    try {
      setMsg(null); setError(null)
      await api.put(`/plans/admin/${planId}/toggle`)
      setMsg('Status do plano alterado!')
      await load()
    } catch (e: any) {
      const m = e?.response?.data?.message || 'Failed to toggle plan'
      setError(Array.isArray(m) ? m.join(', ') : String(m))
    }
  }

  const deletePlan = async (planId: number) => {
    if (!confirm('Tem certeza que deseja deletar este plano?')) return
    
    try {
      setMsg(null); setError(null)
      await api.delete(`/plans/admin/${planId}`)
      setMsg('Plano deletado com sucesso!')
      await load()
    } catch (e: any) {
      const m = e?.response?.data?.message || 'Failed to delete plan'
      setError(Array.isArray(m) ? m.join(', ') : String(m))
    }
  }

  const getBillingPeriodLabel = (period: string) => {
    const labels: any = {
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      yearly: 'Anual'
    }
    return labels[period] || period
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" className="text-white" />
        <p className="mt-2 text-white-50">Carregando planos...</p>
      </Container>
    )
  }

  // Super Admin View
  if (userRole === 'super_admin') {
    return (
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-white mb-2">
              <i className="bi bi-box-seam me-2"></i>
              Gerenciar Planos
            </h2>
            <p className="text-white-50">Configure planos de assinatura para suas empresas</p>
          </div>
          <Button variant="primary" size="lg" onClick={openCreateModal}>
            <i className="bi bi-plus-circle me-2"></i>
            Novo Plano
          </Button>
        </div>

        {msg && <Alert variant="success" dismissible onClose={() => setMsg(null)}>{msg}</Alert>}
        {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

        <Card className="shadow-lg">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Preço</th>
                  <th>Período</th>
                  <th>Limites</th>
                  <th>Status</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {plans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      <i className="bi bi-inbox fs-1 opacity-50 d-block mb-2"></i>
                      Nenhum plano cadastrado
                    </td>
                  </tr>
                ) : (
                  plans.map(plan => (
                    <tr key={plan.id}>
                      <td className="fw-bold">{plan.name}</td>
                      <td>
                        <Badge bg="secondary">{plan.type}</Badge>
                      </td>
                      <td className="fw-bold text-success">R$ {plan.price}</td>
                      <td>{getBillingPeriodLabel(plan.billing_period)}</td>
                      <td className="small text-muted">
                        {plan.max_campaigns && <div>📊 {plan.max_campaigns} campanhas</div>}
                        {plan.max_customers && <div>👥 {plan.max_customers} clientes</div>}
                        {plan.max_emails_per_month && <div>📧 {plan.max_emails_per_month} emails/mês</div>}
                        {!plan.max_campaigns && !plan.max_customers && !plan.max_emails_per_month && '—'}
                      </td>
                      <td>
                        <Badge bg={plan.active ? 'success' : 'secondary'}>
                          {plan.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => openEditModal(plan)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button 
                          variant={plan.active ? 'outline-warning' : 'outline-success'} 
                          size="sm"
                          className="me-2"
                          onClick={() => togglePlanStatus(plan.id)}
                        >
                          <i className={`bi bi-${plan.active ? 'pause' : 'play'}-circle`}></i>
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => deletePlan(plan.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Modal for Create/Edit */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {editingPlan ? 'Editar Plano' : 'Novo Plano'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nome do Plano *</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Plano Básico"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tipo *</Form.Label>
                    <Form.Select
                      required
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="basic">Básico</option>
                      <option value="standard">Padrão</option>
                      <option value="premium">Premium</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Preço (R$) *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Período de Cobrança *</Form.Label>
                    <Form.Select
                      required
                      value={formData.billing_period}
                      onChange={e => setFormData({...formData, billing_period: e.target.value})}
                    >
                      <option value="monthly">Mensal</option>
                      <option value="quarterly">Trimestral</option>
                      <option value="yearly">Anual</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Descrição</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Descreva os benefícios deste plano..."
                />
              </Form.Group>

              <hr />
              <h6 className="text-muted mb-3">Limites (opcional)</h6>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Máx. Campanhas</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={formData.max_campaigns}
                      onChange={e => setFormData({...formData, max_campaigns: e.target.value})}
                      placeholder="Ilimitado"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Máx. Clientes</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={formData.max_customers}
                      onChange={e => setFormData({...formData, max_customers: e.target.value})}
                      placeholder="Ilimitado"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Máx. Emails/Mês</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={formData.max_emails_per_month}
                      onChange={e => setFormData({...formData, max_emails_per_month: e.target.value})}
                      placeholder="Ilimitado"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                <i className="bi bi-check-circle me-2"></i>
                {editingPlan ? 'Atualizar' : 'Criar'} Plano
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    )
  }

  // Company View (original simplified view)
  return (
    <Container className="py-5">
      <div className="mb-5">
        <h2 className="fw-bold text-white mb-2">
          <i className="bi bi-box-seam me-2"></i>
          Planos Disponíveis
        </h2>
        <p className="text-white-50">Escolha o melhor plano para sua empresa</p>
      </div>

      {msg && <Alert variant="success" dismissible onClose={() => setMsg(null)}>{msg}</Alert>}
      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

      {plans.length === 0 ? (
        <Alert variant="warning">Nenhum plano disponível no momento.</Alert>
      ) : (
        <Row className="g-4">
          {plans.map(plan => (
            <Col md={4} key={plan.id}>
              <Card className="h-100 shadow-lg hover-shadow">
                <Card.Body className="d-flex flex-column">
                  <div className="text-center mb-3">
                    <Badge bg="primary" className="mb-3">{plan.type.toUpperCase()}</Badge>
                    <h4 className="fw-bold">{plan.name}</h4>
                    <div className="display-6 fw-bold text-primary my-3">
                      R$ {plan.price}
                      <small className="fs-6 text-muted d-block">
                        {getBillingPeriodLabel(plan.billing_period)}
                      </small>
                    </div>
                  </div>
                  
                  {plan.description && (
                    <p className="text-muted mb-3">{plan.description}</p>
                  )}

                  <div className="mb-3">
                    {plan.max_campaigns && (
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        <span>Até {plan.max_campaigns} campanhas</span>
                      </div>
                    )}
                    {plan.max_customers && (
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        <span>Até {plan.max_customers} clientes</span>
                      </div>
                    )}
                    {plan.max_emails_per_month && (
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        <span>{plan.max_emails_per_month} emails por mês</span>
                      </div>
                    )}
                  </div>

                  <Button variant="primary" size="lg" className="mt-auto w-100">
                    Escolher Plano
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  )
}
