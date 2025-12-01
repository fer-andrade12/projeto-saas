import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Input, Select, Badge, Alert, TextArea } from '../components/ui';
import { useForm } from '../hooks/useForm';
import { usePagination, useSearch } from '../hooks/useApi';
import api from '../api/api';
import './Campaigns.css';

interface Campaign {
  id: number;
  name: string;
  description: string;
  type: 'coupon' | 'cashback' | 'coupon_cashback';
  discount_percent: number | null;
  cashback_value: string | null;
  start_date: string;
  end_date: string;
  active: boolean;
  total_coupons: number;
  redeemed_coupons: number;
  total_available: number;
  created_at: string;
}

interface CampaignFormData {
  name: string;
  description: string;
  type: string;
  discount_percent: string;
  cashback_value: string;
  start_date: string;
  end_date: string;
  total_available: string;
  active: boolean;
}

const Campaigns: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { page, limit, goToPage, changeLimit } = usePagination();
  const { searchTerm, debouncedSearchTerm, setSearchTerm } = useSearch();

  useEffect(() => {
    let isMounted = true;
    
    const loadCampaigns = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/admin/campaigns?page=${page}&limit=${limit}&search=${debouncedSearchTerm}`);
        const data = response.data;
        if (isMounted) {
          setCampaigns(data?.data || data || []);
        }
      } catch (error) {
        console.error('Erro ao carregar campanhas:', error);
        if (isMounted) {
          setCampaigns([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCampaigns();
    
    return () => {
      isMounted = false;
    };
  }, [page, limit, debouncedSearchTerm]);

  const refetch = () => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/admin/campaigns?page=${page}&limit=${limit}&search=${debouncedSearchTerm}`);
        const data = response.data;
        setCampaigns(data?.data || data || []);
      } catch (error) {
        console.error('Erro ao carregar campanhas:', error);
        setCampaigns([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  };
  
  // Apply filters
  let filteredCampaigns = campaigns;
  if (filterStatus !== 'all') {
    filteredCampaigns = filteredCampaigns.filter((c: Campaign) => 
      filterStatus === 'active' ? c.active : !c.active
    );
  }
  
  if (filterType !== 'all') {
    filteredCampaigns = filteredCampaigns.filter((c: Campaign) => c.type === filterType);
  }

  const meta = { total: filteredCampaigns.length, page: 1, totalPages: 1 };

  const validateCampaign = (values: CampaignFormData) => {
    const errors: Record<string, string> = {};

    if (!values.name || values.name.length < 3) {
      errors.name = 'Nome deve ter no mínimo 3 caracteres';
    }

    if (!values.description) {
      errors.description = 'Descrição é obrigatória';
    }

    if (!values.type) {
      errors.type = 'Tipo de campanha é obrigatório';
    }

    if (values.type === 'coupon' || values.type === 'coupon_cashback') {
      if (!values.discount_percent || Number(values.discount_percent) <= 0 || Number(values.discount_percent) > 100) {
        errors.discount_percent = 'Desconto deve ser entre 1 e 100%';
      }
    }

    if (values.type === 'cashback' || values.type === 'coupon_cashback') {
      if (!values.cashback_value || Number(values.cashback_value) <= 0) {
        errors.cashback_value = 'Valor do cashback deve ser maior que zero';
      }
    }

    if (!values.start_date) {
      errors.start_date = 'Data de início é obrigatória';
    }

    if (!values.end_date) {
      errors.end_date = 'Data de término é obrigatória';
    }

    if (values.start_date && values.end_date && new Date(values.start_date) >= new Date(values.end_date)) {
      errors.end_date = 'Data de término deve ser posterior à data de início';
    }

    if (!values.total_available || Number(values.total_available) <= 0) {
      errors.total_available = 'Quantidade disponível deve ser maior que zero';
    }

    return errors;
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit, resetForm, setValues } = useForm<CampaignFormData>({
    initialValues: {
      name: '',
      description: '',
      type: 'coupon',
      discount_percent: '',
      cashback_value: '',
      start_date: '',
      end_date: '',
      total_available: '100',
      active: true,
    },
    validate: validateCampaign,
    onSubmit: async (formValues) => {
      try {
        const payload: any = {
          name: formValues.name,
          description: formValues.description,
          type: formValues.type,
          start_date: formValues.start_date,
          end_date: formValues.end_date,
          total_available: Number(formValues.total_available),
          active: formValues.active,
        };

        if (formValues.type === 'coupon' || formValues.type === 'coupon_cashback') {
          payload.discount_percent = Number(formValues.discount_percent);
        }

        if (formValues.type === 'cashback' || formValues.type === 'coupon_cashback') {
          payload.cashback_value = formValues.cashback_value;
        }

        if (editingCampaign) {
          await api.put(`/admin/campaigns/${editingCampaign.id}`, payload);
          setAlert({ type: 'success', message: 'Campanha atualizada com sucesso!' });
        } else {
          await api.post('/admin/campaigns', payload);
          setAlert({ type: 'success', message: 'Campanha criada com sucesso!' });
        }
        closeModal();
        refetch();
      } catch (error: any) {
        setAlert({ type: 'error', message: error.response?.data?.message || 'Erro ao salvar campanha' });
      }
    },
  });

  const openModal = (campaign?: Campaign) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setValues({
        name: campaign.name,
        description: campaign.description,
        type: campaign.type,
        discount_percent: campaign.discount_percent?.toString() || '',
        cashback_value: campaign.cashback_value || '',
        start_date: campaign.start_date.split('T')[0],
        end_date: campaign.end_date.split('T')[0],
        total_available: campaign.total_available.toString(),
        active: campaign.active,
      });
    } else {
      setEditingCampaign(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCampaign(null);
    resetForm();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta campanha?')) return;

    try {
      await api.delete(`/admin/campaigns/${id}`);
      setAlert({ type: 'success', message: 'Campanha excluída com sucesso!' });
      refetch();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Erro ao excluir campanha' });
    }
  };

  const handleToggleStatus = async (campaign: Campaign) => {
    try {
      await api.put(`/admin/campaigns/${campaign.id}`, { ...campaign, active: !campaign.active });
      setAlert({ type: 'success', message: `Campanha ${!campaign.active ? 'ativada' : 'desativada'} com sucesso!` });
      refetch();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Erro ao alterar status' });
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await api.post(`/admin/campaigns/${id}/duplicate`);
      setAlert({ type: 'success', message: 'Campanha duplicada com sucesso!' });
      refetch();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Erro ao duplicar campanha' });
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      coupon: 'Cupom',
      cashback: 'Cashback',
      coupon_cashback: 'Cupom + Cashback',
    };
    return types[type] || type;
  };

  const getTypeVariant = (type: string) => {
    const variants: Record<string, any> = {
      coupon: 'primary',
      cashback: 'success',
      coupon_cashback: 'warning',
    };
    return variants[type] || 'secondary';
  };

  return (
    <div className="campaigns-page">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <Card
        title="Gerenciar Campanhas"
        subtitle={`${meta.total} campanha(s) cadastrada(s)`}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<span>➕</span>}
            onClick={() => openModal()}
          >
            Nova Campanha
          </Button>
        }
      >
        <div className="campaigns-filters">
          <Input
            placeholder="Buscar por nome ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<span>🔍</span>}
          />
          
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            options={[
              { value: 'all', label: 'Todos os tipos' },
              { value: 'coupon', label: 'Cupom' },
              { value: 'cashback', label: 'Cashback' },
              { value: 'coupon_cashback', label: 'Cupom + Cashback' },
            ]}
          />

          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'Todos os status' },
              { value: 'active', label: 'Ativas' },
              { value: 'inactive', label: 'Inativas' },
            ]}
          />
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎯</span>
            <h3>Nenhuma campanha encontrada</h3>
            <p>Comece criando sua primeira campanha promocional</p>
          </div>
        ) : (
          <>
            <div className="campaigns-grid">
              {filteredCampaigns.map((campaign: Campaign) => (
                <div key={campaign.id} className="campaign-card">
                  <div className="campaign-header">
                    <div>
                      <h4 className="campaign-title">{campaign.name}</h4>
                      <p className="campaign-description">{campaign.description}</p>
                    </div>
                    <Badge variant={getTypeVariant(campaign.type)}>
                      {getTypeLabel(campaign.type)}
                    </Badge>
                  </div>

                  <div className="campaign-details">
                    {campaign.discount_percent && (
                      <div className="detail-item">
                        <span className="detail-icon">💳</span>
                        <span className="detail-label">Desconto:</span>
                        <span className="detail-value">{campaign.discount_percent}%</span>
                      </div>
                    )}
                    
                    {campaign.cashback_value && (
                      <div className="detail-item">
                        <span className="detail-icon">💰</span>
                        <span className="detail-label">Cashback:</span>
                        <span className="detail-value">R$ {campaign.cashback_value}</span>
                      </div>
                    )}

                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <span className="detail-label">Período:</span>
                      <span className="detail-value">
                        {new Date(campaign.start_date).toLocaleDateString('pt-BR')} - {new Date(campaign.end_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-icon">🎟️</span>
                      <span className="detail-label">Cupons:</span>
                      <span className="detail-value">{campaign.redeemed_coupons} / {campaign.total_available}</span>
                    </div>
                  </div>

                  <div className="campaign-footer">
                    <Badge variant={campaign.active ? 'success' : 'danger'} size="sm">
                      {campaign.active ? '✓ Ativa' : '✗ Inativa'}
                    </Badge>

                    <div className="campaign-actions">
                      <Button
                        variant={campaign.active ? 'warning' : 'success'}
                        size="sm"
                        onClick={() => handleToggleStatus(campaign)}
                        title={campaign.active ? 'Desativar' : 'Ativar'}
                      >
                        {campaign.active ? '⏸️' : '▶️'}
                      </Button>
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => openModal(campaign)}
                        title="Editar"
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDuplicate(campaign.id)}
                        title="Duplicar"
                      >
                        📋
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(campaign.id)}
                        title="Excluir"
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {meta.totalPages > 1 && (
              <div className="pagination-controls">
                <div className="pagination-info">
                  Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, meta.total)} de {meta.total}
                </div>
                <div className="pagination-buttons">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                  >
                    ← Anterior
                  </Button>
                  <span className="page-indicator">Página {page} de {meta.totalPages}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(page + 1)}
                    disabled={page === meta.totalPages}
                  >
                    Próximo →
                  </Button>
                </div>
                <Select
                  value={limit}
                  onChange={(e) => changeLimit(Number(e.target.value))}
                  options={[
                    { value: 6, label: '6 por página' },
                    { value: 12, label: '12 por página' },
                    { value: 24, label: '24 por página' },
                  ]}
                />
              </div>
            )}
          </>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCampaign ? 'Editar Campanha' : 'Nova Campanha'}
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
              {editingCampaign ? 'Atualizar' : 'Criar Campanha'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div style={{ gridColumn: '1 / -1' }}>
              <Input
                label="Nome da Campanha *"
                value={values.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={errors.name}
                placeholder="Black Friday 2025"
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <TextArea
                label="Descrição *"
                value={values.description}
                onChange={(e) => handleChange('description', e.target.value)}
                error={errors.description}
                placeholder="Descreva os detalhes e regras da campanha..."
                rows={3}
              />
            </div>

            <Select
              label="Tipo de Campanha *"
              value={values.type}
              onChange={(e) => handleChange('type', e.target.value)}
              error={errors.type}
              options={[
                { value: 'coupon', label: 'Cupom de Desconto' },
                { value: 'cashback', label: 'Cashback' },
                { value: 'coupon_cashback', label: 'Cupom + Cashback' },
              ]}
            />

            {(values.type === 'coupon' || values.type === 'coupon_cashback') && (
              <Input
                label="Desconto (%)*"
                type="number"
                min="1"
                max="100"
                value={values.discount_percent}
                onChange={(e) => handleChange('discount_percent', e.target.value)}
                error={errors.discount_percent}
                placeholder="50"
              />
            )}

            {(values.type === 'cashback' || values.type === 'coupon_cashback') && (
              <Input
                label="Valor Cashback (R$) *"
                type="number"
                step="0.01"
                min="0.01"
                value={values.cashback_value}
                onChange={(e) => handleChange('cashback_value', e.target.value)}
                error={errors.cashback_value}
                placeholder="50.00"
              />
            )}

            <Input
              label="Data de Início *"
              type="date"
              value={values.start_date}
              onChange={(e) => handleChange('start_date', e.target.value)}
              error={errors.start_date}
            />

            <Input
              label="Data de Término *"
              type="date"
              value={values.end_date}
              onChange={(e) => handleChange('end_date', e.target.value)}
              error={errors.end_date}
            />

            <Input
              label="Quantidade Disponível *"
              type="number"
              min="1"
              value={values.total_available}
              onChange={(e) => handleChange('total_available', e.target.value)}
              error={errors.total_available}
              placeholder="100"
            />

            <div className="checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={values.active}
                  onChange={(e) => handleChange('active', e.target.checked)}
                />
                <span style={{ marginLeft: '8px' }}>Campanha ativa</span>
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Campaigns;
