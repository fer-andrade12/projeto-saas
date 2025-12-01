import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Input, Select, Badge, Alert, TextArea } from '../components/ui';
import { useForm } from '../hooks/useForm';
import api from '../api/api';
import './Plans.css';

interface Plan {
  id: number;
  name: string;
  type: string;
  price: number;
  billing_period: string;
  description: string;
  max_campaigns: number | null;
  max_customers: number | null;
  max_emails_per_month: number | null;
  active: boolean;
  trial_days: number;
  features: string[];
}

interface PlanFormData {
  name: string;
  type: string;
  price: string;
  billing_period: string;
  description: string;
  max_campaigns: string;
  max_customers: string;
  max_emails_per_month: string;
  trial_days: string;
  features: string;
  active: boolean;
}

const Plans: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchUserRoleAndPlans = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/auth/me');
        const role = res.data?.role || 'company';
        
        if (isMounted) {
          setUserRole(role);
        }

        const endpoint = role === 'super_admin' ? '/plans/admin/all' : '/plans';
        const response = await api.get(endpoint);
        
        if (isMounted) {
          setPlans(response.data || []);
        }
      } catch (error) {
        console.error('Erro ao carregar planos:', error);
        if (isMounted) {
          setPlans([]);
          setUserRole('company');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUserRoleAndPlans();

    return () => {
      isMounted = false;
    };
  }, []);

  const refetch = async () => {
    setIsLoading(true);
    try {
      const endpoint = userRole === 'super_admin' ? '/plans/admin/all' : '/plans';
      const response = await api.get(endpoint);
      setPlans(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  const validatePlan = (values: PlanFormData) => {
    const errors: Record<string, string> = {};

    if (!values.name || values.name.length < 3) {
      errors.name = 'Nome deve ter no mínimo 3 caracteres';
    }

    if (!values.description) {
      errors.description = 'Descrição é obrigatória';
    }

    if (!values.price || Number(values.price) < 0) {
      errors.price = 'Preço deve ser maior ou igual a zero';
    }

    if (values.max_campaigns && Number(values.max_campaigns) <= 0) {
      errors.max_campaigns = 'Limite de campanhas deve ser maior que zero';
    }

    if (values.max_customers && Number(values.max_customers) <= 0) {
      errors.max_customers = 'Limite de clientes deve ser maior que zero';
    }

    if (values.max_emails_per_month && Number(values.max_emails_per_month) <= 0) {
      errors.max_emails_per_month = 'Limite de emails deve ser maior que zero';
    }

    return errors;
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit, resetForm, setValues } = useForm<PlanFormData>({
    initialValues: {
      name: '',
      type: 'basic',
      price: '0',
      billing_period: 'monthly',
      description: '',
      max_campaigns: '',
      max_customers: '',
      max_emails_per_month: '',
      trial_days: '0',
      features: '',
      active: true,
    },
    validate: validatePlan,
    onSubmit: async (formValues) => {
      try {
        const payload: any = {
          name: formValues.name,
          type: formValues.type,
          price: Number(formValues.price),
          billing_period: formValues.billing_period,
          description: formValues.description,
          trial_days: Number(formValues.trial_days),
          active: formValues.active,
        };

        if (formValues.max_campaigns) payload.max_campaigns = Number(formValues.max_campaigns);
        if (formValues.max_customers) payload.max_customers = Number(formValues.max_customers);
        if (formValues.max_emails_per_month) payload.max_emails_per_month = Number(formValues.max_emails_per_month);
        
        if (formValues.features) {
          payload.features = formValues.features.split('\n').filter(f => f.trim());
        }

        if (editingPlan) {
          await api.put(`/plans/admin/${editingPlan.id}`, payload);
          setAlert({ type: 'success', message: 'Plano atualizado com sucesso!' });
        } else {
          await api.post('/plans/admin', payload);
          setAlert({ type: 'success', message: 'Plano criado com sucesso!' });
        }
        closeModal();
        refetch();
      } catch (error: any) {
        setAlert({ type: 'error', message: error.response?.data?.message || 'Erro ao salvar plano' });
      }
    },
  });

  const openModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setValues({
        name: plan.name,
        type: plan.type,
        price: plan.price.toString(),
        billing_period: plan.billing_period,
        description: plan.description,
        max_campaigns: plan.max_campaigns?.toString() || '',
        max_customers: plan.max_customers?.toString() || '',
        max_emails_per_month: plan.max_emails_per_month?.toString() || '',
        trial_days: plan.trial_days?.toString() || '0',
        features: plan.features?.join('\n') || '',
        active: plan.active,
      });
    } else {
      setEditingPlan(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
    resetForm();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este plano?')) return;

    try {
      await api.delete(`/plans/admin/${id}`);
      setAlert({ type: 'success', message: 'Plano excluído com sucesso!' });
      refetch();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Erro ao excluir plano' });
    }
  };

  const handleToggleStatus = async (plan: Plan) => {
    try {
      await api.put(`/plans/admin/${plan.id}/toggle`);
      setAlert({ type: 'success', message: `Plano ${!plan.active ? 'ativado' : 'desativado'} com sucesso!` });
      refetch();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Erro ao alterar status' });
    }
  };

  const getPlanTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      basic: 'Básico',
      professional: 'Profissional',
      enterprise: 'Enterprise',
    };
    return types[type] || type;
  };

  const getPlanTypeVariant = (type: string): any => {
    const variants: Record<string, any> = {
      basic: 'info',
      professional: 'primary',
      enterprise: 'success',
    };
    return variants[type] || 'secondary';
  };

  const getBillingLabel = (period: string) => {
    const labels: Record<string, string> = {
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      semiannual: 'Semestral',
      annual: 'Anual',
    };
    return labels[period] || period;
  };

  const formatPrice = (price: number, period: string) => {
    if (price === 0) return 'Grátis';
    return `R$ ${price.toFixed(2)}/${getBillingLabel(period)}`;
  };

  return (
    <div className="plans-page">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <Card
        title="Gerenciar Planos de Assinatura"
        subtitle={`${plans.length} plano(s) disponível(is)`}
        actions={
          userRole === 'super_admin' && (
            <Button
              variant="primary"
              size="sm"
              icon={<span>➕</span>}
              onClick={() => openModal()}
            >
              Novo Plano
            </Button>
          )
        }
      >
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        ) : plans.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📦</span>
            <h3>Nenhum plano cadastrado</h3>
            <p>Crie planos de assinatura para sua plataforma</p>
          </div>
        ) : (
          <div className="plans-grid">
            {plans.map((plan: Plan) => (
              <div key={plan.id} className={`plan-card ${!plan.active ? 'plan-inactive' : ''}`}>
                <div className="plan-header">
                  <div className="plan-type">
                    <Badge variant={getPlanTypeVariant(plan.type)}>
                      {getPlanTypeLabel(plan.type)}
                    </Badge>
                    <Badge variant={plan.active ? 'success' : 'danger'} size="sm">
                      {plan.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-price">
                    {plan.price === 0 ? (
                      <span className="price-free">GRÁTIS</span>
                    ) : (
                      <>
                        <span className="price-currency">R$</span>
                        <span className="price-value">{plan.price.toFixed(2)}</span>
                        <span className="price-period">/{getBillingLabel(plan.billing_period)}</span>
                      </>
                    )}
                  </div>
                  {plan.trial_days > 0 && (
                    <div className="plan-trial">
                      🎁 {plan.trial_days} dias grátis
                    </div>
                  )}
                </div>

                <div className="plan-description">
                  <p>{plan.description}</p>
                </div>

                <div className="plan-limits">
                  <h4>Limites do Plano</h4>
                  <ul>
                    <li>
                      <span className="limit-icon">🎯</span>
                      <span className="limit-label">Campanhas:</span>
                      <span className="limit-value">{plan.max_campaigns || '∞'}</span>
                    </li>
                    <li>
                      <span className="limit-icon">👥</span>
                      <span className="limit-label">Clientes:</span>
                      <span className="limit-value">{plan.max_customers || '∞'}</span>
                    </li>
                    <li>
                      <span className="limit-icon">📧</span>
                      <span className="limit-label">Emails/mês:</span>
                      <span className="limit-value">{plan.max_emails_per_month || '∞'}</span>
                    </li>
                  </ul>
                </div>

                {plan.features && plan.features.length > 0 && (
                  <div className="plan-features">
                    <h4>Recursos Inclusos</h4>
                    <ul>
                      {plan.features.map((feature, index) => (
                        <li key={index}>
                          <span className="feature-icon">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {userRole === 'super_admin' && (
                  <div className="plan-actions">
                    <Button
                      variant={plan.active ? 'warning' : 'success'}
                      size="sm"
                      onClick={() => handleToggleStatus(plan)}
                      title={plan.active ? 'Desativar' : 'Ativar'}
                    >
                      {plan.active ? '⏸️ Desativar' : '▶️ Ativar'}
                    </Button>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => openModal(plan)}
                      title="Editar"
                    >
                      ✏️ Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(plan.id)}
                      title="Excluir"
                    >
                      🗑️ Excluir
                    </Button>
                  </div>
                )}

                {userRole !== 'super_admin' && (
                  <div className="plan-actions">
                    <Button variant="primary" size="md" style={{ width: '100%' }}>
                      Assinar Plano
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingPlan ? 'Editar Plano' : 'Novo Plano'}
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              {editingPlan ? 'Atualizar' : 'Criar Plano'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <Input
              label="Nome do Plano *"
              value={values.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              placeholder="Plano Profissional"
            />

            <Select
              label="Tipo de Plano *"
              value={values.type}
              onChange={(e) => handleChange('type', e.target.value)}
              options={[
                { value: 'basic', label: 'Básico' },
                { value: 'professional', label: 'Profissional' },
                { value: 'enterprise', label: 'Enterprise' },
              ]}
            />

            <Input
              label="Preço (R$) *"
              type="number"
              step="0.01"
              min="0"
              value={values.price}
              onChange={(e) => handleChange('price', e.target.value)}
              error={errors.price}
              placeholder="99.90"
            />

            <Select
              label="Período de Cobrança *"
              value={values.billing_period}
              onChange={(e) => handleChange('billing_period', e.target.value)}
              options={[
                { value: 'monthly', label: 'Mensal' },
                { value: 'quarterly', label: 'Trimestral' },
                { value: 'semiannual', label: 'Semestral' },
                { value: 'annual', label: 'Anual' },
              ]}
            />

            <Input
              label="Dias de Teste Grátis"
              type="number"
              min="0"
              value={values.trial_days}
              onChange={(e) => handleChange('trial_days', e.target.value)}
              placeholder="7"
              hint="0 = sem período de teste"
            />

            <div style={{ gridColumn: '1 / -1' }}>
              <TextArea
                label="Descrição *"
                value={values.description}
                onChange={(e) => handleChange('description', e.target.value)}
                error={errors.description}
                placeholder="Descreva o plano e seus benefícios..."
                rows={3}
              />
            </div>

            <h4 style={{ gridColumn: '1 / -1', margin: '16px 0 0', fontSize: '1.1rem', fontWeight: 600 }}>
              Limites do Plano
            </h4>

            <Input
              label="Máximo de Campanhas"
              type="number"
              min="1"
              value={values.max_campaigns}
              onChange={(e) => handleChange('max_campaigns', e.target.value)}
              error={errors.max_campaigns}
              placeholder="Deixe vazio para ilimitado"
            />

            <Input
              label="Máximo de Clientes"
              type="number"
              min="1"
              value={values.max_customers}
              onChange={(e) => handleChange('max_customers', e.target.value)}
              error={errors.max_customers}
              placeholder="Deixe vazio para ilimitado"
            />

            <Input
              label="Máximo de Emails/Mês"
              type="number"
              min="1"
              value={values.max_emails_per_month}
              onChange={(e) => handleChange('max_emails_per_month', e.target.value)}
              error={errors.max_emails_per_month}
              placeholder="Deixe vazio para ilimitado"
            />

            <div style={{ gridColumn: '1 / -1' }}>
              <TextArea
                label="Recursos (um por linha)"
                value={values.features}
                onChange={(e) => handleChange('features', e.target.value)}
                placeholder="Suporte prioritário&#10;Relatórios avançados&#10;API personalizada"
                rows={5}
                hint="Digite um recurso por linha"
              />
            </div>

            <div className="checkbox-field" style={{ gridColumn: '1 / -1' }}>
              <label>
                <input
                  type="checkbox"
                  checked={values.active}
                  onChange={(e) => handleChange('active', e.target.checked)}
                />
                <span style={{ marginLeft: '8px' }}>Plano ativo (disponível para assinatura)</span>
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Plans;
