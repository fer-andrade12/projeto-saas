import React, { useState, useEffect } from 'react';
import api from '../api/api';
import './PlansNew.css';

interface Plan {
  id: number;
  name: string;
  type: string;
  price: string;
  billing_period: string;
  description: string;
  max_campaigns: number | null;
  max_customers: number | null;
  max_emails_per_month: number | null;
  active: boolean;
}

interface Subscription {
  id: number;
  plan_id: number;
  status: string;
  plan?: Plan;
}

const PlansNew: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    type: 'basic',
    price: '0',
    billing_period: 'monthly',
    description: '',
    max_campaigns: '',
    max_customers: '',
    max_emails_per_month: '',
    active: true
  });

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Buscar role do usuário
        const userRes = await api.get('/auth/me');
        const role = userRes.data?.role || 'company';
        
        if (!isMounted) return;
        setUserRole(role);

        // Buscar planos
        const endpoint = role === 'super_admin' ? '/plans/admin/all' : '/plans';
        const plansRes = await api.get(endpoint);
        
        if (!isMounted) return;
        setPlans(plansRes.data || []);

        // Se for company, buscar assinatura atual
        if (role === 'company') {
          try {
            const subRes = await api.get('/plans/my-subscription');
            if (isMounted && subRes.data) {
              setCurrentSubscription(subRes.data);
            }
          } catch (err) {
            console.log('Sem assinatura ativa');
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        max_campaigns: formData.max_campaigns ? parseInt(formData.max_campaigns) : null,
        max_customers: formData.max_customers ? parseInt(formData.max_customers) : null,
        max_emails_per_month: formData.max_emails_per_month ? parseInt(formData.max_emails_per_month) : null
      };

      await api.post('/plans/admin', payload);
      setAlert({ type: 'success', message: 'Plano criado com sucesso!' });
      setShowCreateModal(false);
      
      // Recarregar planos
      const plansRes = await api.get('/plans/admin/all');
      setPlans(plansRes.data || []);
      
      // Reset form
      setFormData({
        name: '',
        type: 'basic',
        price: '0',
        billing_period: 'monthly',
        description: '',
        max_campaigns: '',
        max_customers: '',
        max_emails_per_month: '',
        active: true
      });
    } catch (error: any) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Erro ao criar plano' });
    }
  };

  const handleSubscribe = async (planId: number) => {
    try {
      await api.post('/plans/subscribe', { plan_id: planId });
      setAlert({ type: 'success', message: 'Assinatura realizada com sucesso!' });
      
      // Recarregar assinatura
      const subRes = await api.get('/plans/my-subscription');
      setCurrentSubscription(subRes.data);
    } catch (error: any) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Erro ao assinar plano' });
    }
  };

  const handleUpgrade = async (planId: number) => {
    try {
      await api.post('/plans/upgrade', { new_plan_id: planId });
      setAlert({ type: 'success', message: 'Upgrade realizado com sucesso!' });
      
      // Recarregar assinatura
      const subRes = await api.get('/plans/my-subscription');
      setCurrentSubscription(subRes.data);
    } catch (error: any) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Erro ao fazer upgrade' });
    }
  };

  const handleToggleActive = async (planId: number) => {
    try {
      await api.put(`/plans/admin/${planId}/toggle`);
      setAlert({ type: 'success', message: 'Status atualizado com sucesso!' });
      
      // Recarregar planos
      const plansRes = await api.get('/plans/admin/all');
      setPlans(plansRes.data || []);
    } catch (error: any) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Erro ao atualizar status' });
    }
  };

  const getPlanOrder = (type: string): number => {
    const order: { [key: string]: number } = { basic: 1, standard: 2, premium: 3 };
    return order[type] || 0;
  };

  const canUpgrade = (plan: Plan): boolean => {
    if (!currentSubscription?.plan) return true;
    const currentOrder = getPlanOrder(currentSubscription.plan.type);
    const planOrder = getPlanOrder(plan.type);
    return planOrder > currentOrder;
  };

  if (isLoading) {
    return (
      <div className="plans-new-container">
        <div className="loading">Carregando planos...</div>
      </div>
    );
  }

  return (
    <div className="plans-new-container">
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
          <button onClick={() => setAlert(null)}>×</button>
        </div>
      )}

      <div className="plans-header">
        <h1>{userRole === 'super_admin' ? 'Gerenciar Planos' : 'Nossos Planos'}</h1>
        <p>{userRole === 'super_admin' ? 'Crie e gerencie os planos de assinatura' : 'Escolha o melhor plano para seu negócio'}</p>
        
        {userRole === 'super_admin' && (
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            + Criar Novo Plano
          </button>
        )}
      </div>

      {currentSubscription && (
        <div className="current-subscription">
          <h3>📋 Plano Atual</h3>
          <div className="subscription-info">
            <strong>{currentSubscription.plan?.name}</strong>
            <span className={`status status-${currentSubscription.status}`}>
              {currentSubscription.status === 'active' ? 'Ativo' : currentSubscription.status}
            </span>
          </div>
        </div>
      )}

      <div className="plans-grid">
        {plans.map((plan) => {
          const isCurrentPlan = currentSubscription?.plan_id === plan.id;
          const canUpgradeThisPlan = canUpgrade(plan);
          
          return (
            <div key={plan.id} className={`plan-card ${isCurrentPlan ? 'current-plan' : ''}`}>
              <div className="plan-header">
                <h3>{plan.name}</h3>
                <span className={`plan-type type-${plan.type}`}>{plan.type}</span>
              </div>

              <div className="plan-price">
                <span className="currency">R$</span>
                <span className="value">{parseFloat(plan.price).toFixed(2)}</span>
                <span className="period">/{plan.billing_period === 'monthly' ? 'mês' : 'ano'}</span>
              </div>

              <p className="plan-description">{plan.description}</p>

              <div className="plan-features">
                <div className="feature">
                  <span className="icon">📊</span>
                  <span>Campanhas: {plan.max_campaigns || 'Ilimitadas'}</span>
                </div>
                <div className="feature">
                  <span className="icon">👥</span>
                  <span>Clientes: {plan.max_customers || 'Ilimitados'}</span>
                </div>
                <div className="feature">
                  <span className="icon">📧</span>
                  <span>Emails: {plan.max_emails_per_month || 'Ilimitados'}/mês</span>
                </div>
              </div>

              {userRole === 'super_admin' ? (
                <div className="admin-actions">
                  <button 
                    className={`btn-toggle ${plan.active ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleActive(plan.id)}
                  >
                    {plan.active ? '✓ Ativo' : '✗ Inativo'}
                  </button>
                </div>
              ) : (
                <div className="plan-actions">
                  {isCurrentPlan ? (
                    <button className="btn-current" disabled>
                      ✓ Plano Atual
                    </button>
                  ) : canUpgradeThisPlan ? (
                    <button 
                      className="btn-upgrade"
                      onClick={() => currentSubscription ? handleUpgrade(plan.id) : handleSubscribe(plan.id)}
                    >
                      {currentSubscription ? '⬆️ Fazer Upgrade' : '🚀 Assinar'}
                    </button>
                  ) : (
                    <button className="btn-downgrade" disabled>
                      Downgrade não permitido
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Criar Novo Plano</h2>
              <button onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreatePlan}>
              <div className="form-group">
                <label>Nome do Plano *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Plano Básico"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Período *</label>
                  <select
                    value={formData.billing_period}
                    onChange={(e) => setFormData({ ...formData, billing_period: e.target.value })}
                  >
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Preço (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Descrição *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva os benefícios do plano..."
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Max Campanhas</label>
                  <input
                    type="number"
                    value={formData.max_campaigns}
                    onChange={(e) => setFormData({ ...formData, max_campaigns: e.target.value })}
                    placeholder="Deixe vazio para ilimitado"
                  />
                </div>

                <div className="form-group">
                  <label>Max Clientes</label>
                  <input
                    type="number"
                    value={formData.max_customers}
                    onChange={(e) => setFormData({ ...formData, max_customers: e.target.value })}
                    placeholder="Deixe vazio para ilimitado"
                  />
                </div>

                <div className="form-group">
                  <label>Max Emails/mês</label>
                  <input
                    type="number"
                    value={formData.max_emails_per_month}
                    onChange={(e) => setFormData({ ...formData, max_emails_per_month: e.target.value })}
                    placeholder="Deixe vazio para ilimitado"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  Plano ativo
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Criar Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansNew;
