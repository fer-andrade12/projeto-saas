# Sistema de Métricas do Dashboard - Documentação

## 📊 Visão Geral

Sistema automático de acompanhamento de métricas de campanhas em tempo real para o Dashboard do cliente SaaS.

## ✨ Funcionalidades Implementadas

### Métricas Principais Exibidas

1. **Campanhas Ativas**
   - Contador de campanhas que ainda estão no período ativo
   - Campanhas sem data de término ou com data futura

2. **Pessoas que Receberam**
   - Total de envios bem-sucedidos (status = 'sent')
   - Contempla emails e WhatsApp

3. **Cliques nas Campanhas**
   - Total de eventos do tipo 'click' registrados
   - Taxa de clique calculada: (cliques / envios) * 100

4. **Promoções Usadas**
   - Total de cupons resgatados (redeemed_at preenchido)
   - Taxa de conversão: (resgates / cliques) * 100

5. **Retorno Financeiro**
   - Soma do valor de cashback creditado
   - Baseado em eventos do tipo 'cashback_credit'

### Tabela de Desempenho por Campanha

Exibe detalhes individuais de cada campanha:
- Nome da campanha
- Status (Ativa/Encerrada)
- Quantidade de envios
- Quantidade de cliques
- Taxa de clique
- Quantidade de conversões
- Taxa de conversão
- Retorno financeiro individual

## 🔧 Arquitetura Backend

### Endpoint Criado

**GET** `/admin/campaigns/metrics`

**Autenticação:** JWT obrigatório  
**Permissões:** admin, gestor, operador, company

**Response:**
```json
{
  "active_campaigns": 5,
  "total_sends": 1234,
  "total_clicks": 456,
  "total_redemptions": 123,
  "financial_return": 5432.10,
  "click_rate": "36.95%",
  "conversion_rate": "26.97%",
  "campaigns": [
    {
      "campaign_id": 1,
      "campaign_name": "Black Friday 2024",
      "sends": 500,
      "clicks": 180,
      "redemptions": 45,
      "financial_return": 2500.00,
      "click_rate": "36.00%",
      "conversion_rate": "25.00%",
      "is_active": true
    }
  ]
}
```

### Service Method

**`getMetrics(company_id: number)`**

Executa queries otimizadas para:
- Contar campanhas ativas da empresa
- Totalizar envios com status 'sent'
- Totalizar eventos de clique
- Totalizar cupons resgatados
- Somar valores de cashback creditado
- Calcular métricas individuais por campanha

### Dependências Adicionadas

```typescript
// campaigns.module.ts
TypeOrmModule.forFeature([
  Campaign,
  CampaignSend,
  EndCustomer,
  CampaignEvent,      // ← Nova
  CouponAssignment    // ← Nova
])
```

## 🎨 Arquitetura Frontend

### Componente Dashboard.tsx

**Estado:**
```typescript
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
```

### Auto-Refresh

- Atualização automática a cada **30 segundos**
- Implementado com `setInterval` no `useEffect`
- Cleanup automático ao desmontar componente

```typescript
const interval = setInterval(loadDashboardData, 30000)
return () => clearInterval(interval)
```

### Cards de Métricas

- **Campanhas Ativas** - Ícone megafone (azul)
- **Pessoas Receberam** - Ícone envio (verde)
- **Cliques** - Ícone cursor (amarelo) + taxa
- **Promoções Usadas** - Ícone check (azul claro) + taxa de conversão

### Seção de Retorno Financeiro

Card destacado com:
- Valor total em R$
- Ícone de dinheiro
- Descrição do cálculo

### Tabela Responsiva

- Lista todas as campanhas
- Badges para status ativo/encerrado
- Cores diferenciadas para taxas
- Valores monetários formatados

## 🚀 Como Testar

### 1. Verificar Backend

```bash
# No diretório backend
npm run start:dev
```

Testar endpoint manualmente:
```bash
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:3001/api/v1/admin/campaigns/metrics
```

### 2. Verificar Frontend

```bash
# No diretório frontend
npm run dev
```

Acessar: `http://localhost:5173/dashboard`

### 3. Validar Métricas

1. Criar uma campanha
2. Enviar para alguns clientes
3. Simular cliques (acessar tracking URL)
4. Resgatar cupons
5. Verificar atualização automática no dashboard

## 📈 Melhorias Futuras

- [ ] Adicionar gráficos visuais (Chart.js/Recharts)
- [ ] Filtros por período (última semana, mês, ano)
- [ ] Exportação de relatórios em PDF/Excel
- [ ] Comparativo entre campanhas
- [ ] Métricas de ROI mais detalhadas
- [ ] Notificações push quando metas são atingidas
- [ ] Dashboard drill-down (clicar em campanha para detalhes)

## 🔐 Segurança

- Todas as métricas são filtradas por `company_id` do token JWT
- Impossível visualizar dados de outras empresas
- Guards aplicados em todas as rotas
- Validação de permissões por role

## 📝 Observações Importantes

1. **Performance:** As queries usam índices nas tabelas para otimização
2. **Escalabilidade:** Para grandes volumes, considerar cache com Redis
3. **Consistência:** Métricas são calculadas em tempo real
4. **UX:** Loading spinner durante carregamento inicial
5. **Erro Handling:** Mensagens amigáveis em caso de falha

---

**Implementado em:** 29/11/2024  
**Stack:** NestJS + TypeScript + React + Bootstrap
