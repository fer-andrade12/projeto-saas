import React, { useState, useEffect } from 'react';
import api from '../api/api';

interface Plan {
  id: number;
  name: string;
  type: string;
  price: string;
  description: string;
  active: boolean;
}

const PlansSimple: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('PlansSimple - useEffect executado');
    let isMounted = true;

    const loadData = async () => {
      console.log('PlansSimple - Iniciando loadData');
      setIsLoading(true);
      setError(null);
      
      try {
        // Tenta obter role do usuário
        const userRes = await api.get('/auth/me');
        const role = userRes.data?.role || 'company';
        console.log('PlansSimple - Role:', role);

        // Carrega planos baseado no role
        const endpoint = role === 'super_admin' ? '/plans/admin/all' : '/plans';
        console.log('PlansSimple - Endpoint:', endpoint);
        
        const response = await api.get(endpoint);
        console.log('PlansSimple - Resposta recebida:', response.data);
        
        if (isMounted) {
          setPlans(response.data || []);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('PlansSimple - Erro:', err);
        if (isMounted) {
          setError(err.message || 'Erro ao carregar planos');
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      console.log('PlansSimple - Cleanup executado');
      isMounted = false;
    };
  }, []); // Sem dependências - executa apenas uma vez

  console.log('PlansSimple - Render:', { isLoading, plans: plans.length, error });

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Carregando planos...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Erro: {error}</div>;
  }

  return (
    <div style={{ padding: '20px', color: '#333' }}>
      <h1 style={{ color: '#fff', marginBottom: '10px' }}>Planos de Assinatura (Versão Simples)</h1>
      <p style={{ color: '#ccc', marginBottom: '30px' }}>Total: {plans.length} planos</p>
      
      {plans.length === 0 ? (
        <p style={{ color: '#fff' }}>Nenhum plano cadastrado</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {plans.map((plan) => (
            <div key={plan.id} style={{ 
              border: '2px solid #667eea', 
              borderRadius: '12px', 
              padding: '24px',
              backgroundColor: '#fff',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                color: '#667eea', 
                marginTop: '0', 
                marginBottom: '12px',
                fontSize: '24px',
                fontWeight: 'bold'
              }}>{plan.name}</h3>
              <p style={{ margin: '8px 0', color: '#555' }}>
                <strong style={{ color: '#333' }}>Tipo:</strong> {plan.type}
              </p>
              <p style={{ 
                margin: '12px 0', 
                color: '#667eea', 
                fontSize: '28px',
                fontWeight: 'bold'
              }}>R$ {plan.price}</p>
              <p style={{ 
                margin: '12px 0', 
                color: '#666',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>{plan.description}</p>
              <p style={{ margin: '12px 0 0 0', color: '#555' }}>
                <strong style={{ color: '#333' }}>Status:</strong> {plan.active ? '✅ Ativo' : '❌ Inativo'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlansSimple;
