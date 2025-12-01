# 📖 API Documentation

Base URL: `http://localhost:8080/api/v1` (via Nginx) ou `http://localhost:3000/api/v1` (direto)

## 🔐 Autenticação

Todas as rotas protegidas requerem header:
```
Authorization: Bearer {JWT_TOKEN}
```

### POST /auth/login
Login de usuário

**Request:**
```json
{
  "email": "admin@local",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "admin@local",
    "role": "super_admin",
    "name": "Admin"
  }
}
```

### POST /auth/signup
Cadastro de nova empresa

**Request:**
```json
{
  "email": "empresa@exemplo.com",
  "password": "SenhaForte123!",
  "companyName": "Minha Empresa Ltda"
}
```

### GET /auth/me
Retorna dados do usuário autenticado

**Headers:** `Authorization: Bearer {token}`

---

## 📧 Campanhas

### GET /admin/campaigns
Lista campanhas da empresa

**Headers:** `Authorization: Bearer {token}`

**Query params:**
- `page` (optional): número da página (default: 1)
- `limit` (optional): itens por página (default: 10)

### GET /admin/campaigns/metrics
Métricas de campanhas

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "total_campaigns": 4,
  "active_campaigns": 2,
  "total_sent": 150,
  "total_opens": 75,
  "total_clicks": 30,
  "avg_open_rate": "50.00%",
  "avg_click_rate": "20.00%"
}
```

### POST /admin/campaigns
Criar nova campanha

**Request:**
```json
{
  "title": "Promoção de Verão",
  "description": "Desconto de 20% em todos os produtos",
  "email_subject": "🔥 Promoção Exclusiva!",
  "email_body": "<h1>Aproveite!</h1><p>20% OFF</p>",
  "channel": "email",
  "target_audience": "all",
  "scheduled_at": "2025-01-15T10:00:00Z"
}
```

### POST /admin/campaigns/:id/send
Enviar campanha imediatamente

---

## 👥 Clientes

### GET /admin/customers
Lista clientes da empresa

### POST /admin/customers
Adicionar novo cliente

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "phone": "+5511999999999",
  "cpf": "123.456.789-00"
}
```

### POST /admin/customers/import
Importar clientes via CSV

**Content-Type:** `multipart/form-data`

**Form field:** `file` (CSV com colunas: name,email,phone,cpf)

### POST /admin/customers/lists
Criar lista de segmentação

### POST /admin/customers/lists/:id/members
Adicionar clientes a uma lista

---

## 🎟️ Cupons

### GET /admin/coupons
Lista cupons disponíveis

### POST /admin/coupons/generate
Gerar novos cupons

**Request:**
```json
{
  "code_prefix": "VERAO",
  "quantity": 100,
  "discount_type": "percentage",
  "discount_value": 20,
  "expires_at": "2025-06-30T23:59:59Z"
}
```

### POST /admin/coupons/redeem
Resgatar cupom

**Request:**
```json
{
  "code": "VERAO-ABC123",
  "customer_email": "cliente@exemplo.com"
}
```

---

## 👑 Super Admin

> **Requer role:** `super_admin`

### GET /super-admin/dashboard
Métricas gerais do SaaS

**Response:**
```json
{
  "total_companies": 50,
  "active_subscriptions": 45,
  "mrr": 12500.00,
  "total_campaigns_sent": 5000
}
```

### GET /super-admin/companies
Lista todas as empresas

### POST /super-admin/companies
Criar nova empresa (manualmente)

### POST /super-admin/companies/:id/toggle-status
Ativar/suspender empresa

### GET /super-admin/financial/overview
Visão financeira consolidada

### GET /super-admin/financial/transactions
Histórico de pagamentos

---

## 💳 Planos

### GET /plans
Lista planos disponíveis (público)

### POST /plans/subscribe
Assinar um plano

**Request:**
```json
{
  "plan_id": 2,
  "payment_method": "credit_card",
  "billing_period": "monthly"
}
```

### GET /plans/my-subscription
Ver assinatura atual

### POST /plans/upgrade
Fazer upgrade do plano

### POST /plans/cancel
Cancelar assinatura

---

## 📊 Tracking

### GET /t/o/:trk
Rastreamento de abertura de email (pixel)

### GET /t/c/:trk
Rastreamento de clique em link

---

## 🔢 Métricas

### GET /admin/metrics/overview
Visão geral de métricas

### GET /admin/metrics/timeseries
Série temporal de eventos

**Query:**
- `start_date`: Data inicial (YYYY-MM-DD)
- `end_date`: Data final (YYYY-MM-DD)
- `granularity`: day | week | month

### GET /admin/metrics/channel
Performance por canal (email, SMS, push)

---

## Códigos de Status HTTP

- `200 OK` - Sucesso
- `201 Created` - Recurso criado
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Não autenticado
- `403 Forbidden` - Sem permissão
- `404 Not Found` - Recurso não encontrado
- `500 Internal Server Error` - Erro no servidor

---

## Roles de Usuário

- `super_admin` - Acesso completo ao painel administrativo do SaaS
- `company` - Acesso restrito aos recursos da própria empresa

---

## Observações

⚠️ **Swagger temporariamente desabilitado** devido a incompatibilidade entre TypeORM enums e Swagger auto-scan.

Para testar a API, use ferramentas como:
- **Postman**: Importe os endpoints acima
- **cURL**: `curl -H "Authorization: Bearer {token}" http://localhost:8080/api/v1/auth/me`
- **Insomnia**: Crie uma collection com os endpoints

### Exemplo de teste com PowerShell:

```powershell
# Login
$loginBody = @{
    email = "admin@local"
    password = "Admin123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json"

$token = $response.access_token

# Buscar métricas
$headers = @{
    Authorization = "Bearer $token"
}

$metrics = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/admin/campaigns/metrics" `
    -Method GET `
    -Headers $headers

$metrics | ConvertTo-Json
```

---

**Desenvolvido com:** NestJS, TypeScript, TypeORM, MySQL, Redis, Docker
