import React, { useEffect, useState } from 'react'
import api from '../api/api'
import { Button, Table, Form, Row, Col, Alert, Container } from 'react-bootstrap'

export default function Campaigns() {
  const [items, setItems] = useState<any[]>([])
  const [name, setName] = useState('')
  const [companyId, setCompanyId] = useState<number>(1)
  const [message, setMessage] = useState<string>('')
  const [isImpersonating, setIsImpersonating] = useState(false)

  const load = async () => {
    // Check if user is impersonating
    const token = localStorage.getItem('accessToken')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1] || ''))
        setIsImpersonating(!!payload.original_user_id)
      } catch {}
    }

    const res = await api.get('/admin/campaigns')
    setItems(res.data)
  }

  useEffect(() => { load() }, [])

  async function stopImpersonation() {
    try {
      const res = await api.post('/impersonation/stop')
      localStorage.setItem('accessToken', res.data.accessToken)
      window.location.href = '/super-admin'
    } catch (e: any) {
      setMessage('Falha ao retornar ao Super Admin')
    }
  }

  const create = async () => {
    await api.post('/admin/campaigns', { company_id: companyId, name })
    setName('')
    setMessage('Created')
    load()
  }

  const duplicate = async (id: number) => {
    await api.post(`/admin/campaigns/${id}/duplicate`)
    load()
  }

  return (
    <Container className="py-4">
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

      <h3>Campaigns</h3>
      {message && <Alert variant="success">{message}</Alert>}
      <Row className="mb-3">
        <Col md={4}><Form.Control placeholder="Company ID" type="number" value={companyId} onChange={e=>setCompanyId(Number(e.target.value))} /></Col>
        <Col md={6}><Form.Control placeholder="Campaign name" value={name} onChange={e=>setName(e.target.value)} /></Col>
        <Col md={2}><Button onClick={create} disabled={!name}>Create</Button></Col>
      </Row>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Company</th><th>Start</th><th>End</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c:any) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.company_id}</td>
              <td>{c.start_date || '-'}</td>
              <td>{c.end_date || '-'}</td>
              <td>
                <Button size="sm" variant="secondary" onClick={()=>duplicate(c.id)}>Duplicate</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  )
}
