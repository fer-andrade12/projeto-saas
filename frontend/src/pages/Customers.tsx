import React, { useEffect, useState } from 'react'
import api from '../api/api'
import { Button, Table, Form, Row, Col, Alert, Container } from 'react-bootstrap'

export default function Customers() {
  const [items, setItems] = useState<any[]>([])
  const [companyId, setCompanyId] = useState<number>(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [csv, setCsv] = useState('name,email,phone\nJohn,john@example.com,\nMary,,+5511999999999')
  const [msg, setMsg] = useState('')
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

    const res = await api.get('/admin/customers')
    setItems(res.data)
  }

  useEffect(() => { load() }, [])

  async function stopImpersonation() {
    try {
      const res = await api.post('/impersonation/stop')
      localStorage.setItem('accessToken', res.data.accessToken)
      window.location.href = '/super-admin'
    } catch (e: any) {
      setMsg('Falha ao retornar ao Super Admin')
    }
  }

  const create = async () => {
    await api.post('/admin/customers', { company_id: companyId, name, email, phone })
    setName(''); setEmail(''); setPhone('');
    setMsg('Customer created')
    load()
  }

  const doImport = async () => {
    const res = await api.post('/admin/customers/import', { company_id: companyId, csv })
    setMsg(`Imported ${res.data.created} customers`)
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

      <h3>Customers</h3>
      {msg && <Alert variant="info">{msg}</Alert>}
      <Row className="mb-3">
        <Col md={2}><Form.Control placeholder="Company ID" type="number" value={companyId} onChange={e=>setCompanyId(Number(e.target.value))} /></Col>
        <Col md={3}><Form.Control placeholder="Name" value={name} onChange={e=>setName(e.target.value)} /></Col>
        <Col md={3}><Form.Control placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} /></Col>
        <Col md={3}><Form.Control placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} /></Col>
        <Col md={1}><Button onClick={create} disabled={!name && !email && !phone}>Add</Button></Col>
      </Row>
      <Row className="mb-3">
        <Col md={9}><Form.Control as="textarea" rows={4} value={csv} onChange={e=>setCsv(e.target.value)} /></Col>
        <Col md={3}><Button onClick={doImport} className="mt-2">Import CSV</Button></Col>
      </Row>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Company</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c:any) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.phone}</td>
              <td>{c.company_id}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  )
}
