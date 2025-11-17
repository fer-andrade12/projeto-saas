# Guia de Teste Manual - 2 Perfis

## 🧪 Como Testar as Duas Possibilidades de Admin

### Pré-requisitos

```powershell
# 1. Iniciar todos os serviços
cd c:\c\projeto
docker compose up -d

# 2. Aguardar 10-15 segundos para serviços iniciarem

# 3. Verificar logs (opcional)
docker logs projeto-backend-1 --tail 50
```

### Acesso ao Sistema

- **URL:** http://localhost:8080
- **VNC (ver navegador dos testes):** http://localhost:7900 (senha: secret)

---

## 1. Testando como Super Admin

### Login
1. Acesse http://localhost:8080
2. Email: `admin@local`
3. Senha: `Admin123!`
4. Clique em "Login"

### O que você deve ver:

✅ **Navbar:**
- Logo "SaaS Campaign"
- Dashboard
- Campaigns
- Customers
- **Super Admin** ← Link exclusivo do super admin
- Sair

✅ **Dashboard:**
- Métricas gerais da empresa (exemplo)
- Gráficos e estatísticas

### Testando área Super Admin:

1. Clique em **"Super Admin"** na navbar
2. Você verá:
   - **KPIs Globais:**
     - Total de empresas
     - Empresas ativas
     - Assinaturas ativas
     - MRR (Monthly Recurring Revenue)
   
   - **Tabela de Empresas:**
     - ID
     - Nome
     - Email
     - Ativa (Yes/No)
     - Plano
     - Status
     - **Botão "Ver como empresa"** ← IMPORTANTE!

### Testando Impersonation ("Ver como empresa"):

1. Na tabela de empresas, encontre qualquer empresa (ID 1, 2, etc.)
2. Clique no botão **"Ver como empresa"** (amarelo/warning)
3. Aguarde 1-2 segundos
4. Você será redirecionado para `/dashboard`

✅ **Navbar mudou:**
- Logo "SaaS Campaign"
- Dashboard
- Campaigns
- Customers
- **Plans** ← Agora aparece "Plans" ao invés de "Super Admin"
- Sair

✅ **Você está vendo como a empresa vê:**
- Dashboard com dados apenas daquela empresa
- Campanhas apenas daquela empresa
- Clientes apenas daquela empresa
- Acesso ao painel de Planos

5. Navegue pelas páginas:
   - **Dashboard:** Ver métricas da empresa
   - **Campaigns:** Ver/criar campanhas da empresa
   - **Customers:** Ver/criar clientes da empresa
   - **Plans:** Ver planos disponíveis (se visibilidade estiver ativa)

6. **Importante:** Tente acessar http://localhost:8080/super-admin
   - ❌ Você NÃO deve conseguir acessar (redirecionado ou bloqueado)
   - Isso confirma que você está com permissões de empresa, não super admin

### Para sair da impersonation:

1. Clique em **"Sair"**
2. Você volta para a tela de login
3. Faça login novamente como `admin@local` / `Admin123!`
4. ✅ Navbar volta a mostrar **"Super Admin"**

---

## 2. Testando como Empresa

### Criar uma nova empresa (opcional):

**Via Super Admin:**
1. Faça login como super admin
2. Vá em "Super Admin"
3. (Se houver botão de criar empresa, use)

**OU usar empresa existente:**
- Após rodar o seed, há empresas demo no banco
- Você pode criar usuário via signup

### Login como Empresa:

**Opção 1: Usar impersonation (mais rápido)**
1. Login como super admin
2. Super Admin → "Ver como empresa"
3. Pronto! Você está como empresa

**Opção 2: Criar conta via signup**
1. Acesse http://localhost:8080/signup
2. Preencha:
   - Name: "Minha Empresa Teste"
   - Email: "empresa@teste.com"
   - Password: "Senha123!"
3. Clique em "Sign Up"
4. Sistema cria empresa e faz login automático

### O que você deve ver como Empresa:

✅ **Navbar:**
- Logo "SaaS Campaign"
- Dashboard
- Campaigns
- Customers
- **Plans** ← Empresas veem "Plans"
- Sair

❌ **Não verá:**
- Link "Super Admin"

### Testando funcionalidades da empresa:

**Dashboard:**
1. Ver métricas da empresa
2. Gráficos de campanhas
3. Estatísticas de clientes

**Campaigns:**
1. Clique em "Campaigns"
2. Criar nova campanha:
   - Tipo: Coupon ou Cashback
   - Nome, descrição
   - Configurações
3. Ver lista de campanhas criadas

**Customers:**
1. Clique em "Customers"
2. Adicionar novo cliente:
   - Nome, email, telefone
3. Importar CSV (opcional)
4. Ver lista de clientes

**Plans:**
1. Clique em "Plans"
2. Se visibilidade estiver ativa, você verá:
   - Lista de planos (Basic R$20, Standard R$50, Premium R$100)
   - Plano atual (se houver)
   - Botão para assinar/fazer upgrade
3. Se visibilidade estiver desativa:
   - Mensagem informando que planos não estão disponíveis

### Verificar restrições:

1. **Tentar acessar Super Admin:**
   - Digite manualmente: http://localhost:8080/super-admin
   - ❌ Você NÃO deve conseguir acessar
   - Deve ser redirecionado ou ver mensagem de erro

2. **Verificar escopo de dados:**
   - Campanhas: vê apenas suas campanhas
   - Clientes: vê apenas seus clientes
   - Dashboard: vê apenas suas métricas

---

## 3. Testando Toggle de Planos (Super Admin)

### Como Super Admin, controlar visibilidade de planos:

**Via API (Postman/curl):**

```bash
# Ver configuração atual
curl http://localhost:8080/api/v1/super-admin/settings \
  -H "Authorization: Bearer SEU_TOKEN_SUPER_ADMIN"

# Ocultar planos
curl -X PATCH http://localhost:8080/api/v1/super-admin/settings/plans_visible \
  -H "Authorization: Bearer SEU_TOKEN_SUPER_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"value": "false"}'

# Mostrar planos
curl -X PATCH http://localhost:8080/api/v1/super-admin/settings/plans_visible \
  -H "Authorization: Bearer SEU_TOKEN_SUPER_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"value": "true"}'
```

**Verificar como empresa:**
1. Faça login como empresa (ou use impersonation)
2. Vá em "Plans"
3. Se `plans_visible = true`: vê lista de planos
4. Se `plans_visible = false`: vê mensagem "Planos não disponíveis"

---

## 4. Checklist de Validação

### Super Admin ✅

- [ ] Login com admin@local / Admin123!
- [ ] Navbar mostra "Super Admin"
- [ ] Dashboard global com KPIs
- [ ] Acesso à página Super Admin
- [ ] Tabela de empresas carrega
- [ ] Botão "Ver como empresa" aparece
- [ ] Clicar em "Ver como empresa" → navbar muda para "Plans"
- [ ] Como empresa impersonada, não consegue acessar /super-admin
- [ ] Logout e re-login volta para navbar "Super Admin"

### Empresa ✅

- [ ] Login como empresa (signup ou impersonation)
- [ ] Navbar mostra "Plans" (não mostra "Super Admin")
- [ ] Dashboard mostra apenas dados da empresa
- [ ] Pode criar campanhas
- [ ] Pode criar clientes
- [ ] Acesso a "Plans" (quando habilitado)
- [ ] NÃO consegue acessar /super-admin
- [ ] Logout funciona corretamente

### Auth Flow ✅

- [ ] Após login, não pode voltar para /login (redireciona)
- [ ] Após logout, não pode acessar /dashboard (redireciona para /login)
- [ ] Botão "voltar" do navegador não permite re-entrar após logout
- [ ] Token JWT persiste em localStorage
- [ ] 401 Unauthorized limpa token e redireciona para login

### Impersonation ✅

- [ ] Super admin pode impersonar qualquer empresa
- [ ] Navbar muda de "Super Admin" → "Plans"
- [ ] Vê apenas dados da empresa impersonada
- [ ] Não consegue acessar /super-admin enquanto impersonando
- [ ] Logout limpa impersonation
- [ ] Re-login como super admin volta ao normal

---

## 5. Executar Testes E2E (Automáticos)

```powershell
# Rodar todos os 17 testes
docker compose run --rm tests

# Ver screenshots de falhas (se houver)
ls tests\selenium\screenshots

# Ver no VNC (navegador dos testes em tempo real)
# http://localhost:7900 (senha: secret)
```

**Resultado esperado:**
```
17 passing (1m)
```

---

## 6. Troubleshooting

### Problema: "Cannot connect to backend"
```powershell
# Verificar se backend está rodando
docker ps | Select-String backend

# Ver logs
docker logs projeto-backend-1 --tail 50

# Reiniciar
docker compose restart backend
```

### Problema: "401 Unauthorized"
```powershell
# Limpar localStorage do navegador
# F12 → Console → localStorage.clear()

# Fazer login novamente
```

### Problema: "Plans não aparecem"
```powershell
# Verificar se plans_visible está true
docker exec projeto-mysql-1 mysql -uroot -proot saas --execute="SELECT * FROM saas_settings WHERE setting_key='plans_visible';"

# Se estiver false, mudar para true
docker exec projeto-mysql-1 mysql -uroot -proot saas --execute="UPDATE saas_settings SET value='true' WHERE setting_key='plans_visible';"
```

### Resetar banco de dados
```powershell
docker compose down -v
docker compose up -d
# Aguardar 15 segundos para seed rodar
```

---

## 🎯 Resumo: Como Validar os 2 Perfis

1. **Login como Super Admin** (admin@local)
   - ✅ Ver "Super Admin" na navbar
   - ✅ Acessar página Super Admin
   - ✅ Ver KPIs globais
   - ✅ Clicar "Ver como empresa"

2. **Após impersonation**
   - ✅ Navbar muda para "Plans"
   - ✅ Vê dados apenas da empresa
   - ✅ Não acessa /super-admin

3. **Logout e re-login como super admin**
   - ✅ Volta para navbar "Super Admin"

4. **Login/signup como empresa**
   - ✅ Navbar tem "Plans" (não tem "Super Admin")
   - ✅ Vê apenas seus dados
   - ✅ Não acessa /super-admin

**Tudo funcionando = Sistema validado!** ✅
