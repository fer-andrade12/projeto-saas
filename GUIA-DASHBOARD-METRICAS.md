# 📊 Guia Rápido - Dashboard de Métricas

## Como Usar o Novo Dashboard

### Acesso

1. Faça login no sistema como cliente SaaS
2. Navegue até a página **Dashboard** (rota principal `/dashboard`)
3. As métricas serão carregadas automaticamente

### Métricas Disponíveis

#### 📣 Campanhas Ativas
- **O que mostra:** Número de campanhas que ainda estão rodando
- **Cálculo:** Campanhas sem data de término ou com data futura
- **Uso:** Monitore quantas campanhas estão ativas simultaneamente

#### 📨 Pessoas que Receberam
- **O que mostra:** Total de clientes que receberam suas campanhas
- **Cálculo:** Soma de todos os envios bem-sucedidos (email + WhatsApp)
- **Uso:** Acompanhe o alcance das suas campanhas

#### 👆 Cliques
- **O que mostra:** Quantas pessoas clicaram nos links da campanha
- **Cálculo:** Total de eventos de clique registrados
- **Taxa de Clique:** (Cliques / Envios) × 100
- **Uso:** Meça o engajamento dos seus clientes

#### ✅ Promoções Usadas
- **O que mostra:** Quantos cupons foram efetivamente resgatados
- **Cálculo:** Total de cupons com data de resgate preenchida
- **Taxa de Conversão:** (Resgates / Cliques) × 100
- **Uso:** Avalie a efetividade das suas promoções

#### 💰 Retorno Financeiro
- **O que mostra:** Valor total gerado pelas campanhas
- **Cálculo:** Soma de todo cashback creditado aos clientes
- **Uso:** Acompanhe o impacto financeiro das campanhas

### Tabela de Desempenho

#### Informações por Campanha

Para cada campanha, você visualiza:

- **Nome** - Identificação da campanha
- **Status** - Badge verde (Ativa) ou cinza (Encerrada)
- **Envios** - Quantidade total enviada
- **Cliques** - Quantidade que clicou
- **Taxa de Clique** - Percentual de engajamento
- **Conversões** - Quantidade que usou a promoção
- **Taxa de Conversão** - Percentual de conversão
- **Retorno (R$)** - Valor financeiro gerado

#### Como Interpretar as Taxas

**Taxa de Clique Boa:** > 20%  
**Taxa de Clique Média:** 10-20%  
**Taxa de Clique Baixa:** < 10%

**Taxa de Conversão Boa:** > 15%  
**Taxa de Conversão Média:** 5-15%  
**Taxa de Conversão Baixa:** < 5%

### Atualização Automática

- ✅ As métricas são atualizadas **automaticamente a cada 30 segundos**
- ✅ Não precisa recarregar a página manualmente
- ✅ Um spinner aparece durante o carregamento inicial
- 🔄 Você pode forçar atualização clicando em "Atualizar Métricas"

### Ações Rápidas

Na parte inferior do dashboard, você encontra botões para:

- ➕ **Nova Campanha** - Criar campanha rapidamente
- 👤 **Adicionar Cliente** - Cadastrar novo cliente
- ⭐ **Ver Planos** - Verificar planos disponíveis
- 🔄 **Atualizar Métricas** - Forçar refresh imediato

## Cenários de Uso

### 📌 Acompanhamento Diário

**Objetivo:** Ver como estão performando suas campanhas ativas

1. Acesse o dashboard pela manhã
2. Verifique o card de "Campanhas Ativas"
3. Analise as taxas de clique e conversão na tabela
4. Identifique campanhas com baixa performance
5. Tome ações corretivas (ajustar mensagem, público-alvo, etc.)

### 📌 Análise de ROI

**Objetivo:** Calcular retorno sobre investimento

1. Verifique o "Retorno Financeiro Total"
2. Compare com o custo de criação das campanhas
3. Analise campanhas individuais na tabela
4. Identifique quais tipos de campanha geram mais retorno
5. Replique estratégias bem-sucedidas

### 📌 Otimização de Campanhas

**Objetivo:** Melhorar performance com base em dados

**Se Taxa de Clique está baixa:**
- Melhore o assunto do email
- Use imagens mais atrativas
- Teste horários diferentes de envio
- Segmente melhor seu público

**Se Taxa de Conversão está baixa:**
- Revise a oferta/promoção
- Simplifique o processo de resgate
- Aumente o valor do benefício
- Adicione senso de urgência

### 📌 Relatórios para Gestão

**Objetivo:** Apresentar resultados para diretoria

1. Capture screenshot do dashboard
2. Destaque as métricas principais nos cards
3. Use a tabela para mostrar campanhas de sucesso
4. Enfatize o retorno financeiro total
5. Proponha estratégias baseadas nos dados

## Dicas Profissionais

### ✅ Boas Práticas

1. **Monitore diariamente** - Pelo menos uma vez por dia
2. **Compare períodos** - Anote métricas semanalmente
3. **Teste A/B** - Crie campanhas similares com variações
4. **Segmente** - Analise performance por tipo de cliente
5. **Aja rápido** - Se uma campanha não está performando, ajuste

### ⚠️ Alertas Importantes

- **Muitos envios, poucos cliques?** → Problema na mensagem/oferta
- **Muitos cliques, poucas conversões?** → Problema no processo de resgate
- **Retorno financeiro baixo?** → Valor de cashback pode estar baixo
- **Campanhas ativas demais?** → Pode causar fadiga no cliente

### 🎯 Metas Sugeridas

**Iniciante:**
- Taxa de clique > 15%
- Taxa de conversão > 10%
- 3-5 campanhas ativas

**Intermediário:**
- Taxa de clique > 25%
- Taxa de conversão > 15%
- 5-10 campanhas ativas

**Avançado:**
- Taxa de clique > 35%
- Taxa de conversão > 20%
- 10+ campanhas ativas
- ROI > 300%

## Troubleshooting

### Problema: Métricas aparecem zeradas

**Solução:**
1. Verifique se você criou campanhas
2. Confirme se enviou as campanhas para clientes
3. Aguarde alguns segundos para processamento
4. Clique em "Atualizar Métricas"

### Problema: Dashboard não carrega

**Solução:**
1. Verifique sua conexão com internet
2. Confirme que está logado corretamente
3. Limpe cache do navegador
4. Tente relogar no sistema

### Problema: Números parecem incorretos

**Solução:**
1. Clique em "Atualizar Métricas"
2. Aguarde 30 segundos para auto-refresh
3. Verifique no módulo de campanhas os dados brutos
4. Entre em contato com suporte se persistir

## FAQ

**P: As métricas são em tempo real?**  
R: Sim, são calculadas a cada consulta e auto-atualizam a cada 30s.

**P: Posso exportar esses dados?**  
R: No momento não, mas está planejado para versão futura.

**P: Consigo ver métricas de meses anteriores?**  
R: Atualmente mostra total acumulado. Filtro por período será adicionado.

**P: Outros usuários da empresa veem as mesmas métricas?**  
R: Sim, todos da mesma empresa veem os mesmos dados consolidados.

**P: Como o retorno financeiro é calculado?**  
R: Soma de todo cashback creditado aos clientes através das campanhas.

---

**Precisa de ajuda?** Consulte a documentação técnica em `METRICAS-DASHBOARD.md`
