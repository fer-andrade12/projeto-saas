import React, { useState } from 'react'
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import api from '../api/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null); setError(null)
    setLoading(true)
    try {
      const res = await api.post('/auth/forgot', { email })
      const resetUrl = res.data?.resetUrl
      setMsg(resetUrl ? `Reset link (dev): ${resetUrl}` : 'If the email exists, a reset link was sent')
    } catch (err: any) {
      const m = err?.response?.data?.message || 'Request failed'
      setError(Array.isArray(m) ? m.join(', ') : String(m))
    } finally { setLoading(false) }
  }

  return (
    <Card className="mx-auto" style={{ maxWidth: 520 }}>
      <Card.Body>
        <Card.Title>Forgot your password?</Card.Title>
        {msg && <Alert variant="success">{msg}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </Form.Group>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (<><Spinner size="sm" animation="border" className="me-2" />Sending...</>) : 'Send reset link'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}
