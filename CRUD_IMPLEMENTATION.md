# Sistema de Gerenciamento de Campanhas - CRUD Completo

## 🎯 Funcionalidades Implementadas

### ✅ Componentes UI Profissionais

Biblioteca completa de componentes reutilizáveis localizados em `frontend/src/components/ui/`:

- **Button**: Botões com variantes (primary, secondary, success, danger, warning, info, outline), tamanhos e estados de loading
- **Input**: Campos de entrada com labels, validação, ícones e hints
- **TextArea**: Área de texto com validação
- **Select**: Dropdown com opções customizáveis
- **Modal**: Modais responsivos com header, body, footer e tamanhos configuráveis
- **Card**: Cards com título, subtítulo e ações
- **Badge**: Tags coloridas para status e categorias
- **Alert**: Alertas de sucesso, erro, warning e info com fechamento

### ✅ Hooks Customizados

Hooks utilitários em `frontend/src/hooks/`:

- **useForm**: Gerenciamento de formulários com validação integrada
- **useApi**: Requisições HTTP com estados de loading e erro
- **usePagination**: Controle de paginação
- **useSearch**: Busca com debounce automático

### ✅ CRUD de Clientes

**Localização**: `frontend/src/pages/Customers.tsx`

**Funcionalidades**:
- ✅ Listagem de clientes com paginação
- ✅ Busca em tempo real (nome, email, CPF, telefone)
- ✅ Criação de novos clientes via formulário
- ✅ Edição de clientes existentes
- ✅ Exclusão de clientes com confirmação
- ✅ Importação em massa via CSV
- ✅ Validação de campos (email, CPF, telefone)
- ✅ Formatação automática (CPF, telefone)
- ✅ Filtros e ordenação
- ✅ Estados vazios elegantes

**Campos do formulário**:
- Nome completo *
- Email *
- Telefone *
- CPF
- Data de nascimento
- Gênero

### ✅ CRUD de Campanhas

**Localização**: `frontend/src/pages/Campaigns.tsx`

**Funcionalidades**:
- ✅ Visualização em grid cards responsivo
- ✅ Filtros por tipo (Cupom, Cashback, Cupom+Cashback)
- ✅ Filtros por status (Ativa/Inativa)
- ✅ Busca por nome e descrição
- ✅ Criação de campanhas com validação completa
- ✅ Edição de campanhas existentes
- ✅ Duplicação de campanhas
- ✅ Ativação/Desativação rápida
- ✅ Exclusão com confirmação
- ✅ Visualização de métricas (cupons resgatados/disponíveis)
- ✅ Validação de datas (término > início)

**Tipos de campanha**:
1. **Cupom**: Desconto percentual (1-100%)
2. **Cashback**: Valor em dinheiro
3. **Cupom + Cashback**: Combinação de ambos

**Campos do formulário**:
- Nome da campanha *
- Descrição *
- Tipo (Cupom/Cashback/Misto) *
- Desconto percentual (se aplicável)
- Valor cashback (se aplicável)
- Data de início *
- Data de término *
- Quantidade disponível *
- Status ativo/inativo

### ✅ CRUD de Planos

**Localização**: `frontend/src/pages/Plans.tsx`

**Funcionalidades**:
- ✅ Visualização em cards estilo pricing
- ✅ Criação de planos (apenas super_admin)
- ✅ Edição de planos existentes
- ✅ Ativação/Desativação de planos
- ✅ Exclusão de planos
- ✅ Configuração de limites por plano
- ✅ Recursos customizáveis (features)
- ✅ Período de teste gratuito
- ✅ Múltiplos ciclos de cobrança

**Tipos de plano**:
- Básico
- Profissional
- Enterprise

**Períodos de cobrança**:
- Mensal
- Trimestral
- Semestral
- Anual

**Limites configuráveis**:
- Máximo de campanhas
- Máximo de clientes
- Máximo de emails por mês

**Campos do formulário**:
- Nome do plano *
- Tipo *
- Preço (R$) *
- Período de cobrança *
- Descrição *
- Dias de teste grátis
- Limites (campanhas, clientes, emails)
- Recursos inclusos (lista)
- Status ativo/inativo

## 🎨 Design System

### Cores Principais
- **Primary**: Gradiente roxo (#667eea → #764ba2)
- **Success**: Gradiente verde (#11998e → #38ef7d)
- **Danger**: Gradiente vermelho (#eb3349 → #f45c43)
- **Warning**: Gradiente rosa (#f093fb → #f5576c)
- **Info**: Gradiente azul (#4facfe → #00f2fe)

### Tipografia
- **Fonte**: Inter (Google Fonts)
- **Pesos**: 400, 500, 600, 700, 800, 900

### Efeitos
- Animações suaves com `cubic-bezier`
- Hover states com `transform: translateY(-2px)`
- Box shadows dinâmicas
- Transições de 0.3s

## 📱 Responsividade

Todas as interfaces são totalmente responsivas com breakpoints:
- **Desktop**: > 1024px (grid de 3 colunas)
- **Tablet**: 768px - 1024px (grid de 2 colunas)
- **Mobile**: < 768px (grid de 1 coluna)

## 🔐 Validações

### Clientes
- Email: formato válido
- CPF: formato 000.000.000-00 ou 11 dígitos
- Telefone: obrigatório
- Nome: mínimo 3 caracteres

### Campanhas
- Desconto: 1-100% (para cupons)
- Cashback: > 0 (para cashback)
- Data término > Data início
- Quantidade disponível > 0

### Planos
- Nome: mínimo 3 caracteres
- Preço: >= 0
- Limites: > 0 ou vazio (ilimitado)

## 🚀 Como Usar

### Instalar dependências
```bash
cd frontend
npm install
```

### Executar em desenvolvimento
```bash
npm run dev
```

### Build para produção
```bash
npm run build
```

## 📂 Estrutura de Arquivos

```
frontend/src/
├── components/
│   └── ui/
│       ├── Button.tsx / Button.css
│       ├── Input.tsx / Input.css
│       ├── Modal.tsx / Modal.css
│       ├── Card.tsx / Card.css
│       ├── Badge.tsx / Badge.css
│       ├── Alert.tsx / Alert.css
│       └── index.ts
├── hooks/
│   ├── useForm.ts
│   └── useApi.ts
├── pages/
│   ├── Customers.tsx / Customers.css
│   ├── Campaigns.tsx / Campaigns.css
│   └── Plans.tsx / Plans.css
├── App.tsx / App.css
└── index.css
```

## 🎯 Próximos Passos Sugeridos

1. **Dashboard Analytics**: Gráficos de performance das campanhas
2. **Relatórios**: Export PDF/Excel de clientes e campanhas
3. **Notificações**: Sistema de alertas em tempo real
4. **Temas**: Dark mode / Light mode
5. **Permissões**: Controle granular por módulo
6. **Auditoria**: Log de ações dos usuários
7. **Webhooks**: Integração com sistemas externos
8. **Templates**: Templates de campanhas pré-configurados

## 👨‍💻 Desenvolvedor

**Fernando Andrade**  
Projeto PEX - Faculdade Descomplica  
Empresa: TISOLVE LTDA  
CNPJ: 42.314.060/0001-15

## 📝 Licença

Este projeto foi desenvolvido como parte do Projeto Extensionista (PEX) da Faculdade Descomplica.
