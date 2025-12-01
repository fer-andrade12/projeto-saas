import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Input, Select, Badge, Alert } from '../components/ui';
import { useForm } from '../hooks/useForm';
import { usePagination, useSearch } from '../hooks/useApi';
import api from '../api/api';
import './Customers.css';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birth_date: string;
  gender?: string;
  created_at: string;
}

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birth_date: string;
  gender: string;
}

const Customers: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { page, limit, goToPage, changeLimit } = usePagination();
  const { searchTerm, debouncedSearchTerm, setSearchTerm } = useSearch();

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/customers?page=${page}&limit=${limit}&search=${debouncedSearchTerm}`);
      const data = response.data;
      setCustomers(data?.data || data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, debouncedSearchTerm]);

  const refetch = () => {
    loadCustomers();
  };

  const meta = { total: customers.length, page: 1, totalPages: 1 };

  const validateCustomer = (values: CustomerFormData) => {
    const errors: Record<string, string> = {};

    if (!values.name || values.name.length < 3) {
      errors.name = 'Nome deve ter no mínimo 3 caracteres';
    }

    if (!values.email) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = 'Email inválido';
    }

    if (!values.phone) {
      errors.phone = 'Telefone é obrigatório';
    }

    if (values.cpf && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(values.cpf) && !/^\d{11}$/.test(values.cpf)) {
      errors.cpf = 'CPF inválido (use formato: 000.000.000-00)';
    }

    return errors;
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit, resetForm, setValues } = useForm<CustomerFormData>({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      cpf: '',
      birth_date: '',
      gender: '',
    },
    validate: validateCustomer,
    onSubmit: async (formValues) => {
      try {
        if (editingCustomer) {
          await api.put(`/admin/customers/${editingCustomer.id}`, formValues);
          setAlert({ type: 'success', message: 'Cliente atualizado com sucesso!' });
        } else {
          await api.post('/admin/customers', formValues);
          setAlert({ type: 'success', message: 'Cliente cadastrado com sucesso!' });
        }
        closeModal();
        refetch();
      } catch (error: any) {
        setAlert({ type: 'error', message: error.response?.data?.message || 'Erro ao salvar cliente' });
      }
    },
  });

  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setValues({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        cpf: customer.cpf || '',
        birth_date: customer.birth_date ? customer.birth_date.split('T')[0] : '',
        gender: customer.gender || '',
      });
    } else {
      setEditingCustomer(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    resetForm();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;

    try {
      await api.delete(`/admin/customers/${id}`);
      setAlert({ type: 'success', message: 'Cliente excluído com sucesso!' });
      refetch();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Erro ao excluir cliente' });
    }
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csv = e.target?.result as string;
      setIsImporting(true);
      try {
        await api.post('/admin/customers/import', { csv });
        setAlert({ type: 'success', message: 'Clientes importados com sucesso!' });
        refetch();
      } catch (error: any) {
        setAlert({ type: 'error', message: error.response?.data?.message || 'Erro ao importar clientes' });
      } finally {
        setIsImporting(false);
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <div className="customers-page">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <Card
        title="Gerenciar Clientes"
        subtitle={`${meta.total} cliente(s) cadastrado(s)`}
        actions={
          <>
            <label htmlFor="csv-upload" style={{ margin: 0 }}>
              <Button
                variant="secondary"
                size="sm"
                icon={<span>📥</span>}
                isLoading={isImporting}
              >
                Importar CSV
              </Button>
            </label>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              style={{ display: 'none' }}
            />
            <Button
              variant="primary"
              size="sm"
              icon={<span>➕</span>}
              onClick={() => openModal()}
            >
              Novo Cliente
            </Button>
          </>
        }
      >
        <div className="customers-filters">
          <Input
            placeholder="Buscar por nome, email, CPF ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<span>🔍</span>}
          />
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        ) : customers.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">👥</span>
            <h3>Nenhum cliente encontrado</h3>
            <p>Comece cadastrando seu primeiro cliente ou importe via CSV</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>CPF</th>
                    <th>Nascimento</th>
                    <th>Gênero</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer: Customer) => (
                    <tr key={customer.id}>
                      <td className="customer-name">{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>{formatPhone(customer.phone)}</td>
                      <td>{formatCPF(customer.cpf)}</td>
                      <td>{customer.birth_date ? new Date(customer.birth_date).toLocaleDateString('pt-BR') : '-'}</td>
                      <td>
                        {customer.gender && (
                          <Badge variant="secondary" size="sm">
                            {customer.gender === 'M' ? 'Masculino' : customer.gender === 'F' ? 'Feminino' : 'Outro'}
                          </Badge>
                        )}
                      </td>
                      <td className="actions-cell">
                        <Button
                          variant="info"
                          size="sm"
                          onClick={() => openModal(customer)}
                          title="Editar"
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(customer.id)}
                          title="Excluir"
                        >
                          🗑️
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                    { value: 10, label: '10 por página' },
                    { value: 25, label: '25 por página' },
                    { value: 50, label: '50 por página' },
                    { value: 100, label: '100 por página' },
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
        title={editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
        size="lg"
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
              {editingCustomer ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <Input
              label="Nome Completo *"
              value={values.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              placeholder="João Silva"
            />

            <Input
              label="Email *"
              type="email"
              value={values.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              placeholder="joao@email.com"
            />

            <Input
              label="Telefone *"
              value={values.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={errors.phone}
              placeholder="(11) 99999-9999"
            />

            <Input
              label="CPF"
              value={values.cpf}
              onChange={(e) => handleChange('cpf', e.target.value)}
              error={errors.cpf}
              placeholder="000.000.000-00"
            />

            <Input
              label="Data de Nascimento"
              type="date"
              value={values.birth_date}
              onChange={(e) => handleChange('birth_date', e.target.value)}
              error={errors.birth_date}
            />

            <Select
              label="Gênero"
              value={values.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              options={[
                { value: '', label: 'Selecione' },
                { value: 'M', label: 'Masculino' },
                { value: 'F', label: 'Feminino' },
                { value: 'O', label: 'Outro' },
              ]}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;